"""
Sérialiseurs d'authentification pour TafLocal AI.
"""

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework import status
from rest_framework.exceptions import APIException, AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from companies.models import Company, VerificationStatus

from . import lockout
from common.middleware import client_ip
from companies.services import normalize_rccm, rccm_document_error, rccm_error, store_rccm_document
from users.models import CandidateProfile, User, UserRole

# Rôles qu'un visiteur peut choisir à l'inscription (jamais ADMIN).
PUBLIC_ROLES = [(UserRole.CANDIDATE, UserRole.CANDIDATE.label), (UserRole.COMPANY, UserRole.COMPANY.label)]


class AccountLocked(APIException):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    default_code = "account_locked"

    def __init__(self, seconds: int):
        minutes = max(1, -(-seconds // 60))
        super().__init__(
            f"Trop de tentatives de connexion. Réessayez dans {minutes} minute(s) "
            "ou réinitialisez votre mot de passe."
        )
        self.wait = seconds


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
        request = self.context.get("request")

        # Compte verrouillé après trop d'échecs : on ne teste même pas le mot de passe.
        remaining = lockout.locked_seconds(email)
        if remaining:
            raise AccountLocked(remaining)

        # authenticate() utilise notre backend EmailBackend
        user = authenticate(request=request, username=email, password=password)

        if user is None:
            lockout.register_failure(email, client_ip(request) if request else None)
            remaining = lockout.locked_seconds(email)
            if remaining:
                raise AccountLocked(remaining)
            raise AuthenticationFailed("Identifiants invalides")
        lockout.register_success(email)

        if not user.is_active:
            raise AuthenticationFailed("Ce compte est désactivé")

        user.nombre_connexions += 1
        user.last_login = timezone.now()
        user.save(update_fields=["nombre_connexions", "last_login"])

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
                'nombre_connexions': user.nombre_connexions,
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
    registre_commerce = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=60)
    document_rccm = serializers.FileField(write_only=True, required=False, allow_null=True)
    username = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["email", "password", "password2", "role", "nom", "prenom", "telephone", "nom_entreprise",
                  "registre_commerce", "document_rccm", "username"]

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

        # Entreprise : numéro RCCM obligatoire, vérifié ensuite par un administrateur.
        if attrs.get("role") == UserRole.COMPANY:
            if not (attrs.get("nom_entreprise") or "").strip():
                raise serializers.ValidationError({"nom_entreprise": "Le nom de l'entreprise est requis."})
            rccm = normalize_rccm(attrs.get("registre_commerce"))
            error = rccm_error(rccm)
            if error:
                raise serializers.ValidationError({"registre_commerce": error})
            if Company.objects.filter(registre_commerce__iexact=rccm).exists():
                raise serializers.ValidationError(
                    {"registre_commerce": "Ce numéro RCCM est déjà associé à un compte entreprise."}
                )
            attrs["registre_commerce"] = rccm
            document_error = rccm_document_error(attrs.get("document_rccm"))
            if document_error:
                raise serializers.ValidationError({"document_rccm": document_error})
        else:
            attrs.pop("registre_commerce", None)
            attrs.pop("document_rccm", None)
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop("password2")
        nom_entreprise = validated_data.pop("nom_entreprise", None)
        registre_commerce = validated_data.pop("registre_commerce", None)
        document_rccm = validated_data.pop("document_rccm", None)
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        if user.role == UserRole.COMPANY:
            company = Company(
                user=user,
                nom_entreprise=nom_entreprise.strip(),
                registre_commerce=registre_commerce,
                statut_verification=VerificationStatus.PENDING,
            )
            store_rccm_document(company, document_rccm)
            company.save()
            _notify_admins_new_company(company)
        elif user.role == UserRole.CANDIDATE:
            CandidateProfile.objects.create(user=user)
        return user


def _notify_admins_new_company(company):
    from notifications.services import NotificationService

    admins = User.objects.filter(role=UserRole.ADMIN, is_active=True)
    NotificationService.notify_system(
        admins,
        "Nouvelle entreprise à vérifier",
        f"« {company.nom_entreprise} » (RCCM {company.registre_commerce}) attend votre validation.",
    )


class UserProfileSerializer(serializers.ModelSerializer):
    """Sérialiseur de profil utilisateur (le rôle n'est jamais modifiable ici)."""

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "nom", "prenom", "role", "telephone", "is_active", "date_inscription",
            "nombre_connexions",
        ]
        read_only_fields = ["id", "email", "role", "is_active", "date_inscription", "nombre_connexions"]


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
    """Étape 1 : demander un code de réinitialisation par e-mail."""

    email = serializers.EmailField(required=True)


PasswordResetRequestSerializer = ResetPasswordSerializer


class PasswordResetVerifySerializer(ResetPasswordSerializer):
    """Étape 2 : vérifier le code reçu."""

    code = serializers.RegexField(r"^\s*\d{6}\s*$", error_messages={"invalid": "Le code contient 6 chiffres."})


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Étape 3 : choisir le nouveau mot de passe (validé avec l'utilisateur dans le service)."""

    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, max_length=128, trim_whitespace=False)
