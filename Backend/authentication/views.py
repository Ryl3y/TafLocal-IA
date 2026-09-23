"""
Vues d'authentification pour TafLocal AI.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserProfileSerializer,
    CandidateProfileSerializer,
    ChangePasswordSerializer,
    LogoutSerializer,
    ResetPasswordSerializer,
)
from users.models import CandidateProfile, UserRole
from companies.models import Company
from companies.serializers import CompanySerializer
from common.throttling import AnonBurstRateThrottle, AnonSustainedRateThrottle

User = get_user_model()


AUTH_THROTTLES = [AnonBurstRateThrottle, AnonSustainedRateThrottle]


class CustomTokenObtainPairView(TokenObtainPairView):
    """Vue personnalisée de token JWT avec données utilisateur supplémentaires."""

    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = AUTH_THROTTLES


class RegisterView(generics.CreateAPIView):
    """Vue d'inscription utilisateur (le profil candidat/entreprise est créé par le sérialiseur)."""

    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    throttle_classes = AUTH_THROTTLES

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Générer les tokens JWT pour connecter automatiquement l'utilisateur
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "Utilisateur enregistré avec succès",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LogoutView(generics.GenericAPIView):
    """Vue de déconnexion - blacklist le token de rafraîchissement."""

    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            RefreshToken(serializer.validated_data["refresh"]).blacklist()
        except TokenError:
            return Response({"error": "Jeton invalide ou déjà révoqué."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "Déconnexion réussie"}, status=status.HTTP_200_OK)


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


class ResetPasswordView(generics.GenericAPIView):
    """Vue de réinitialisation de mot de passe."""

    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer
    throttle_classes = AUTH_THROTTLES

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # L'envoi d'email n'est pas encore configuré (aucun serveur SMTP) ; la
        # réponse est volontairement identique que le compte existe ou non,
        # pour ne pas révéler les adresses inscrites.
        return Response(
            {"message": "Lien de réinitialisation envoyé par email si l'utilisateur existe"},
            status=status.HTTP_200_OK,
        )


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
