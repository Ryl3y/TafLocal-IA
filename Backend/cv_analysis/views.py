"""
Vues d'analyse de CV pour TafLocal AI.
"""

from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ai.services import CVAnalysisService
from authentication.permissions import IsCandidate
from common.storage import private_file_response
from common.throttling import AIRateThrottle
from users.models import UserRole, get_candidate_profile

from .models import CV, AnalysisStatus, CVAnalysis
from .serializers import CVAnalysisSerializer, CVSerializer, CVUploadSerializer


def visible_cv_filter(user, prefix=""):
    """Filtre des CV visibles : le candidat voit les siens, l'entreprise uniquement les CV
    joints à une candidature sur ses offres (pas les autres CV du candidat), l'admin tout."""
    if user.role == UserRole.ADMIN:
        return {}
    if user.role == UserRole.CANDIDATE:
        return {f"{prefix}candidate__user": user}
    if user.role == UserRole.COMPANY:
        return {f"{prefix}applications__offre__entreprise__user": user}
    return None


class CVViewSet(viewsets.ModelViewSet):
    """Gestion des CV (upload, liste, suppression, analyse)."""

    queryset = CV.objects.select_related("candidate__user", "analysis").all()
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ["uploaded_at"]
    ordering = ["-uploaded_at"]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_serializer_class(self):
        if self.action == "create":
            return CVUploadSerializer
        return CVSerializer

    def get_permissions(self):
        if self.action in ["create", "destroy", "analyze"]:
            return [IsCandidate()]
        return [IsAuthenticated()]

    def get_throttles(self):
        if self.action in ["create", "analyze"]:
            return [*super().get_throttles(), AIRateThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        filters = visible_cv_filter(self.request.user)
        if filters is None:
            return CV.objects.none()
        return super().get_queryset().filter(**filters).distinct()

    def perform_create(self, serializer):
        file = serializer.validated_data["file"]
        cv = serializer.save(
            candidate=get_candidate_profile(self.request.user),
            file_name=file.name[:255],
            file_size=file.size,
            file_type=(getattr(file, "content_type", "") or "")[:50],
        )
        # Analyse locale immédiate (ou via Celery si AI_USE_CELERY=True).
        CVAnalysisService.analyze_async_or_sync(cv)

    def perform_destroy(self, instance):
        # Un recruteur doit pouvoir consulter le CV reçu : on ne supprime pas un CV joint
        # à une candidature encore active.
        if instance.applications.exclude(statut="WITHDRAWN").exists():
            raise ValidationError(
                "Ce CV est joint à une candidature en cours : retirez d'abord la candidature pour le supprimer."
            )
        storage, name = instance.file.storage, instance.file.name
        instance.applications.update(cv=None)  # candidatures retirées : on détache le CV
        instance.delete()
        if name and storage.exists(name):
            storage.delete(name)

    @extend_schema(responses=CVAnalysisSerializer, description="Relancer l'analyse IA du CV.")
    @action(detail=True, methods=["post"])
    def analyze(self, request, pk=None):
        """Déclencher (ou relancer) l'analyse du CV par rapport aux offres publiées."""
        cv = self.get_object()
        analysis = CVAnalysisService.analyze(cv)
        data = CVAnalysisSerializer(analysis, context={"request": request}).data
        if analysis.status == AnalysisStatus.COMPLETED:
            return Response(data)
        # Sans offre publiée il n'y a pas d'analyse (409) ; un fichier illisible donne 422.
        http_status = (
            status.HTTP_409_CONFLICT if analysis.status == AnalysisStatus.NO_OFFERS
            else status.HTTP_422_UNPROCESSABLE_ENTITY
        )
        return Response({**data, "detail": analysis.error_message}, status=http_status)

    @extend_schema(
        responses={(200, "application/octet-stream"): bytes},
        description="Télécharger le fichier du CV (candidat propriétaire, entreprise destinataire d'une candidature, administrateur).",
    )
    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        # get_object() applique le filtre de visibilité : un tiers obtient une 404.
        cv = self.get_object()
        return private_file_response(cv.file, cv.file_name or "cv")

    @extend_schema(responses={200: CVAnalysisSerializer, 204: OpenApiResponse(description="Aucun CV analysé")})
    @action(detail=False, methods=["get"])
    def latest(self, request):
        cv = self.get_queryset().filter(analysis__isnull=False).order_by("-uploaded_at").first()
        if cv is None:
            # Situation normale pour un nouveau candidat : pas d'erreur, pas de contenu.
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(CVAnalysisSerializer(cv.analysis, context={"request": request}).data)


class CVAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    """Résultats d'analyse de CV."""

    queryset = CVAnalysis.objects.select_related("cv__candidate__user").prefetch_related(
        "detected_skills", "missing_skills", "recommendations"
    )
    serializer_class = CVAnalysisSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["cv", "status"]
    ordering_fields = ["analyzed_at"]
    ordering = ["-analyzed_at"]

    def get_queryset(self):
        filters = visible_cv_filter(self.request.user, prefix="cv__")
        if filters is None:
            return CVAnalysis.objects.none()
        return super().get_queryset().filter(**filters).distinct()
