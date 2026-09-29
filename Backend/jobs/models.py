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
    INTERNSHIP = "INTERNSHIP", _("Stage")
    APPRENTICESHIP = "APPRENTICESHIP", _("Alternance")


class JobCategory(models.TextChoices):
    """Nature de l'offre, choisie en premier par le recruteur."""
    EMPLOI = "EMPLOI", _("Emploi")
    STAGE = "STAGE", _("Stage")


# Contrats possibles pour une offre d'emploi (un stage a toujours le contrat « Stage »).
EMPLOYMENT_CONTRACTS = {c for c in ContractType.values if c != ContractType.INTERNSHIP}
STAGE_MAX_MONTHS = 24
# Paliers proposés au recruteur pour l'expérience requise (en mois).
EXPERIENCE_CHOICES_MONTHS = [0, 3, 6, 12, 24, 36, 48, 60, 84, 120]
EXPERIENCE_MAX_MONTHS = 50 * 12


def format_months(months: int | None) -> str:
    """3 -> « 3 mois », 12 -> « 1 an », 18 -> « 1 an et 6 mois », 0 -> « débutant accepté »."""
    if months is None:
        return "non précisée"
    if months == 0:
        return "débutant accepté"
    years, rest = divmod(months, 12)
    parts = []
    if years:
        parts.append(f"{years} an" + ("s" if years > 1 else ""))
    if rest:
        parts.append(f"{rest} mois")
    return " et ".join(parts)


class JobStatus(models.TextChoices):
    """Énumération des statuts d'emploi (correspond au PostgreSQL ENUM job_status)."""
    DRAFT = "DRAFT", _("Brouillon")
    PUBLISHED = "PUBLISHED", _("Publiée")
    CLOSED = "CLOSED", _("Clôturée")
    ARCHIVED = "ARCHIVED", _("Archivée")
    EXPIRED = "EXPIRED", _("Expirée")


class CoverLetterRequirement(models.TextChoices):
    """Place de la lettre de motivation dans la candidature (choisie par l'entreprise).

    Le CV, lui, est toujours obligatoire.
    """
    NOT_REQUESTED = "NON_DEMANDEE", _("Non demandée")
    OPTIONAL = "FACULTATIVE", _("Facultative")
    REQUIRED = "OBLIGATOIRE", _("Obligatoire")


class JobQuerySet(models.QuerySet):
    def published(self):
        """Offres visibles des candidats : publiées ET entreprise validée par un administrateur."""
        return self.filter(statut=JobStatus.PUBLISHED, entreprise__statut_verification="APPROVED")


class Job(models.Model):
    """Modèle d'offre d'emploi correspondant à la table offre_emploi PostgreSQL."""

    objects = JobQuerySet.as_manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entreprise = models.ForeignKey("companies.Company", on_delete=models.CASCADE, related_name="jobs")
    titre = models.CharField(max_length=255, verbose_name=_("Titre"))
    description = models.TextField(verbose_name=_("Description"))
    exigences = models.TextField(blank=True, null=True, verbose_name=_("Exigences du poste"))
    competences_requises = models.ManyToManyField(
        "users.Skill",
        blank=True,
        related_name="offres",
        verbose_name=_("Compétences requises"),
    )
    categorie = models.CharField(
        max_length=10, choices=JobCategory.choices, default=JobCategory.EMPLOI,
        db_index=True, verbose_name=_("Type d'offre"),
    )
    # Stage uniquement (vides pour un emploi)
    duree_stage_mois = models.PositiveSmallIntegerField(blank=True, null=True, verbose_name=_("Durée du stage (mois)"))
    stage_remunere = models.BooleanField(blank=True, null=True, verbose_name=_("Stage rémunéré"))
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
    # En mois : de 3 mois à plusieurs années (0 = débutant accepté, vide = non précisée).
    experience_requise_mois = models.PositiveSmallIntegerField(
        blank=True, null=True, verbose_name=_("Expérience requise (mois)")
    )
    niveau_etude = models.CharField(max_length=100, blank=True, null=True, verbose_name=_("Niveau d'étude"))
    lettre_motivation = models.CharField(
        max_length=20, choices=CoverLetterRequirement.choices, default=CoverLetterRequirement.OPTIONAL,
        verbose_name=_("Lettre de motivation"),
    )
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

    @property
    def is_open(self):
        """L'offre accepte-t-elle encore des candidatures ?"""
        from django.utils import timezone

        if self.statut != JobStatus.PUBLISHED or not self.entreprise.is_approved:
            return False
        return self.date_expiration is None or self.date_expiration > timezone.now()
