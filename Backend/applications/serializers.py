"""
Sérialiseurs de candidature pour TafLocal AI.
"""

from rest_framework import serializers
from .models import Application, ApplicationStatus
from jobs.serializers import JobSerializer
from users.serializers import CandidateProfileSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    """Sérialiseur de candidature."""

    offre = JobSerializer(read_only=True)
    candidate = CandidateProfileSerializer(read_only=True)
    statut_display = serializers.CharField(source="get_statut_display", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "offre",
            "candidate",
            "statut",
            "statut_display",
            "commentaire",
            "date_candidature",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "date_candidature", "created_at", "updated_at"]


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur de création de candidature."""

    class Meta:
        model = Application
        fields = ["offre", "commentaire"]


class ApplicationUpdateSerializer(serializers.ModelSerializer):
    """Sérialiseur de mise à jour de candidature pour les entreprises."""

    class Meta:
        model = Application
        fields = ["statut", "commentaire"]
