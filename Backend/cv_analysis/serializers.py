"""
Sérialiseurs d'analyse de CV pour TafLocal AI.
"""

from rest_framework import serializers
from .models import CV, CVAnalysis, DetectedSkill, MissingSkill, AIRecommendation


class CVSerializer(serializers.ModelSerializer):
    """Sérialiseur de CV."""

    class Meta:
        model = CV
        fields = [
            "id",
            "candidate",
            "file",
            "file_name",
            "file_size",
            "file_type",
            "extracted_text",
            "is_processed",
            "uploaded_at",
            "updated_at",
        ]
        read_only_fields = ["id", "uploaded_at", "updated_at"]


class CVUploadSerializer(serializers.ModelSerializer):
    """Sérialiseur de téléchargement de CV."""

    file = serializers.FileField()

    class Meta:
        model = CV
        fields = ["file"]


class DetectedSkillSerializer(serializers.ModelSerializer):
    """Sérialiseur de compétence détectée."""

    class Meta:
        model = DetectedSkill
        fields = ["id", "name", "category", "proficiency_level", "years_experience"]


class MissingSkillSerializer(serializers.ModelSerializer):
    """Sérialiseur de compétence manquante."""

    class Meta:
        model = MissingSkill
        fields = ["id", "name", "importance"]


class AIRecommendationSerializer(serializers.ModelSerializer):
    """Sérialiseur de recommandation IA."""

    class Meta:
        model = AIRecommendation
        fields = ["id", "category", "title", "description", "priority"]


class CVAnalysisSerializer(serializers.ModelSerializer):
    """Sérialiseur d'analyse de CV."""

    cv = CVSerializer(read_only=True)
    detected_skills = DetectedSkillSerializer(many=True, read_only=True)
    missing_skills = MissingSkillSerializer(many=True, read_only=True)
    recommendations = AIRecommendationSerializer(many=True, read_only=True)

    class Meta:
        model = CVAnalysis
        fields = [
            "id",
            "cv",
            "employability_score",
            "strengths",
            "weaknesses",
            "recommendations_data",
            "analyzed_at",
            "updated_at",
            "detected_skills",
            "missing_skills",
            "recommendations",
        ]
        read_only_fields = ["id", "analyzed_at", "updated_at"]
