"""
Vues de candidature pour TafLocal AI.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import Application
from .serializers import (
    ApplicationSerializer,
    ApplicationCreateSerializer,
    ApplicationUpdateSerializer,
)
from authentication.permissions import IsAdmin, IsCandidate, IsCompany
from users.models import UserRole


class ApplicationViewSet(viewsets.ModelViewSet):
    """Viewset de candidature."""

    queryset = Application.objects.select_related("offre__entreprise", "candidate__user").all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["statut", "offre"]
    search_fields = ["candidate__user__prenom", "candidate__user__nom", "offre__titre"]
    ordering_fields = ["date_candidature", "statut"]
    ordering = ["-date_candidature"]

    def get_serializer_class(self):
        if self.action == "create":
            return ApplicationCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return ApplicationUpdateSerializer
        return ApplicationSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsCandidate()]
        elif self.action in ["update", "partial_update"]:
            return [IsCompany()]
        elif self.action == "destroy":
            return [IsCandidate()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(candidate=self.request.user.candidate_profile, offre=serializer.validated_data["offre"])

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == UserRole.CANDIDATE:
            return queryset.filter(candidate=self.request.user.candidate_profile)
        elif user.role == UserRole.COMPANY:
            return queryset.filter(offre__entreprise=self.request.user.company)
        return queryset

    @extend_schema(
        methods=["POST"],
        responses=OpenApiResponse(description="Candidature retirée avec succès"),
        description="Retirer une candidature"
    )
    @action(detail=True, methods=["post"])
    def withdraw(self, request, pk=None):
        """Retirer une candidature."""
        application = self.get_object()
        if application.candidate != request.user.candidate_profile:
            return Response({"error": "Non autorisé"}, status=status.HTTP_403_FORBIDDEN)
        application.statut = "WITHDRAWN"
        application.save()
        return Response({"message": "Candidature retirée avec succès"}, status=status.HTTP_200_OK)
