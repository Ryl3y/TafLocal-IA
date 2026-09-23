"""
Sérialiseurs d'entreprise pour TafLocal AI.
"""

from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    """Sérialiseur d'entreprise."""

    class Meta:
        model = Company
        fields = [
            "id",
            "user",
            "nom_entreprise",
            "secteur",
            "description",
            "site_web",
            "adresse",
            "ville",
            "telephone",
            "logo",
            "verified",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "verified", "created_at", "updated_at"]


class CompanyUpdateSerializer(serializers.ModelSerializer):
    """Sérialiseur de mise à jour d'entreprise."""

    class Meta:
        model = Company
        fields = [
            "nom_entreprise",
            "secteur",
            "description",
            "site_web",
            "adresse",
            "ville",
            "telephone",
            "logo",
        ]
