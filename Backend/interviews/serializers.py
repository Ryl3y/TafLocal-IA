"""
Sérialiseurs d'entretien pour TafLocal AI.
"""

from rest_framework import serializers

from jobs.models import Job, JobStatus
from jobs.serializers import JobSerializer

from .models import AIFeedback, InterviewQuestion, InterviewSession, InterviewType


class InterviewQuestionSerializer(serializers.ModelSerializer):
    """Question d'entretien (le candidat ne peut modifier que sa réponse)."""

    class Meta:
        model = InterviewQuestion
        fields = [
            "id",
            "session",
            "question",
            "type_question",
            "categorie",
            "competence",
            "reponse",
            "score",
            "evaluation",
            "ordre",
        ]
        read_only_fields = [f for f in fields if f != "reponse"]


class AnswerSerializer(serializers.Serializer):
    question_id = serializers.UUIDField()
    reponse = serializers.CharField(max_length=10000, allow_blank=False, trim_whitespace=True)


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
            "scores_par_categorie",
            "date_feedback",
        ]
        read_only_fields = fields


class InterviewSessionSerializer(serializers.ModelSerializer):
    """Session d'entretien avec ses questions et son feedback."""

    offre = JobSerializer(read_only=True)
    candidat_nom = serializers.SerializerMethodField()
    statut_display = serializers.CharField(source="get_statut_display", read_only=True)
    type_entretien_display = serializers.CharField(source="get_type_entretien_display", read_only=True)
    questions = InterviewQuestionSerializer(many=True, read_only=True)
    feedback = serializers.SerializerMethodField()
    progression = serializers.SerializerMethodField()

    class Meta:
        model = InterviewSession
        fields = [
            "id",
            "candidate",
            "candidat_nom",
            "offre",
            "date_session",
            "type_entretien",
            "type_entretien_display",
            "duree",
            "score_global",
            "statut",
            "statut_display",
            "progression",
            "questions",
            "feedback",
            "created_at",
        ]
        read_only_fields = fields

    def get_candidat_nom(self, obj) -> str:
        user = obj.candidate.user
        return f"{user.prenom} {user.nom}".strip()

    def get_feedback(self, obj) -> dict | None:
        try:
            return AIFeedbackSerializer(obj.feedback).data
        except AIFeedback.DoesNotExist:
            return None

    def get_progression(self, obj) -> dict:
        questions = list(obj.questions.all())
        answered = sum(1 for q in questions if q.reponse)
        return {"repondues": answered, "total": len(questions)}


class InterviewSessionCreateSerializer(serializers.Serializer):
    """Démarrer une simulation d'entretien (le candidat est l'utilisateur connecté)."""

    offre = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.filter(statut=JobStatus.PUBLISHED), required=False, allow_null=True
    )
    type_entretien = serializers.ChoiceField(choices=InterviewType.choices, default=InterviewType.MIXED)
    nombre_questions = serializers.IntegerField(required=False, min_value=3, max_value=15)
