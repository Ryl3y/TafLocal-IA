"""
Sérialiseurs des résultats du moteur IA.
"""

from rest_framework import serializers

from .engine.matching import score_label


class MatchSerializer(serializers.Serializer):
    """Résultat de compatibilité (score + explication)."""

    score = serializers.IntegerField()
    label = serializers.SerializerMethodField()
    details = serializers.DictField()
    matched_skills = serializers.ListField(child=serializers.CharField())
    missing_skills = serializers.ListField(child=serializers.CharField())
    partial_skills = serializers.ListField(child=serializers.DictField(), required=False)
    required_skills = serializers.ListField(child=serializers.CharField(), required=False)
    skills_inferred = serializers.BooleanField(required=False)
    explanation = serializers.CharField()
    recommendations = serializers.ListField(child=serializers.CharField(), required=False)
    data_quality = serializers.CharField(required=False)
    cached = serializers.BooleanField(required=False)

    def get_label(self, obj) -> str:
        return score_label(obj["score"])


class JobRecommendationSerializer(serializers.Serializer):
    job = serializers.SerializerMethodField()
    match = MatchSerializer()
    already_applied = serializers.BooleanField()

    def get_job(self, obj) -> dict:
        from jobs.serializers import JobSerializer

        return JobSerializer(obj["job"], context=self.context).data


class RankedApplicationSerializer(serializers.Serializer):
    rang = serializers.IntegerField()
    application = serializers.SerializerMethodField()
    match = MatchSerializer()

    def get_application(self, obj) -> dict:
        from applications.serializers import ApplicationSerializer

        return ApplicationSerializer(obj["application"], context=self.context).data


class JobIdSerializer(serializers.Serializer):
    job_id = serializers.UUIDField()


class ExtractSkillsSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=50000)


RANKING_DISCLAIMER = (
    "Indice de compatibilité calculé automatiquement à titre indicatif : "
    "il ne constitue pas une recommandation de recrutement."
)
