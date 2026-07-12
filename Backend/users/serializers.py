
"""
Sérialiseurs utilisateur pour TafLocal AI.
"""

from rest_framework import serializers
from .models import User, CandidateProfile


class UserSerializer(serializers.ModelSerializer):
    """Sérialiseur utilisateur."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "nom",
            "prenom",
            "role",
            "telephone",
            "is_active",
            "date_inscription",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_active", "date_inscription", "created_at", "updated_at"]


class UserUpdateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour mettre à jour un utilisateur."""

    class Meta:
        model = User
        fields = ["nom", "prenom", "telephone"]


class CandidateProfileSerializer(serializers.ModelSerializer):
    """Sérialiseur de profil candidat."""

    user = UserSerializer(read_only=True)

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


class CandidateProfileUpdateSerializer(serializers.ModelSerializer):
    """Sérialiseur de mise à jour de profil candidat."""

    class Meta:
        model = CandidateProfile
        fields = [
            "date_naissance",
            "genre",
            "adresse",
            "ville",
            "photo",
            "biographie",
            "linkedin",
            "github",
            "portfolio",
        ]
