"""
Authentification JWT avec contrôle de la vérification des entreprises.

Une entreprise dont le compte n'a pas été validé par un administrateur peut se
connecter, mais ne peut appeler que les routes ci-dessous (consulter / corriger
sa fiche, lire ses notifications, gérer sa session). Le contrôle est fait ici,
au niveau de l'authentification, pour s'appliquer à *toutes* les vues de l'API,
y compris celles ajoutées plus tard.
"""

from rest_framework import status
from rest_framework.authentication import CSRFCheck
from rest_framework.exceptions import APIException, PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from users.models import UserRole

from .cookies import ACCESS_COOKIE

# Préfixes d'URL accessibles à une entreprise non validée.
PENDING_COMPANY_ALLOWED_PREFIXES = (
    "/api/auth/",           # me, logout, change-password, profile
    "/api/companies/me/",   # consulter / corriger sa fiche (dont le RCCM)
    "/api/notifications/",  # recevoir la décision de l'administrateur
    "/api/users/me/",
)


class CompanyNotApproved(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_code = "company_not_approved"


def company_access_error(user):
    """Réponse de refus si l'utilisateur est une entreprise non validée, sinon None."""
    if getattr(user, "role", None) != UserRole.COMPANY:
        return None
    from companies.models import Company, VerificationStatus

    company = Company.objects.filter(user=user).only("statut_verification", "motif_rejet").first()
    statut = company.statut_verification if company else VerificationStatus.PENDING
    if statut == VerificationStatus.APPROVED:
        return None
    message = (
        "Votre entreprise a été refusée lors de la vérification. Corrigez vos informations pour la soumettre à nouveau."
        if statut == VerificationStatus.REJECTED
        else "Votre entreprise est en cours de vérification par notre équipe. "
             "Vous pourrez utiliser la plateforme dès sa validation."
    )
    return CompanyNotApproved({
        "detail": message,
        "code": "company_not_approved",
        "statut_verification": statut,
        "motif_rejet": company.motif_rejet if company else "",
    })


def enforce_csrf(request):
    """Contrôle CSRF de Django (même mécanisme que SessionAuthentication de DRF).

    Indispensable dès que l'authentification repose sur un cookie : le navigateur
    joint le cookie automatiquement, il faut donc prouver que la requête vient bien
    de notre interface (en-tête X-CSRFToken).
    """

    def dummy_get_response(request):  # pragma: no cover - jamais appelée
        return None

    check = CSRFCheck(dummy_get_response)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise PermissionDenied(f"Vérification CSRF refusée : {reason}")


class CompanyApprovalJWTAuthentication(JWTAuthentication):
    """JWT (en-tête Authorization OU cookie HttpOnly) + blocage des entreprises non validées."""

    def authenticate(self, request):
        header = self.get_header(request)
        if header is not None:
            # Clients API (mobile, scripts, tests) : en-tête « Authorization: Bearer … ».
            result = super().authenticate(request)
        else:
            raw_token = request.COOKIES.get(ACCESS_COOKIE)
            if not raw_token:
                return None
            try:
                validated = self.get_validated_token(raw_token)
            except InvalidToken:
                # Cookie expiré : visiteur anonyme (les routes protégées répondront 401 et
                # l'interface renouvellera la session ; les routes publiques restent utilisables).
                return None
            result = (self.get_user(validated), validated)
            enforce_csrf(request)
        if result is None:
            return None
        user, token = result
        if not request.path.startswith(PENDING_COMPANY_ALLOWED_PREFIXES):
            error = company_access_error(user)
            if error is not None:
                raise error
        return user, token
