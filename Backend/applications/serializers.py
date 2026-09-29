"""
Sérialiseurs de candidature pour TafLocal AI.
"""

from rest_framework import serializers

from cv_analysis.models import CV
from jobs.models import CoverLetterRequirement
from jobs.serializers import JobSerializer
from users.serializers import CandidateProfileSerializer

from .models import Application, ApplicationStatus


class ApplicationCVSerializer(serializers.ModelSerializer):
    """CV joint à la candidature (sans chemin de fichier : téléchargement via /cvs/{id}/download/)."""

    class Meta:
        model = CV
        fields = ["id", "file_name", "file_type", "uploaded_at"]
        read_only_fields = fields


class ApplicationSerializer(serializers.ModelSerializer):
    """Sérialiseur de candidature."""

    offre = JobSerializer(read_only=True)
    candidate = CandidateProfileSerializer(read_only=True)
    cv = ApplicationCVSerializer(read_only=True)
    statut_display = serializers.CharField(source="get_statut_display", read_only=True)
    lettre_motivation = serializers.SerializerMethodField()
    lettre_generee_par_ia = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            "id",
            "offre",
            "candidate",
            "cv",
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


MIN_REQUIRED_LETTER_LENGTH = 100


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Création de candidature : CV obligatoire, lettre selon l'exigence de l'offre."""

    cv = serializers.PrimaryKeyRelatedField(queryset=CV.objects.all(), required=False, allow_null=True)
    lettre_motivation = serializers.CharField(required=False, allow_blank=True, write_only=True, max_length=10000)
    lettre_generee_par_ia = serializers.BooleanField(required=False, default=False, write_only=True)

    class Meta:
        model = Application
        fields = ["offre", "cv", "commentaire", "lettre_motivation", "lettre_generee_par_ia"]

    def validate_offre(self, offre):
        if not offre.is_open:
            raise serializers.ValidationError("Cette offre n'accepte plus de candidatures.")
        return offre

    def validate(self, attrs):
        candidate = self.context["candidate"]
        job = attrs["offre"]
        existing = Application.objects.filter(candidate=candidate, offre=job).first()
        if existing and existing.statut != ApplicationStatus.WITHDRAWN:
            raise serializers.ValidationError({"offre": "Vous avez déjà postulé à cette offre."})

        # CV obligatoire : celui choisi (qui doit appartenir au candidat) ou, à défaut, le plus récent.
        cv = attrs.get("cv")
        if cv is not None and cv.candidate_id != candidate.pk:
            raise serializers.ValidationError({"cv": "Ce CV ne vous appartient pas."})
        if cv is None:
            cv = CV.objects.filter(candidate=candidate).order_by("-uploaded_at").first()
        if cv is None:
            raise serializers.ValidationError(
                {"cv": "Un CV est obligatoire pour postuler. Déposez votre CV avant d'envoyer votre candidature."}
            )
        attrs["cv"] = cv

        # Lettre de motivation selon l'exigence fixée par l'entreprise.
        letter = (attrs.get("lettre_motivation") or "").strip()
        if job.lettre_motivation == CoverLetterRequirement.REQUIRED and len(letter) < MIN_REQUIRED_LETTER_LENGTH:
            raise serializers.ValidationError({
                "lettre_motivation": (
                    "Cette offre exige une lettre de motivation "
                    f"({MIN_REQUIRED_LETTER_LENGTH} caractères minimum)."
                )
            })
        if job.lettre_motivation == CoverLetterRequirement.NOT_REQUESTED:
            attrs["lettre_motivation"] = ""  # non demandée : on ne la transmet pas
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
            defaults={
                "statut": ApplicationStatus.PENDING,
                "commentaire": validated_data.get("commentaire"),
                "cv": validated_data["cv"],
            },
        )
        if letter.strip():
            CoverLetter.objects.update_or_create(
                candidature=application, defaults={"contenu": letter.strip(), "generated_by_ai": generated}
            )
        else:
            # Candidature renouvelée sans lettre : on n'envoie pas l'ancienne.
            CoverLetter.objects.filter(candidature=application).delete()
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
