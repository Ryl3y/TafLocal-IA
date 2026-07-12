"""
Modèles d'emploi pour TafLocal AI.
Correspondance avec le schéma PostgreSQL.
"""

import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _


class ContractType(models.TextChoices):
    """Énumération des types de contrat (correspond au PostgreSQL ENUM contract_type)."""
    CDI = "CDI", _("CDI")
    CDD = "CDD", _("CDD")
    FREELANCE = "FREELANCE", _("Freelance")
    INTERNSHIP = "INTERNSHIP", _("Internship")
    APPRENTICESHIP = "APPRENTICESHIP", _("Apprenticeship")


class JobStatus(models.TextChoices):
    """Énumération des statuts d'emploi (correspond au PostgreSQL ENUM job_status)."""
    DRAFT = "DRAFT", _("Draft")
    PUBLISHED = "PUBLISHED", _("Published")
    CLOSED = "CLOSED", _("Closed")
    ARCHIVED = "ARCHIVED", _("Archived")
    EXPIRED = "EXPIRED", _("Expired")


class Job(models.Model):
    """Modèle d'offre d'emploi correspondant à la table offre_emploi PostgreSQL."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entreprise = models.ForeignKey("companies.Company", on_delete=models.CASCADE, related_name="jobs")
    titre = models.CharField(max_length=255, verbose_name=_("Titre"))
    description = models.TextField(verbose_name=_("Description"))
    localisation = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Localisation"))
    type_contrat = models.CharField(
        max_length=20,
        choices=ContractType.choices,
        default=ContractType.CDI,
        verbose_name=_("Type de contrat")
    )
    salaire_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name=_("Salaire minimum"))
    salaire_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name=_("Salaire maximum"))
    devise = models.CharField(max_length=10, default="XAF", verbose_name=_("Devise"))
    experience_requise = models.IntegerField(blank=True, null=True, verbose_name=_("Expérience requise"))
    niveau_etude = models.CharField(max_length=100, blank=True, null=True, verbose_name=_("Niveau d'étude"))
    date_publication = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de publication"))
    date_expiration = models.DateTimeField(blank=True, null=True, verbose_name=_("Date d'expiration"))
    statut = models.CharField(
        max_length=20,
        choices=JobStatus.choices,
        default=JobStatus.DRAFT,
        verbose_name=_("Statut")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Créé le"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Mis à jour le"))

    class Meta:
        db_table = "offre_emploi"
        verbose_name = _("Offre d'emploi")
        verbose_name_plural = _("Offres d'emploi")
        ordering = ["-date_publication"]
        indexes = [
            models.Index(fields=["-date_publication"]),
            models.Index(fields=["statut"]),
            models.Index(fields=["type_contrat"]),
        ]

    def __str__(self):
        return f"{self.titre} - {self.entreprise.nom_entreprise}"
