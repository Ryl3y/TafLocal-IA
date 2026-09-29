"""
Vues d'emploi pour TafLocal AI.
"""

from django.db.models import Count, Q
from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ai.serializers import (
    JobRecommendationSerializer,
    MatchSerializer,
    RankedApplicationSerializer,
)
from ai.services import MatchingService, jobs_with_skills
from authentication.permissions import IsCandidate, IsCompanyOrAdmin
from common.filters import JobFilter
from common.throttling import AIRateThrottle
from users.models import UserRole, get_candidate_profile

from .models import Job, JobStatus
from .serializers import JobSerializer, JobWriteSerializer


def _company_of(user):
    """Retourner l'entreprise de l'utilisateur ou None."""
    return getattr(user, "company", None) if user.is_authenticated else None


class JobViewSet(viewsets.ModelViewSet):
    """Viewset d'emploi."""

    queryset = Job.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = JobFilter
    search_fields = ["titre", "description", "localisation", "entreprise__nom_entreprise", "competences_requises__nom"]
    ordering_fields = ["date_publication", "salaire_min", "salaire_max", "titre"]
    ordering = ["-date_publication"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return JobWriteSerializer
        return JobSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy", "archive", "activate",
                           "ranked_applications"]:
            return [IsCompanyOrAdmin()]
        if self.action in ["match_for_me", "match"]:
            return [IsCandidate()]
        return [IsAuthenticatedOrReadOnly()]

    def get_throttles(self):
        if self.action in ["match_for_me", "match", "ranked_applications"]:
            return [*super().get_throttles(), AIRateThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        queryset = jobs_with_skills(Job.objects.all()).annotate(nombre_candidatures=Count("applications"))
        user = self.request.user

        if user.is_authenticated and user.role == UserRole.ADMIN:
            return queryset
        if user.is_authenticated and user.role == UserRole.COMPANY:
            company = _company_of(user)
            if company is None:
                return queryset.none()
            # Une entreprise gère ses propres offres et peut consulter les offres publiées.
            if self.action in ["list", "retrieve", "view"] and self.request.query_params.get("scope") == "all":
                return queryset.filter(Q(entreprise=company) | Q(pk__in=Job.objects.published().values("pk")))
            return queryset.filter(entreprise=company)

        return queryset.published().filter(
            Q(date_expiration__isnull=True) | Q(date_expiration__gt=timezone.now())
        )

    def _check_company_ownership(self, job):
        user = self.request.user
        if user.role == UserRole.ADMIN:
            return
        company = _company_of(user)
        if user.role != UserRole.COMPANY or company is None or job.entreprise_id != company.id:
            raise PermissionDenied("Vous ne pouvez modifier que vos propres offres.")

    def perform_create(self, serializer):
        user = self.request.user
        statut = serializer.validated_data.get("statut", JobStatus.PUBLISHED)
        if user.role == UserRole.ADMIN:
            if not serializer.validated_data.get("entreprise"):
                raise ValidationError({"entreprise": "Un administrateur doit préciser l'entreprise."})
            serializer.save(statut=statut)
            return
        company = _company_of(user)
        if company is None:
            raise ValidationError({"entreprise": "Aucun profil entreprise n'est associé à ce compte."})
        serializer.save(entreprise=company, statut=statut)

    def perform_update(self, serializer):
        self._check_company_ownership(serializer.instance)
        if self.request.user.role != UserRole.ADMIN:
            serializer.validated_data.pop("entreprise", None)
        serializer.save()

    def perform_destroy(self, instance):
        self._check_company_ownership(instance)
        instance.delete()

    @extend_schema(responses=OpenApiResponse(description="Emploi archivé avec succès"))
    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        """Archiver un emploi."""
        job = self.get_object()
        self._check_company_ownership(job)
        job.statut = JobStatus.ARCHIVED
        job.save(update_fields=["statut", "updated_at"])
        return Response({"message": "Emploi archivé avec succès"}, status=status.HTTP_200_OK)

    @extend_schema(responses=OpenApiResponse(description="Emploi activé avec succès"))
    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        """Publier (ou republier) un emploi."""
        job = self.get_object()
        self._check_company_ownership(job)
        job.statut = JobStatus.PUBLISHED
        job.save(update_fields=["statut", "updated_at"])
        return Response({"message": "Emploi activé avec succès"}, status=status.HTTP_200_OK)

    @extend_schema(responses=JobSerializer)
    @action(detail=True, methods=["get"])
    def view(self, request, pk=None):
        """Consulter une offre d'emploi."""
        return Response(JobSerializer(self.get_object(), context={"request": request}).data)

    @extend_schema(
        parameters=[
            OpenApiParameter("limit", int, description="Nombre maximum d'offres (défaut 20)"),
            OpenApiParameter("min_score", int, description="Score minimum (0-100)"),
            OpenApiParameter("refresh", bool, description="Forcer le recalcul des scores"),
        ],
        responses=JobRecommendationSerializer(many=True),
        description="Offres publiées classées par compatibilité avec le candidat connecté (moteur IA interne).",
    )
    @action(detail=False, methods=["get"])
    def match_for_me(self, request):
        """Obtenir les offres d'emploi correspondantes au candidat connecté."""
        candidate = get_candidate_profile(request.user)
        try:
            limit = min(int(request.query_params.get("limit", 20)), 100)
            min_score = int(request.query_params.get("min_score", 0))
        except ValueError:
            raise ValidationError("Les paramètres limit et min_score doivent être des entiers.")
        refresh = request.query_params.get("refresh") in {"1", "true", "True"}
        recommendations = MatchingService.recommend_jobs(
            candidate, limit=limit, min_score=min_score, refresh=refresh
        )
        page = self.paginate_queryset(recommendations)
        serializer = JobRecommendationSerializer(page if page is not None else recommendations, many=True,
                                                 context={"request": request})
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @extend_schema(responses=MatchSerializer, description="Compatibilité du candidat connecté avec cette offre.")
    @action(detail=True, methods=["get"])
    def match(self, request, pk=None):
        job = self.get_object()
        result = MatchingService.get_match(
            get_candidate_profile(request.user), job, refresh=request.query_params.get("refresh") in {"1", "true"}
        )
        return Response(MatchSerializer(result).data)

    @extend_schema(
        responses=RankedApplicationSerializer(many=True),
        description="Candidatures reçues pour cette offre, classées par indice de compatibilité (indicatif).",
    )
    @action(detail=True, methods=["get"], url_path="applications/ranked")
    def ranked_applications(self, request, pk=None):
        job = self.get_object()
        self._check_company_ownership(job)
        from applications.views import ranked_response

        return ranked_response(self, request, job.applications.all())

