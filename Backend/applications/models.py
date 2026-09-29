"""
Modèles de candidature pour TafLocal AI.
Correspondance avec le schéma PostgreSQL.
"""

import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _


class ApplicationStatus(models.TextChoices):
    """Énumération des statuts de candidature (correspond au PostgreSQL ENUM application_status)."""
    PENDING = "PENDING", _("En attente")
    UNDER_REVIEW = "UNDER_REVIEW", _("En cours d'examen")
    SHORTLISTED = "SHORTLISTED", _("Présélectionnée")
    REJECTED = "REJECTED", _("Refusée")
    HIRED = "HIRED", _("Retenue")
    WITHDRAWN = "WITHDRAWN", _("Retirée")


class Application(models.Model):
    """Modèle de candidature correspondant à la table candidature PostgreSQL."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey("users.CandidateProfile", on_delete=models.CASCADE, related_name="applications")
    offre = models.ForeignKey("jobs.Job", on_delete=models.CASCADE, related_name="applications")
    # CV transmis avec la candidature (obligatoire à la création). Conservé même si le candidat
    # dépose ensuite un autre CV ; PROTECT empêche de supprimer un CV encore joint à une candidature.
    cv = models.ForeignKey(
        "cv_analysis.CV", on_delete=models.PROTECT, null=True, blank=True, related_name="applications",
        verbose_name=_("CV transmis"),
    )
    date_candidature = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de candidature"))
    statut = models.CharField(
        max_length=20,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.PENDING,
        verbose_name=_("Statut")
    )
    commentaire = models.TextField(blank=True, null=True, verbose_name=_("Commentaire"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Créé le"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Mis à jour le"))

    class Meta:
        db_table = "candidature"
        verbose_name = _("Candidature")
        verbose_name_plural = _("Candidatures")
        ordering = ["-date_candidature"]
        constraints = [
            models.UniqueConstraint(fields=["candidate", "offre"], name="unique_application")
        ]
        indexes = [
            models.Index(fields=["-date_candidature"]),
            models.Index(fields=["statut"]),
        ]

    def __str__(self):
        return f"{self.candidate} - {self.offre.titre}"


class CoverLetter(models.Model):
    """Modèle de lettre de motivation correspondant à la table lettre_motivation PostgreSQL."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidature = models.OneToOneField(Application, on_delete=models.CASCADE, related_name="cover_letter")
    contenu = models.TextField(verbose_name=_("Contenu"))
    date_creation = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de création"))
    generated_by_ai = models.BooleanField(default=False, verbose_name=_("Généré par IA"))

    class Meta:
        db_table = "lettre_motivation"
        verbose_name = _("Lettre de motivation")
        verbose_name_plural = _("Lettres de motivation")
        ordering = ["-date_creation"]
        constraints = [
            models.UniqueConstraint(fields=["candidature"], name="unique_cover_letter")
        ]

    def __str__(self):
        return f"Lettre pour {self.candidature}"
