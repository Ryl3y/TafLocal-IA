"""
Sérialiseurs d'authentification pour TafLocal AI.
"""

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from companies.models import Company
from users.models import CandidateProfile, User, UserRole

# Rôles qu'un visiteur peut choisir à l'inscription (jamais ADMIN).
PUBLIC_ROLES = [(UserRole.CANDIDATE, UserRole.CANDIDATE.label), (UserRole.COMPANY, UserRole.COMPANY.label)]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Sérialiseur de token JWT personnalisé avec données utilisateur supplémentaires."""
    username_field = 'email'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Renommer le champ username en email
        if 'username' in self.fields:
            self.fields['email'] = self.fields.pop('username')

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip()
        password = attrs.get("password")

        # authenticate() utilise notre backend EmailBackend
        user = authenticate(request=self.context.get("request"), username=email, password=password)

        if user is None:
            raise AuthenticationFailed("Identifiants invalides")

        if not user.is_active:
            raise AuthenticationFailed("Ce compte est désactivé")

        # Générer les tokens JWT
        refresh = self.get_token(user)
        
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': str(user.id),
                'email': user.email,
                'username': user.username,
                'role': user.role,
                'nom': getattr(user, 'nom', ''),
                'prenom': getattr(user, 'prenom', ''),
            }
        }
        
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["role"] = user.role
        token["username"] = user.username
        return token


class RegisterSerializer(serializers.ModelSerializer):
    """Sérialiseur d'inscription."""

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(choices=PUBLIC_ROLES, default=UserRole.CANDIDATE)
    nom_entreprise = serializers.CharField(write_only=True, required=False, allow_blank=True)
    username = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["email", "password", "password2", "role", "nom", "prenom", "telephone", "nom_entreprise", "username"]

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Un compte existe déjà avec cet email.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Les champs mot de passe ne correspondent pas."})
        username = (attrs.get("username") or "").strip() or attrs["email"]
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError({"username": "Ce nom d'utilisateur est déjà pris."})
        attrs["username"] = username
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop("password2")
        nom_entreprise = validated_data.pop("nom_entreprise", None)
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        if user.role == UserRole.COMPANY:
            company_name = nom_entreprise or user.prenom or user.nom or user.email
            Company.objects.create(user=user, nom_entreprise=company_name)
        elif user.role == UserRole.CANDIDATE:
            CandidateProfile.objects.create(user=user)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Sérialiseur de profil utilisateur (le rôle n'est jamais modifiable ici)."""

    class Meta:
        model = User
        fields = ["id", "email", "username", "nom", "prenom", "role", "telephone", "is_active", "date_inscription"]
        read_only_fields = ["id", "email", "role", "is_active", "date_inscription"]


class CandidateProfileSerializer(serializers.ModelSerializer):
    """Sérialiseur de profil candidat."""

    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = CandidateProfile
        fields = [
            "id",
            "user",
            "date_naissance",
            "genre",
            "adresse",
            "ville",
            "photo",
            "biographie",
            "linkedin",
            "github",
            "portfolio",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ChangePasswordSerializer(serializers.Serializer):
    """Sérialiseur de changement de mot de passe."""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])


class LogoutSerializer(serializers.Serializer):
    """Accepte « refresh » (convention SimpleJWT) ou « refresh_token »."""

    refresh = serializers.CharField(required=False)
    refresh_token = serializers.CharField(required=False)

    def validate(self, attrs):
        token = attrs.get("refresh") or attrs.get("refresh_token")
        if not token:
            raise serializers.ValidationError({"refresh": "Le jeton de rafraîchissement est requis."})
        return {"refresh": token}


class ResetPasswordSerializer(serializers.Serializer):
    """Sérialiseur de réinitialisation de mot de passe."""

    email = serializers.EmailField(required=True)
