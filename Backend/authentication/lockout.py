"""
Verrouillage temporaire après des échecs de connexion répétés (anti force brute).

Complète la limitation par IP : un attaquant qui répartit ses essais sur plusieurs
machines (ou adresses) reste bloqué au niveau du compte visé. Le compteur est tenu
par adresse e-mail, que le compte existe ou non, pour ne rien révéler.
"""

import hashlib
import logging

from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger("security")


def _setting(name: str, default: int) -> int:
    return int(getattr(settings, name, default))


def _key(kind: str, email: str) -> str:
    # E-mail haché : pas de données personnelles en clair dans le cache.
    digest = hashlib.sha256((email or "").strip().lower().encode()).hexdigest()
    return f"auth:{kind}:{digest}"


def locked_seconds(email: str) -> int:
    """Secondes restantes de verrouillage (0 si le compte n'est pas verrouillé)."""
    expires_at = cache.get(_key("locked", email))
    if not expires_at:
        return 0
    import time

    return max(0, int(expires_at - time.time()))


def register_failure(email: str, ip: str | None = None) -> int:
    """Compter un échec ; verrouille le compte au-delà du seuil. Retourne le nombre d'échecs."""
    import time

    window = _setting("LOGIN_FAILURE_WINDOW_MINUTES", 15) * 60
    key = _key("failures", email)
    cache.add(key, 0, timeout=window)
    try:
        failures = cache.incr(key)
    except ValueError:  # clé expirée entre add() et incr()
        cache.set(key, 1, timeout=window)
        failures = 1

    if failures >= _setting("LOGIN_MAX_FAILURES", 5):
        lock_seconds = _setting("LOGIN_LOCKOUT_MINUTES", 15) * 60
        cache.set(_key("locked", email), time.time() + lock_seconds, timeout=lock_seconds)
        cache.delete(key)
        logger.warning("Compte verrouillé après %s échecs de connexion (ip=%s).", failures, ip)
    return failures


def register_success(email: str) -> None:
    cache.delete_many([_key("failures", email), _key("locked", email)])


def unlock(email: str) -> None:
    """Déverrouillage manuel (ex. après réinitialisation du mot de passe)."""
    register_success(email)
