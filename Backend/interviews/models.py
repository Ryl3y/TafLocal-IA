"""
Modèles d'entretien pour TafLocal AI.
Correspondance avec le schéma PostgreSQL.
"""

import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _


class InterviewType(models.TextChoices):
    """Énumération des types d'entretien (correspond au PostgreSQL ENUM interview_type)."""
    TECHNICAL = "TECHNICAL", _("Technical")
    BEHAVIORAL = "BEHAVIORAL", _("Behavioral")
    MIXED = "MIXED", _("Mixed")
    HR = "HR", _("HR")


class InterviewStatus(models.TextChoices):
    """Énumération des statuts d'entretien (correspond au PostgreSQL ENUM interview_status)."""
    SCHEDULED = "SCHEDULED", _("Scheduled")
    IN_PROGRESS = "IN_PROGRESS", _("In Progress")
    COMPLETED = "COMPLETED", _("Completed")
    CANCELLED = "CANCELLED", _("Cancelled")
    FAILED = "FAILED", _("Failed")


class QuestionType(models.TextChoices):
    """Énumération des types de question (correspond au PostgreSQL ENUM question_type)."""
    OPEN = "OPEN", _("Open")
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE", _("Multiple Choice")
    CODE = "CODE", _("Code")
    BEHAVIORAL = "BEHAVIORAL", _("Behavioral")


class InterviewSession(models.Model):
    """Modèle de session d'entretien correspondant à la table session_entretien PostgreSQL."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey("users.CandidateProfile", on_delete=models.CASCADE, related_name="interviews")
    offre = models.ForeignKey("jobs.Job", on_delete=models.SET_NULL, null=True, blank=True, related_name="interviews")
    date_session = models.DateTimeField(blank=True, null=True, verbose_name=_("Date de session"))
    type_entretien = models.CharField(
        max_length=20,
        choices=InterviewType.choices,
        default=InterviewType.MIXED,
        verbose_name=_("Type d'entretien")
    )
    duree = models.IntegerField(blank=True, null=True, verbose_name=_("Durée (minutes)"))
    score_global = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name=_("Score global")
    )
    statut = models.CharField(
        max_length=20,
        choices=InterviewStatus.choices,
        default=InterviewStatus.SCHEDULED,
        verbose_name=_("Statut")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Créé le"))

    class Meta:
        db_table = "session_entretien"
        verbose_name = _("Session d'entretien")
        verbose_name_plural = _("Sessions d'entretien")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Entretien pour {self.candidate} - {self.offre.titre if self.offre else 'N/A'}"


class InterviewQuestion(models.Model):
    """Modèle de question d'entretien correspondant à la table question_entretien PostgreSQL."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name="questions",
        db_column="idx_question_session_entretien_id"
    )
    question = models.TextField(verbose_name=_("Question"))
    type_question = models.CharField(
        max_length=50,
        choices=QuestionType.choices,
        default=QuestionType.OPEN,
        verbose_name=_("Type de question")
    )
    reponse = models.TextField(blank=True, null=True, verbose_name=_("Réponse"))
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name=_("Score")
    )
    ordre = models.IntegerField(verbose_name=_("Ordre"))
    categorie = models.CharField(max_length=30, blank=True, null=True, verbose_name=_("Catégorie"))
    competence = models.CharField(max_length=100, blank=True, null=True, verbose_name=_("Compétence évaluée"))
    mots_cles = models.JSONField(default=list, blank=True, verbose_name=_("Mots-clés attendus"))
    evaluation = models.JSONField(default=dict, blank=True, verbose_name=_("Évaluation de la réponse"))

    class Meta:
        db_table = "question_entretien"
        verbose_name = _("Question d'entretien")
        verbose_name_plural = _("Questions d'entretien")
        ordering = ["ordre", "id"]

    def __str__(self):
        return f"Question {self.ordre}: {self.question[:50]}..."


class AIFeedback(models.Model):
    """Modèle de feedback IA correspondant à la table feedback_ia PostgreSQL."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name="feedback",
        db_column="idx_question_session_entretien_id"
    )
    score_global = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name=_("Score global")
    )
    points_forts = models.JSONField(default=list, blank=True, verbose_name=_("Points forts"))
    points_faibles = models.JSONField(default=list, blank=True, verbose_name=_("Points faibles"))
    conseils = models.JSONField(default=list, blank=True, verbose_name=_("Conseils"))
    scores_par_categorie = models.JSONField(default=dict, blank=True, verbose_name=_("Scores par catégorie"))
    date_feedback = models.DateTimeField(auto_now_add=True, verbose_name=_("Date du feedback"))

    class Meta:
        db_table = "feedback_ia"
        verbose_name = _("Feedback IA")
        verbose_name_plural = _("Feedbacks IA")
        ordering = ["-date_feedback"]
        constraints = [
            models.UniqueConstraint(fields=["session"], name="unique_feedback")
        ]

    def __str__(self):
        return f"Feedback pour {self.session}"
