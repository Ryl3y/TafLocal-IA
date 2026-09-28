"""
Jetons JWT transportés dans des cookies HttpOnly (illisibles par JavaScript).

- Le jeton d'accès n'est envoyé qu'aux routes /api/.
- Le jeton de rafraîchissement n'est envoyé qu'aux routes /api/auth/ (rafraîchissement,
  déconnexion) : il ne circule jamais avec les autres requêtes.
- SameSite=Strict : le navigateur ne les joint jamais à une requête venant d'un autre site.
- Secure dès que le site est servi en HTTPS.
"""

from django.conf import settings

ACCESS_COOKIE = "taflocal_access"
REFRESH_COOKIE = "taflocal_refresh"
ACCESS_PATH = "/api/"
REFRESH_PATH = "/api/auth/"


def _common() -> dict:
    return {
        "httponly": True,
        "secure": getattr(settings, "SECURE_SSL", False),
        "samesite": getattr(settings, "AUTH_COOKIE_SAMESITE", "Strict"),
    }


def set_auth_cookies(response, access: str | None = None, refresh: str | None = None):
    lifetimes = settings.SIMPLE_JWT
    if access:
        response.set_cookie(
            ACCESS_COOKIE, access, path=ACCESS_PATH,
            max_age=int(lifetimes["ACCESS_TOKEN_LIFETIME"].total_seconds()), **_common(),
        )
    if refresh:
        response.set_cookie(
            REFRESH_COOKIE, refresh, path=REFRESH_PATH,
            max_age=int(lifetimes["REFRESH_TOKEN_LIFETIME"].total_seconds()), **_common(),
        )
    return response


def clear_auth_cookies(response):
    samesite = getattr(settings, "AUTH_COOKIE_SAMESITE", "Strict")
    response.delete_cookie(ACCESS_COOKIE, path=ACCESS_PATH, samesite=samesite)
    response.delete_cookie(REFRESH_COOKIE, path=REFRESH_PATH, samesite=samesite)
    return response


def move_tokens_to_cookies(response):
    """Retirer access/refresh du corps JSON et les placer dans les cookies."""
    data = getattr(response, "data", None)
    if isinstance(data, dict):
        access, refresh = data.pop("access", None), data.pop("refresh", None)
        set_auth_cookies(response, access, refresh)
    return response
