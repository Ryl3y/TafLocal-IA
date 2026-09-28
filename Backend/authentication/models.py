"""
Modèles d'authentification : codes de réinitialisation du mot de passe.
"""

import hashlib
import hmac
import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


def hash_reset_code(code: str) -> str:
    """Empreinte HMAC du code : le code lui-même n'est jamais stocké."""
    return hmac.new(settings.SECRET_KEY.encode(), f"password-reset:{code}".encode(), hashlib.sha256).hexdigest()


class PasswordResetCode(models.Model):
    """Code à usage unique envoyé par e-mail pour réinitialiser un mot de passe."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="password_reset_codes")
    code_hash = models.CharField(max_length=64)
    attempts = models.PositiveSmallIntegerField(default=0, verbose_name=_("Essais"))
    expires_at = models.DateTimeField(verbose_name=_("Expire le"))
    verified_at = models.DateTimeField(blank=True, null=True, verbose_name=_("Vérifié le"))
    used_at = models.DateTimeField(blank=True, null=True, verbose_name=_("Utilisé le"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Créé le"))

    class Meta:
        db_table = "reinitialisation_mot_de_passe"
        verbose_name = _("Code de réinitialisation")
        verbose_name_plural = _("Codes de réinitialisation")
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "created_at"])]

    def __str__(self):
        return f"Code de réinitialisation – {self.user}"

    @property
    def is_active(self) -> bool:
        return self.used_at is None and self.expires_at > timezone.now()

    def matches(self, code: str) -> bool:
        return hmac.compare_digest(self.code_hash, hash_reset_code(code))
