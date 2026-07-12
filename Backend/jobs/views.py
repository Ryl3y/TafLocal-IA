"""
Vues d'emploi pour TafLocal AI.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import Job, JobStatus
from .serializers import JobSerializer, JobCreateSerializer, JobUpdateSerializer, JobMatchSerializer
from .matching_service import JobMatchingService
from authentication.permissions import IsAdmin, IsCompany, IsCompanyOrAdmin, IsCandidate
from users.models import UserRole


class JobViewSet(viewsets.ModelViewSet):
    """Viewset d'emploi."""

    queryset = Job.objects.select_related("entreprise").all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["type_contrat", "experience_requise", "statut"]
    search_fields = ["titre", "description", "localisation"]
    ordering_fields = ["date_publication", "salaire_min", "titre"]
    ordering = ["-date_publication"]

    def get_serializer_class(self):
        if self.action == "create":
            return JobCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return JobUpdateSerializer
        return JobSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsCompanyOrAdmin()]
        return [IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.is_authenticated and user.role == UserRole.COMPANY:
            try:
                return queryset.filter(entreprise=user.company)
            except Exception:
                return queryset.none()

        if user.is_authenticated and user.role == UserRole.ADMIN:
            return queryset

        return queryset.filter(statut=JobStatus.PUBLISHED)

    def _check_company_ownership(self, job):
        user = self.request.user
        if user.role == UserRole.ADMIN:
            return
        if user.role != UserRole.COMPANY or job.entreprise_id != user.company.id:
            raise PermissionDenied("Vous ne pouvez modifier que vos propres offres.")

    def perform_create(self, serializer):
        if self.request.user.role == UserRole.ADMIN and serializer.validated_data.get("entreprise"):
            serializer.save(statut=JobStatus.PUBLISHED)
            return
        serializer.save(entreprise=self.request.user.company, statut=JobStatus.PUBLISHED)

    def perform_update(self, serializer):
        self._check_company_ownership(serializer.instance)
        serializer.save()

    def perform_destroy(self, instance):
        self._check_company_ownership(instance)
        instance.delete()

    @extend_schema(
        methods=["POST"],
        responses=OpenApiResponse(description="Emploi archivé avec succès"),
        description="Archiver un emploi",
    )
    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        """Archiver un emploi."""
        job = self.get_object()
        self._check_company_ownership(job)
        job.statut = JobStatus.ARCHIVED
        job.save(update_fields=["statut", "updated_at"])
        return Response({"message": "Emploi archivé avec succès"}, status=status.HTTP_200_OK)

    @extend_schema(
        methods=["POST"],
        responses=OpenApiResponse(description="Emploi activé avec succès"),
        description="Activer un emploi",
    )
    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        """Activer un emploi."""
        job = self.get_object()
        self._check_company_ownership(job)
        job.statut = JobStatus.PUBLISHED
        job.save(update_fields=["statut", "updated_at"])
        return Response({"message": "Emploi activé avec succès"}, status=status.HTTP_200_OK)

    @extend_schema(
        methods=["GET"],
        responses=JobSerializer,
        description="Consulter une offre d'emploi",
    )
    @action(detail=True, methods=["get"])
    def view(self, request, pk=None):
        """Consulter une offre d'emploi."""
        job = self.get_object()
        serializer = self.get_serializer(job)
        return Response(serializer.data)

    @extend_schema(
        methods=["GET"],
        responses=JobMatchSerializer(many=True),
        description="Obtenir les offres d'emploi correspondantes au candidat connecté",
    )
    @action(detail=False, methods=["get"])
    def match_for_me(self, request):
        """Obtenir les offres d'emploi correspondantes au candidat connecté."""
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentification requise"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            candidate = request.user.candidate_profile
            matches = JobMatchingService.get_job_recommendations_for_candidate(str(candidate.id))
            serializer = JobMatchSerializer(matches, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
