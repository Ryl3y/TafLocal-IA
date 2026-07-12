"""
Sérialiseurs d'entretien pour TafLocal AI.
"""

from rest_framework import serializers
from .models import (
    InterviewSession,
    InterviewQuestion,
    AIFeedback,
    InterviewStatus,
)
from jobs.serializers import JobSerializer
from users.serializers import CandidateProfileSerializer


class InterviewQuestionSerializer(serializers.ModelSerializer):
    """Sérialiseur de question d'entretien."""

    class Meta:
        model = InterviewQuestion
        fields = ["id", "question", "type_question", "reponse", "score", "ordre"]
        read_only_fields = ["id"]


class AIFeedbackSerializer(serializers.ModelSerializer):
    """Sérialiseur de feedback IA."""

    class Meta:
        model = AIFeedback
        fields = [
            "id",
            "score_global",
            "points_forts",
            "points_faibles",
            "conseils",
            "date_feedback",
        ]
        read_only_fields = ["id", "date_feedback"]


class InterviewSessionSerializer(serializers.ModelSerializer):
    """Sérialiseur de session d'entretien."""

    offre = JobSerializer(read_only=True)
    candidate = CandidateProfileSerializer(read_only=True)
    statut_display = serializers.CharField(source="get_statut_display", read_only=True)
    questions = InterviewQuestionSerializer(many=True, read_only=True)
    feedback = AIFeedbackSerializer(read_only=True)

    class Meta:
        model = InterviewSession
        fields = [
            "id",
            "candidate",
            "offre",
            "date_session",
            "type_entretien",
            "duree",
            "score_global",
            "statut",
            "statut_display",
            "questions",
            "feedback",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class InterviewSessionCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur de création de session d'entretien."""

    class Meta:
        model = InterviewSession
        fields = ["candidate", "offre", "date_session", "type_entretien", "duree"]
