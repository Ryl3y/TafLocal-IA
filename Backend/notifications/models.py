"""
Modèles de notification pour TafLocal AI.
Correspondance avec le schéma PostgreSQL.
"""

import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _


class NotificationType(models.TextChoices):
    """Énumération des types de notification (correspond au PostgreSQL ENUM notification_type)."""
    APPLICATION = "APPLICATION", _("Application")
    INTERVIEW = "INTERVIEW", _("Interview")
    JOB = "JOB", _("Job")
    SYSTEM = "SYSTEM", _("System")
    PROFILE = "PROFILE", _("Profile")


class Notification(models.Model):
    """Modèle de notification correspondant à la table notification PostgreSQL."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="notifications")
    titre = models.CharField(max_length=255, verbose_name=_("Titre"))
    message = models.TextField(verbose_name=_("Message"))
    type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
        verbose_name=_("Type")
    )
    lu = models.BooleanField(default=False, verbose_name=_("Lu"))
    date_envoi = models.DateTimeField(auto_now_add=True, verbose_name=_("Date d'envoi"))

    class Meta:
        db_table = "notification"
        verbose_name = _("Notification")
        verbose_name_plural = _("Notifications")
        ordering = ["-date_envoi"]
        indexes = [
            models.Index(fields=["-date_envoi"]),
            models.Index(fields=["lu"]),
            models.Index(fields=["type"]),
        ]

    def __str__(self):
        return f"{self.titre} - {self.user.email}"
