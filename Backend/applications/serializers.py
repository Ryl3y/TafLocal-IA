"""
Sérialiseurs de candidature pour TafLocal AI.
"""

from rest_framework import serializers

from jobs.serializers import JobSerializer
from users.serializers import CandidateProfileSerializer

from .models import Application, ApplicationStatus


class ApplicationSerializer(serializers.ModelSerializer):
    """Sérialiseur de candidature."""

    offre = JobSerializer(read_only=True)
    candidate = CandidateProfileSerializer(read_only=True)
    statut_display = serializers.CharField(source="get_statut_display", read_only=True)
    lettre_motivation = serializers.SerializerMethodField()
    lettre_generee_par_ia = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            "id",
            "offre",
            "candidate",
            "statut",
            "statut_display",
            "commentaire",
            "lettre_motivation",
            "lettre_generee_par_ia",
            "date_candidature",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def _letter(self, obj):
        try:
            return obj.cover_letter
        except Application.cover_letter.RelatedObjectDoesNotExist:
            return None

    def get_lettre_motivation(self, obj) -> str | None:
        letter = self._letter(obj)
        return letter.contenu if letter else None

    def get_lettre_generee_par_ia(self, obj) -> bool:
        letter = self._letter(obj)
        return letter.generated_by_ai if letter else False


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur de création de candidature."""

    lettre_motivation = serializers.CharField(required=False, allow_blank=True, write_only=True, max_length=10000)
    lettre_generee_par_ia = serializers.BooleanField(required=False, default=False, write_only=True)

    class Meta:
        model = Application
        fields = ["offre", "commentaire", "lettre_motivation", "lettre_generee_par_ia"]

    def validate_offre(self, offre):
        if not offre.is_open:
            raise serializers.ValidationError("Cette offre n'accepte plus de candidatures.")
        return offre

    def validate(self, attrs):
        candidate = self.context["candidate"]
        existing = Application.objects.filter(candidate=candidate, offre=attrs["offre"]).first()
        if existing and existing.statut != ApplicationStatus.WITHDRAWN:
            raise serializers.ValidationError({"offre": "Vous avez déjà postulé à cette offre."})
        return attrs

    def create(self, validated_data):
        from .models import CoverLetter

        letter = validated_data.pop("lettre_motivation", "")
        generated = validated_data.pop("lettre_generee_par_ia", False)
        candidate = validated_data.pop("candidate")
        # Une candidature retirée peut être renouvelée.
        application, _ = Application.objects.update_or_create(
            candidate=candidate,
            offre=validated_data["offre"],
            defaults={"statut": ApplicationStatus.PENDING, "commentaire": validated_data.get("commentaire")},
        )
        if letter.strip():
            CoverLetter.objects.update_or_create(
                candidature=application, defaults={"contenu": letter.strip(), "generated_by_ai": generated}
            )
        return application

    def to_representation(self, instance):
        return ApplicationSerializer(instance, context=self.context).data


class ApplicationUpdateSerializer(serializers.ModelSerializer):
    """Sérialiseur de mise à jour de candidature pour les entreprises."""

    class Meta:
        model = Application
        fields = ["statut", "commentaire"]

    def validate_statut(self, value):
        if value == ApplicationStatus.WITHDRAWN:
            raise serializers.ValidationError("Seul le candidat peut retirer sa candidature.")
        return value

    def to_representation(self, instance):
        return ApplicationSerializer(instance, context=self.context).data
