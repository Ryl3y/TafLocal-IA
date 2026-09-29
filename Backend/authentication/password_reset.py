"""
Réinitialisation du mot de passe par code à 6 chiffres envoyé par e-mail.

Déroulé :
1. ``request_code``  : l'utilisateur donne son e-mail ; un code lui est envoyé ;
2. ``verify_code``   : il saisit le code ; on lui remet un jeton de réinitialisation signé ;
3. ``reset_password``: il choisit un nouveau mot de passe avec ce jeton.

Sécurité : réponses identiques que le compte existe ou non, code haché en base,
5 essais maximum, expiration, délai minimal entre deux envois, déconnexion de
toutes les sessions après le changement.
"""

import logging
import re
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core import signing
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from .models import PasswordResetCode, hash_reset_code

logger = logging.getLogger(__name__)
User = get_user_model()

TOKEN_SALT = "authentication.password-reset"


def _setting(name: str, default: int) -> int:
    return int(getattr(settings, name, default))


class PasswordResetError(Exception):
    """Code invalide, expiré ou jeton de réinitialisation refusé."""


def find_user(email: str):
    """Compte actif correspondant à l'e-mail (sans tenir compte de la casse)."""
    return User.objects.filter(email__iexact=(email or "").strip(), is_active=True).first()


def _send_code_email(user, code: str) -> None:
    minutes = _setting("PASSWORD_RESET_CODE_TTL_MINUTES", 15)
    send_mail(
        subject="TafLocal AI – votre code de réinitialisation",
        message=(
            f"Bonjour {user.prenom or ''},\n\n"
            f"Votre code de réinitialisation du mot de passe est : {code}\n"
            f"Il est valable {minutes} minutes.\n\n"
            "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : "
            "votre mot de passe reste inchangé.\n\n— L'équipe TafLocal AI"
        ),
        from_email=None,  # DEFAULT_FROM_EMAIL
        recipient_list=[user.email],
        fail_silently=False,
    )


def request_code(email: str) -> None:
    """Envoyer un code si le compte existe. L'appelant ne sait jamais si c'est le cas."""
    user = find_user(email)
    if user is None:
        return

    cooldown = timedelta(seconds=_setting("PASSWORD_RESET_RESEND_SECONDS", 60))
    latest = user.password_reset_codes.first()
    if latest and latest.used_at is None and timezone.now() - latest.created_at < cooldown:
        return  # un code vient déjà d'être envoyé

    code = f"{secrets.randbelow(1_000_000):06d}"
    with transaction.atomic():
        # Une nouvelle demande annule les codes précédents.
        user.password_reset_codes.filter(used_at__isnull=True).update(used_at=timezone.now())
        PasswordResetCode.objects.create(
            user=user,
            code_hash=hash_reset_code(code),
            expires_at=timezone.now() + timedelta(minutes=_setting("PASSWORD_RESET_CODE_TTL_MINUTES", 15)),
        )
    try:
        _send_code_email(user, code)
    except Exception as exc:  # SMTP injoignable, identifiants refusés…
        # Même réponse côté client ; l'erreur est visible dans le terminal du serveur.
        logger.error("Envoi du code de réinitialisation impossible pour %s : %s", user.email, exc)


def verify_code(email: str, code: str) -> str:
    """Vérifier le code et retourner un jeton de réinitialisation signé."""
    user = find_user(email)
    entry = user.password_reset_codes.first() if user else None
    max_attempts = _setting("PASSWORD_RESET_MAX_ATTEMPTS", 5)
    if entry is None or not entry.is_active or entry.attempts >= max_attempts:
        raise PasswordResetError("Code invalide ou expiré. Demandez un nouveau code.")
    if not entry.matches(re.sub(r"\s", "", code or "")):
        entry.attempts += 1
        entry.save(update_fields=["attempts"])
        remaining = max_attempts - entry.attempts
        if remaining <= 0:
            raise PasswordResetError("Trop d'essais. Demandez un nouveau code.")
        raise PasswordResetError(f"Code incorrect. Il vous reste {remaining} essai(s).")
    entry.verified_at = timezone.now()
    entry.save(update_fields=["verified_at"])
    return signing.dumps({"code": str(entry.pk)}, salt=TOKEN_SALT)


def reset_password(token: str, new_password: str):
    """Changer le mot de passe avec un jeton valide, puis fermer toutes les sessions."""
    max_age = _setting("PASSWORD_RESET_CODE_TTL_MINUTES", 15) * 60
    try:
        payload = signing.loads(token, salt=TOKEN_SALT, max_age=max_age)
    except signing.BadSignature as exc:  # inclut SignatureExpired
        raise PasswordResetError("Le lien de réinitialisation a expiré. Recommencez la procédure.") from exc

    with transaction.atomic():
        entry = (
            PasswordResetCode.objects.select_for_update().select_related("user")
            .filter(pk=payload.get("code")).first()
        )
        if entry is None or entry.used_at is not None or entry.verified_at is None:
            raise PasswordResetError("Ce code a déjà été utilisé. Recommencez la procédure.")
        user = entry.user
        validate_password(new_password, user)  # lève ValidationError (mot de passe trop faible…)
        user.set_password(new_password)
        user.save(update_fields=["password", "updated_at"])
        entry.used_at = timezone.now()
        entry.save(update_fields=["used_at"])

    _logout_everywhere(user)
    from .lockout import unlock

    unlock(user.email)  # le propriétaire a prouvé son identité : fin du verrouillage éventuel
    return user


def _logout_everywhere(user) -> None:
    """Révoquer tous les jetons de rafraîchissement : les anciennes sessions sont fermées."""
    from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

    for token in OutstandingToken.objects.filter(user=user):
        BlacklistedToken.objects.get_or_create(token=token)
