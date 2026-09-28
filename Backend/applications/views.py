"""
Vues de candidature pour TafLocal AI.
"""

from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ai.serializers import RANKING_DISCLAIMER, RankedApplicationSerializer
from ai.services import MatchingService
from authentication.permissions import IsCandidate, IsCompanyOrAdmin
from common.filters import ApplicationFilter
from common.throttling import AIRateThrottle
from notifications.models import NotificationType
from notifications.services import NotificationService
from users.models import UserRole, get_candidate_profile

from .models import Application, ApplicationStatus
from .serializers import (
    ApplicationCreateSerializer,
    ApplicationSerializer,
    ApplicationUpdateSerializer,
)


def ranked_response(view, request, applications):
    """Réponse commune du classement des candidatures (indicatif)."""
    applications = applications.select_related(
        "candidate__user", "offre__entreprise", "cover_letter"
    ).prefetch_related("offre__competences_requises")
    statut = request.query_params.get("statut")
    if statut:
        applications = applications.filter(statut=statut)
    refresh = request.query_params.get("refresh") in {"1", "true"}
    ranked = MatchingService.rank_applications(applications, refresh=refresh)
    page = view.paginate_queryset(ranked)
    data = RankedApplicationSerializer(page if page is not None else ranked, many=True,
                                       context={"request": request}).data
    if page is not None:
        response = view.get_paginated_response(data)
        response.data["avertissement"] = RANKING_DISCLAIMER
        return response
    return Response({"avertissement": RANKING_DISCLAIMER, "results": data})


class ApplicationViewSet(viewsets.ModelViewSet):
    """Viewset de candidature."""

    queryset = Application.objects.select_related(
        "offre__entreprise", "candidate__user", "cover_letter"
    ).prefetch_related("offre__competences_requises")
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ApplicationFilter
    search_fields = ["candidate__user__prenom", "candidate__user__nom", "offre__titre"]
    ordering_fields = ["date_candidature", "statut"]
    ordering = ["-date_candidature"]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_serializer_class(self):
        if self.action == "create":
            return ApplicationCreateSerializer
        if self.action in ["update", "partial_update"]:
            return ApplicationUpdateSerializer
        return ApplicationSerializer

    def get_permissions(self):
        if self.action in ["create", "destroy", "withdraw"]:
            return [IsCandidate()]
        if self.action in ["update", "partial_update"]:
            return [IsCompanyOrAdmin()]
        if self.action == "ranked":
            return [IsCompanyOrAdmin()]
        return [IsAuthenticated()]

    def get_throttles(self):
        if self.action == "ranked":
            return [*super().get_throttles(), AIRateThrottle()]
        return super().get_throttles()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user
        if self.action == "create" and user.is_authenticated and user.role == UserRole.CANDIDATE:
            context["candidate"] = get_candidate_profile(user)
        return context

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.role == UserRole.CANDIDATE:
            return queryset.filter(candidate__user=user)
        if user.role == UserRole.COMPANY:
            return queryset.filter(offre__entreprise__user=user)
        if user.role == UserRole.ADMIN:
            return queryset
        return queryset.none()

    def perform_create(self, serializer):
        candidate = get_candidate_profile(self.request.user)
        application = serializer.save(candidate=candidate)
        job = application.offre
        NotificationService.notify(
            job.entreprise.user,
            NotificationType.APPLICATION,
            "Nouvelle candidature",
            f"{candidate.user.prenom} {candidate.user.nom} a postulé à votre offre « {job.titre} ».",
        )

    def perform_update(self, serializer):
        previous_status = serializer.instance.statut
        application = serializer.save()
        if application.statut != previous_status:
            NotificationService.notify_application_status(application)

    def perform_destroy(self, instance):
        # Un candidat retire sa candidature plutôt que de la supprimer (historique conservé).
        instance.statut = ApplicationStatus.WITHDRAWN
        instance.save(update_fields=["statut", "updated_at"])

    @extend_schema(responses=OpenApiResponse(description="Candidature retirée avec succès"))
    @action(detail=True, methods=["post"])
    def withdraw(self, request, pk=None):
        """Retirer une candidature."""
        application = self.get_object()
        if application.candidate.user_id != request.user.id:
            raise PermissionDenied("Non autorisé")
        application.statut = ApplicationStatus.WITHDRAWN
        application.save(update_fields=["statut", "updated_at"])
        return Response({"message": "Candidature retirée avec succès"}, status=status.HTTP_200_OK)

    @extend_schema(
        parameters=[
            OpenApiParameter("offre", str, description="Limiter à une offre"),
            OpenApiParameter("statut", str, description="Limiter à un statut"),
        ],
        responses=RankedApplicationSerializer(many=True),
        description="Candidatures reçues classées par indice de compatibilité (indicatif, ne remplace pas la décision du recruteur).",
    )
    @action(detail=False, methods=["get"])
    def ranked(self, request):
        applications = self.get_queryset().exclude(statut=ApplicationStatus.WITHDRAWN)
        job_id = request.query_params.get("offre")
        if job_id:
            applications = applications.filter(offre_id=job_id)
        return ranked_response(self, request, applications)

