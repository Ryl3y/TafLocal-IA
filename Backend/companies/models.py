"""
Modèles d'entreprise pour TafLocal AI.
Correspondance avec le schéma PostgreSQL.
"""

import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _

from common.storage import private_storage


def rccm_upload_path(instance, filename):
    """Nom aléatoire : le nom d'origine (souvent parlant) n'apparaît jamais sur le disque."""
    return f"rccm/{uuid.uuid4().hex}.pdf"


class VerificationStatus(models.TextChoices):
    """Vérification du compte entreprise par un administrateur (lutte contre les fausses entreprises)."""
    PENDING = "PENDING", _("En attente de vérification")
    APPROVED = "APPROVED", _("Validée")
    REJECTED = "REJECTED", _("Rejetée")


class Company(models.Model):
    """Modèle d'entreprise correspondant à la table entreprise PostgreSQL.

    Tant que ``statut_verification`` n'est pas APPROVED, le compte ne peut rien
    faire d'autre que consulter / corriger sa fiche (voir
    ``authentication.authentication.CompanyApprovalJWTAuthentication``).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField("users.User", on_delete=models.CASCADE, related_name="company")
    nom_entreprise = models.CharField(max_length=255, verbose_name=_("Nom de l'entreprise"))
    secteur = models.CharField(max_length=100, blank=True, null=True, verbose_name=_("Secteur"))
    description = models.TextField(blank=True, null=True, verbose_name=_("Description"))
    site_web = models.TextField(blank=True, null=True, verbose_name=_("Site web"))
    adresse = models.TextField(blank=True, null=True, verbose_name=_("Adresse"))
    ville = models.CharField(max_length=100, blank=True, null=True, verbose_name=_("Ville"))
    telephone = models.CharField(max_length=20, blank=True, null=True, verbose_name=_("Téléphone"))
    logo = models.TextField(blank=True, null=True, verbose_name=_("Logo URL"))
    verified = models.BooleanField(default=False, verbose_name=_("Vérifié"))
    registre_commerce = models.CharField(
        max_length=50, unique=True, blank=True, null=True,
        verbose_name=_("Numéro de registre de commerce (RCCM)"),
    )
    document_rccm = models.FileField(
        storage=private_storage, upload_to=rccm_upload_path, max_length=255, blank=True, null=True,
        verbose_name=_("Certificat RCCM (PDF)"),
    )
    document_rccm_nom = models.CharField(
        max_length=255, blank=True, default="", verbose_name=_("Nom d'origine du certificat"),
    )
    statut_verification = models.CharField(
        max_length=20, choices=VerificationStatus.choices, default=VerificationStatus.PENDING,
        db_index=True, verbose_name=_("Statut de vérification"),
    )
    motif_rejet = models.TextField(blank=True, default="", verbose_name=_("Motif du rejet"))
    verifie_par = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, blank=True, null=True, related_name="+",
        verbose_name=_("Vérifiée par"),
    )
    verifie_le = models.DateTimeField(blank=True, null=True, verbose_name=_("Vérifiée le"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Créé le"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Mis à jour le"))

    class Meta:
        db_table = "entreprise"
        verbose_name = _("Entreprise")
        verbose_name_plural = _("Entreprises")
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user"], name="unique_company_user")
        ]

    def __str__(self):
        return self.nom_entreprise

    @property
    def is_approved(self) -> bool:
        return self.statut_verification == VerificationStatus.APPROVED

    def save(self, *args, **kwargs):
        # « verified » reste synchronisé pour la compatibilité (filtres, anciens écrans).
        self.verified = self.is_approved
        if kwargs.get("update_fields") is not None:
            kwargs["update_fields"] = {*kwargs["update_fields"], "verified"}
        super().save(*args, **kwargs)
