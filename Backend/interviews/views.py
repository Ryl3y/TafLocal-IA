"""
Vues d'entretien pour TafLocal AI.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ai.services import AIServiceError, InterviewService
from authentication.permissions import IsCandidate
from common.throttling import AIRateThrottle
from users.models import UserRole, get_candidate_profile

from .models import InterviewQuestion, InterviewSession, InterviewStatus
from .serializers import (
    AIFeedbackSerializer,
    AnswerSerializer,
    InterviewQuestionSerializer,
    InterviewSessionCreateSerializer,
    InterviewSessionSerializer,
)


def _visible_sessions(user):
    if not user.is_authenticated:  # génération du schéma OpenAPI
        return InterviewSession.objects.none()
    queryset = InterviewSession.objects.select_related(
        "offre__entreprise", "candidate__user", "feedback"
    ).prefetch_related("questions", "offre__competences_requises")
    if user.role == UserRole.CANDIDATE:
        return queryset.filter(candidate__user=user)
    if user.role == UserRole.COMPANY:
        return queryset.filter(offre__entreprise__user=user)
    if user.role == UserRole.ADMIN:
        return queryset
    return queryset.none()


class InterviewSessionViewSet(viewsets.ModelViewSet):
    """Simulations d'entretien du candidat."""

    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["statut", "offre", "type_entretien"]
    ordering_fields = ["date_session", "created_at"]
    ordering = ["-created_at"]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_serializer_class(self):
        if self.action == "create":
            return InterviewSessionCreateSerializer
        if self.action == "answer":
            return AnswerSerializer
        return InterviewSessionSerializer

    def get_permissions(self):
        if self.action in ["create", "start", "answer", "complete", "destroy"]:
            return [IsCandidate()]
        return [IsAuthenticated()]

    def get_throttles(self):
        if self.action in ["create", "answer", "complete"]:
            return [*super().get_throttles(), AIRateThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        return _visible_sessions(self.request.user)

    @extend_schema(request=InterviewSessionCreateSerializer, responses=InterviewSessionSerializer)
    def create(self, request, *args, **kwargs):
        serializer = InterviewSessionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = InterviewService.create_session(
            get_candidate_profile(request.user),
            job=serializer.validated_data.get("offre"),
            interview_type=serializer.validated_data["type_entretien"],
            count=serializer.validated_data.get("nombre_questions"),
        )
        session = self.get_queryset().get(pk=session.pk)
        return Response(InterviewSessionSerializer(session, context={"request": request}).data,
                        status=status.HTTP_201_CREATED)

    @extend_schema(request=None, responses=InterviewSessionSerializer)
    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):
        """Démarrer la session d'entretien."""
        session = self.get_object()
        if session.statut == InterviewStatus.SCHEDULED:
            session.statut = InterviewStatus.IN_PROGRESS
            session.save(update_fields=["statut"])
        return Response(InterviewSessionSerializer(session, context={"request": request}).data)

    @extend_schema(request=AnswerSerializer, responses=InterviewQuestionSerializer)
    @action(detail=True, methods=["post"])
    def answer(self, request, pk=None):
        """Enregistrer et évaluer la réponse à une question."""
        session = self.get_object()
        serializer = AnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        question = session.questions.filter(pk=serializer.validated_data["question_id"]).first()
        if question is None:
            raise ValidationError({"question_id": "Cette question n'appartient pas à la session."})
        try:
            InterviewService.answer(question, serializer.validated_data["reponse"])
        except AIServiceError as exc:
            return Response({"detail": str(exc)}, status=exc.status_code)
        return Response(InterviewQuestionSerializer(question).data)

    @extend_schema(request=None, responses=AIFeedbackSerializer)
    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        """Terminer la session et générer le feedback global."""
        session = self.get_object()
        if session.statut == InterviewStatus.CANCELLED:
            return Response({"detail": "Session annulée."}, status=status.HTTP_409_CONFLICT)
        if not session.questions.exclude(reponse__isnull=True).exclude(reponse="").exists():
            raise ValidationError("Répondez à au moins une question avant de terminer l'entretien.")
        feedback = InterviewService.complete(session)
        return Response(AIFeedbackSerializer(feedback).data)

    @extend_schema(responses=AIFeedbackSerializer)
    @action(detail=True, methods=["get"])
    def feedback(self, request, pk=None):
        session = self.get_object()
        if not hasattr(session, "feedback"):
            return Response({"detail": "Feedback non disponible."}, status=status.HTTP_404_NOT_FOUND)
        return Response(AIFeedbackSerializer(session.feedback).data)


class InterviewQuestionViewSet(viewsets.ModelViewSet):
    """Questions d'entretien (lecture ; le candidat ne peut modifier que sa réponse)."""

    serializer_class = InterviewQuestionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["session"]
    ordering_fields = ["ordre"]
    ordering = ["ordre"]
    http_method_names = ["get", "patch", "head", "options"]

    def get_permissions(self):
        if self.action in ["update", "partial_update"]:
            return [IsCandidate()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return InterviewQuestion.objects.filter(session__in=_visible_sessions(self.request.user))

    def perform_update(self, serializer):
        question = serializer.instance
        answer = serializer.validated_data.get("reponse", "")
        if not answer or not answer.strip():
            raise ValidationError({"reponse": "La réponse ne peut pas être vide."})
        try:
            InterviewService.answer(question, answer.strip())
        except AIServiceError as exc:
            raise ValidationError(str(exc))
