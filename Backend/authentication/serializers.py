"""
Sérialiseurs d'authentification pour TafLocal AI.
"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from users.models import User, CandidateProfile, UserRole


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Sérialiseur de token JWT personnalisé avec données utilisateur supplémentaires."""
    username_field = 'email'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Renommer le champ username en email
        if 'username' in self.fields:
            self.fields['email'] = self.fields.pop('username')

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        
        # Utiliser Django authenticate qui utilisera notre backend personnalisé
        from django.contrib.auth import authenticate
        user = authenticate(request=self.context.get('request'), username=email, password=password)
        
        if user is None:
            from rest_framework.exceptions import AuthenticationFailed
            raise AuthenticationFailed("Identifiants invalides")
        
        if not user.is_active:
            from rest_framework.exceptions import AuthenticationFailed
            raise AuthenticationFailed("Ce compte est désactivé")
        
        # Générer les tokens JWT
        refresh = self.get_token(user)
        
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
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
    role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.CANDIDATE)
    nom_entreprise = serializers.CharField(write_only=True, required=False, allow_blank=True)
    username = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["email", "password", "password2", "role", "nom", "prenom", "telephone", "nom_entreprise", "username"]

    def validate(self, attrs):
        print("Validation des données d'inscription:", attrs)
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Les champs mot de passe ne correspondent pas."})
        return attrs

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
    """Sérialiseur de profil utilisateur."""

    class Meta:
        model = User
        fields = ["id", "email", "username", "nom", "prenom", "role", "telephone", "is_active"]
        read_only_fields = ["id", "email", "is_active"]


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


class ResetPasswordSerializer(serializers.Serializer):
    """Sérialiseur de réinitialisation de mot de passe."""

    email = serializers.EmailField(required=True)
