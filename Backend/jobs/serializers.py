"""
Sérialiseurs d'emploi pour TafLocal AI.
"""

from rest_framework import serializers
from .models import Job, ContractType, JobStatus


class JobSerializer(serializers.ModelSerializer):
    """Sérialiseur d'emploi."""

    entreprise_nom = serializers.CharField(source="entreprise.nom_entreprise", read_only=True)
    entreprise_logo = serializers.CharField(source="entreprise.logo", read_only=True)
    type_contrat_display = serializers.CharField(source="get_type_contrat_display", read_only=True)
    statut_display = serializers.CharField(source="get_statut_display", read_only=True)

    class Meta:
        model = Job
        fields = [
            "id",
            "entreprise",
            "entreprise_nom",
            "entreprise_logo",
            "titre",
            "description",
            "localisation",
            "type_contrat",
            "type_contrat_display",
            "salaire_min",
            "salaire_max",
            "devise",
            "experience_requise",
            "niveau_etude",
            "date_publication",
            "date_expiration",
            "statut",
            "statut_display",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "date_publication", "created_at", "updated_at"]


class JobCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur de création d'emploi."""

    class Meta:
        model = Job
        fields = [
            "entreprise",
            "titre",
            "description",
            "localisation",
            "type_contrat",
            "salaire_min",
            "salaire_max",
            "devise",
            "experience_requise",
            "niveau_etude",
            "date_expiration",
        ]


class JobUpdateSerializer(serializers.ModelSerializer):
    """Sérialiseur de mise à jour d'emploi."""

    class Meta:
        model = Job
        fields = [
            "titre",
            "description",
            "localisation",
            "type_contrat",
            "salaire_min",
            "salaire_max",
            "devise",
            "experience_requise",
            "niveau_etude",
            "date_expiration",
            "statut",
        ]


class JobMatchSerializer(serializers.Serializer):
    """Sérialiseur pour les résultats de matching."""

    job_id = serializers.UUIDField()
    job_title = serializers.CharField()
    company_name = serializers.CharField()
    location = serializers.CharField()
    contract_type = serializers.CharField()
    salary_min = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    salary_max = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    skill_score = serializers.FloatField()
    experience_score = serializers.FloatField()
    location_score = serializers.FloatField()
    global_score = serializers.FloatField()
    matched_skills = serializers.ListField(child=serializers.CharField(), allow_empty=True)
    explanation = serializers.CharField(allow_null=True, required=False)
    is_cached = serializers.BooleanField(required=False, default=False)
