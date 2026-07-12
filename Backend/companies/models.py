"""
Modèles d'entreprise pour TafLocal AI.
Correspondance avec le schéma PostgreSQL.
"""

import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _


class Company(models.Model):
    """Modèle d'entreprise correspondant à la table entreprise PostgreSQL."""

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
