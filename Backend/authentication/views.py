"""
Vues d'authentification pour TafLocal AI.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import status, generics
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie

from .authentication import enforce_csrf
from .cookies import REFRESH_COOKIE, clear_auth_cookies, move_tokens_to_cookies, set_auth_cookies

from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserProfileSerializer,
    CandidateProfileSerializer,
    ChangePasswordSerializer,
    LogoutSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    PasswordResetVerifySerializer,
)
from . import password_reset
from users.models import CandidateProfile, UserRole
from companies.models import Company
from companies.serializers import CompanySerializer
from common.throttling import AnonBurstRateThrottle, AnonSustainedRateThrottle, PasswordResetRateThrottle

User = get_user_model()


AUTH_THROTTLES = [AnonBurstRateThrottle, AnonSustainedRateThrottle]


class BrowserCSRFMixin:
    """Routes publiques qui posent ou utilisent les cookies de session (connexion, inscription,
    rafraîchissement, déconnexion, réinitialisation) : un navigateur doit présenter le jeton
    anti-CSRF, sinon un site tiers pourrait déclencher ces actions à l'insu de l'utilisateur.
    Les clients hors navigateur (sans en-tête Origin) n'utilisent pas les cookies : non concernés.
    """

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if request.method not in ("GET", "HEAD", "OPTIONS") and request.META.get("HTTP_ORIGIN"):
            enforce_csrf(request)


@extend_schema(description="Jeton anti-CSRF à renvoyer dans l'en-tête X-CSRFToken des requêtes modifiantes.")
@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_token(request):
    return Response({"csrfToken": get_token(request)})


class CustomTokenObtainPairView(BrowserCSRFMixin, TokenObtainPairView):
    """Connexion : les jetons sont posés dans des cookies HttpOnly, jamais renvoyés au JavaScript."""

    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = AUTH_THROTTLES
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            move_tokens_to_cookies(response)
        return response


class CookieTokenRefreshView(BrowserCSRFMixin, TokenRefreshView):
    """Rafraîchissement : lit le jeton dans le cookie (ou le corps pour les clients API)."""

    authentication_classes = []
    throttle_classes = AUTH_THROTTLES

    def post(self, request, *args, **kwargs):
        from_cookie = "refresh" not in request.data
        data = {"refresh": request.COOKIES.get(REFRESH_COOKIE, "")} if from_cookie else request.data
        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
        except (TokenError, InvalidToken, DRFValidationError):
            response = Response({"detail": "Session expirée. Veuillez vous reconnecter."},
                                status=status.HTTP_401_UNAUTHORIZED)
            return clear_auth_cookies(response) if from_cookie else response
        response = Response(serializer.validated_data, status=status.HTTP_200_OK)
        return move_tokens_to_cookies(response) if from_cookie else response


class RegisterView(BrowserCSRFMixin, generics.CreateAPIView):
    """Vue d'inscription utilisateur (le profil candidat/entreprise est créé par le sérialiseur)."""

    queryset = User.objects.all()
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = RegisterSerializer
    throttle_classes = AUTH_THROTTLES

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # L'inscription ouvre la première session : l'accueil affichera le message de bienvenue.
        user.nombre_connexions = 1
        user.last_login = timezone.now()
        user.save(update_fields=["nombre_connexions", "last_login"])

        # Connexion automatique : jetons posés en cookies HttpOnly.
        refresh = RefreshToken.for_user(user)
        response = Response(
            {"message": "Utilisateur enregistré avec succès", "user": UserProfileSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )
        return set_auth_cookies(response, str(refresh.access_token), str(refresh))


class LogoutView(BrowserCSRFMixin, generics.GenericAPIView):
    """Déconnexion : révoque le jeton de rafraîchissement et efface les cookies.

    Accessible même avec un jeton d'accès expiré (révoquer un jeton qu'on détient est sans risque).
    """

    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = LogoutSerializer

    def post(self, request):
        token = request.data.get("refresh") or request.data.get("refresh_token") or request.COOKIES.get(REFRESH_COOKIE)
        response = Response({"message": "Déconnexion réussie"}, status=status.HTTP_200_OK)
        if token:
            try:
                RefreshToken(token).blacklist()
            except TokenError:
                if not request.COOKIES.get(REFRESH_COOKIE):
                    return Response({"error": "Jeton invalide ou déjà révoqué."},
                                    status=status.HTTP_400_BAD_REQUEST)
        return clear_auth_cookies(response)


class ChangePasswordView(generics.GenericAPIView):
    """Vue de changement de mot de passe."""

    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"error": "L'ancien mot de passe est incorrect"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password", "updated_at"])
        return Response({"message": "Mot de passe changé avec succès"}, status=status.HTTP_200_OK)


RESET_REQUEST_MESSAGE = "Si un compte correspond, un code de vérification vient d'être envoyé."


class PasswordResetRequestView(BrowserCSRFMixin, generics.GenericAPIView):
    """Étape 1 : envoyer un code à 6 chiffres par e-mail.

    La réponse est identique que le compte existe ou non (pas de divulgation des comptes).
    """

    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = PasswordResetRequestSerializer
    throttle_classes = [PasswordResetRateThrottle, *AUTH_THROTTLES]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        password_reset.request_code(serializer.validated_data["email"])
        return Response(
            {
                "message": RESET_REQUEST_MESSAGE,
                "expires_in_minutes": settings.PASSWORD_RESET_CODE_TTL_MINUTES,
                "resend_after_seconds": settings.PASSWORD_RESET_RESEND_SECONDS,
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetVerifyView(BrowserCSRFMixin, generics.GenericAPIView):
    """Étape 2 : vérifier le code ; retourne un jeton de réinitialisation."""

    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = PasswordResetVerifySerializer
    throttle_classes = AUTH_THROTTLES

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            token = password_reset.verify_code(data["email"], data["code"])
        except password_reset.PasswordResetError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"token": token}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(BrowserCSRFMixin, generics.GenericAPIView):
    """Étape 3 : définir le nouveau mot de passe ; toutes les sessions existantes sont fermées."""

    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = PasswordResetConfirmSerializer
    throttle_classes = AUTH_THROTTLES

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            password_reset.reset_password(data["token"], data["new_password"])
        except password_reset.PasswordResetError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except DjangoValidationError as exc:
            return Response({"new_password": list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "Mot de passe réinitialisé. Vous pouvez vous connecter."}, status=status.HTTP_200_OK)


class ResetPasswordView(PasswordResetRequestView):
    """Ancien endpoint /reset-password/ : identique à /password-reset/request/."""


class ProfileView(generics.RetrieveUpdateAPIView):
    """Vue de profil utilisateur."""

    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


@extend_schema(responses=UserProfileSerializer, description="Utilisateur connecté et son profil (candidat ou entreprise).")
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """Obtenir le profil utilisateur actuel avec données spécifiques au rôle."""
    user = request.user
    data = UserProfileSerializer(user).data
    
    if user.role == UserRole.CANDIDATE:
        try:
            candidate_profile = user.candidate_profile
            data["candidate_profile"] = CandidateProfileSerializer(candidate_profile).data
        except CandidateProfile.DoesNotExist:
            data["candidate_profile"] = None
    elif user.role == UserRole.COMPANY:
        try:
            company_profile = user.company
            data["company_profile"] = CompanySerializer(company_profile).data
        except Company.DoesNotExist:
            data["company_profile"] = None
    
    return Response(data)
