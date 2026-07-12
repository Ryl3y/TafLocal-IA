"""
Vues d'authentification pour TafLocal AI.
"""

from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserProfileSerializer,
    CandidateProfileSerializer,
    ChangePasswordSerializer,
    ResetPasswordSerializer,
)
from users.models import CandidateProfile, UserRole
from companies.models import Company
from companies.serializers import CompanySerializer

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Vue personnalisée de token JWT avec données utilisateur supplémentaires."""

    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Vue d'inscription utilisateur."""

    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        print("Données reçues pour l'inscription:", request.data)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Créer le profil en fonction du rôle
        if user.role == UserRole.CANDIDATE:
            CandidateProfile.objects.create(
                user=user,
            )
        elif user.role == UserRole.COMPANY:
            nom_entreprise = request.data.get("nom_entreprise") or f"{user.prenom} {user.nom}"
            Company.objects.create(
                user=user,
                nom_entreprise=nom_entreprise,
            )
        
        # Générer les tokens JWT pour connecter automatiquement l'utilisateur
        from rest_framework_simplejwt.tokens import RefreshToken
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

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Déconnexion réussie"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
        user.save()
        return Response({"message": "Mot de passe changé avec succès"}, status=status.HTTP_200_OK)


class ResetPasswordView(generics.GenericAPIView):
    """Vue de réinitialisation de mot de passe."""

    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        
        try:
            user = User.objects.get(email=email)
            # TODO : Implémenter l'envoi réel d'email avec lien de réinitialisation
            return Response(
                {"message": "Lien de réinitialisation envoyé par email si l'utilisateur existe"},
                status=status.HTTP_200_OK,
            )
        except User.DoesNotExist:
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
