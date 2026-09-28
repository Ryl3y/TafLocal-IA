"""
Sérialiseurs d'analyse de CV pour TafLocal AI.
"""

import os

from django.conf import settings
from rest_framework import serializers

from .models import CV, AIRecommendation, CVAnalysis, DetectedSkill, MissingSkill

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}

# Signatures (« nombres magiques ») attendues en tête de fichier.
_SIGNATURES = {
    ".pdf": (b"%PDF-",),
    ".docx": (b"PK\x03\x04",),                         # archive ZIP (Office Open XML)
    ".doc": (b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1",),     # Word 97-2003 (OLE2)
}


def content_matches_extension(file, extension: str) -> bool:
    """Vérifier que le contenu réel correspond à l'extension déclarée."""
    position = file.tell() if hasattr(file, "tell") else 0
    file.seek(0)
    head = file.read(4096)
    file.seek(position)
    if extension == ".txt":
        # Un fichier texte ne contient pas d'octet nul (contrairement à tout exécutable ou binaire).
        return b"\x00" not in head
    return head.startswith(_SIGNATURES.get(extension, (b"",)))


class CVSerializer(serializers.ModelSerializer):
    """Sérialiseur de CV."""

    analysis_id = serializers.SerializerMethodField()
    employability_score = serializers.SerializerMethodField()
    analysis_status = serializers.SerializerMethodField()

    class Meta:
        model = CV
        fields = [
            "id",
            "candidate",
            # « file » n'est volontairement pas exposé : le CV se télécharge via /cvs/{id}/download/.
            "file_name",
            "file_size",
            "file_type",
            "is_processed",
            "analysis_id",
            "analysis_status",
            "employability_score",
            "uploaded_at",
            "updated_at",
        ]
        read_only_fields = fields

    def _analysis(self, obj):
        try:
            return obj.analysis
        except CVAnalysis.DoesNotExist:
            return None

    def get_analysis_id(self, obj) -> int | None:
        analysis = self._analysis(obj)
        return analysis.id if analysis else None

    def get_employability_score(self, obj) -> int | None:
        analysis = self._analysis(obj)
        return analysis.employability_score if analysis else None

    def get_analysis_status(self, obj) -> str | None:
        analysis = self._analysis(obj)
        return analysis.status if analysis else None


class CVUploadSerializer(serializers.ModelSerializer):
    """Sérialiseur de téléchargement de CV."""

    file = serializers.FileField()

    class Meta:
        model = CV
        fields = ["file"]

    def validate_file(self, file):
        max_size = getattr(settings, "CV_MAX_UPLOAD_SIZE", 5 * 1024 * 1024)
        if file.size > max_size:
            raise serializers.ValidationError(
                f"Le fichier ne doit pas dépasser {max_size // (1024 * 1024)} Mo."
            )
        extension = os.path.splitext(file.name)[1].lower()
        if extension not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError("Formats acceptés : PDF, DOCX, DOC ou TXT.")
        if not content_matches_extension(file, extension):
            # Fichier déguisé (ex. exécutable renommé en .pdf) : refusé avant tout stockage.
            raise serializers.ValidationError("Le contenu du fichier ne correspond pas à son extension.")
        return file

    def to_representation(self, instance):
        return CVSerializer(instance, context=self.context).data


class DetectedSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetectedSkill
        fields = ["id", "name", "category", "proficiency_level", "years_experience"]


class MissingSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = MissingSkill
        fields = ["id", "name", "importance"]


class AIRecommendationSerializer(serializers.ModelSerializer):
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
            "status",
            "error_message",
            "employability_score",
            "score_details",
            "summary",
            "experience_years",
            "education_level",
            "strengths",
            "weaknesses",
            "recommendations_data",
            "analyzed_at",
            "updated_at",
            "detected_skills",
            "missing_skills",
            "recommendations",
        ]
        read_only_fields = fields
