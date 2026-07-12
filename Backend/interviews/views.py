"""
Vues d'entretien pour TafLocal AI.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import InterviewSession, InterviewQuestion, AIFeedback
from .serializers import (
    InterviewSessionSerializer,
    InterviewSessionCreateSerializer,
    InterviewQuestionSerializer,
    AIFeedbackSerializer,
)
from authentication.permissions import IsAdmin, IsCandidate, IsCompany
from ai.services import InterviewService
from users.models import UserRole


class InterviewSessionViewSet(viewsets.ModelViewSet):
    """Viewset de session d'entretien."""

    queryset = InterviewSession.objects.select_related("offre", "candidate").all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["statut", "offre", "candidate"]
    ordering_fields = ["date_session", "created_at"]
    ordering = ["-date_session"]

    def get_serializer_class(self):
        if self.action == "create":
            return InterviewSessionCreateSerializer
        return InterviewSessionSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsCandidate | IsCompany | IsAdmin]
        elif self.action in ["update", "partial_update", "destroy"]:
            return [IsCompany | IsAdmin]
        return [IsAuthenticated]

    def perform_create(self, serializer):
        interview = serializer.save()
        # Générer les questions d'entretien
        InterviewService.generate_questions(interview.id)
        return interview

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
        responses=OpenApiResponse(description="Entretien démarré"),
        description="Démarrer la session d'entretien"
    )
    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):
        """Démarrer la session d'entretien."""
        session = self.get_object()
        session.statut = "IN_PROGRESS"
        session.save()
        return Response({"message": "Entretien démarré"}, status=status.HTTP_200_OK)

    @extend_schema(
        methods=["POST"],
        responses=OpenApiResponse(description="Entretien complété"),
        description="Compléter la session d'entretien"
    )
    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        """Compléter la session d'entretien."""
        session = self.get_object()
        session.statut = "COMPLETED"
        session.save()
        # Générer le feedback
        InterviewService.generate_feedback(session.id)
        return Response({"message": "Entretien complété"}, status=status.HTTP_200_OK)


class InterviewQuestionViewSet(viewsets.ModelViewSet):
    """Viewset de question d'entretien (pour répondre)."""

    queryset = InterviewQuestion.objects.select_related("session").all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["session"]
    ordering_fields = ["ordre"]
    ordering = ["ordre"]

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return InterviewQuestionSerializer
        return InterviewQuestionSerializer

    def get_permissions(self):
        if self.action in ["update", "partial_update"]:
            return [IsCandidate]
        return [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == UserRole.CANDIDATE:
            return queryset.filter(session__candidate=self.request.user.candidate_profile)
        return queryset
