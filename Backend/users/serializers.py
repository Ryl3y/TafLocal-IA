"""
Sérialiseurs utilisateur pour TafLocal AI.
"""

from rest_framework import serializers

from .models import CandidateProfile, CandidateSkill, Education, Skill, User, WorkExperience


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
        read_only_fields = fields


class UserUpdateSerializer(serializers.ModelSerializer):
    """Mise à jour des informations personnelles (ni le rôle ni l'email)."""

    class Meta:
        model = User
        fields = ["nom", "prenom", "telephone"]

    def to_representation(self, instance):
        return UserSerializer(instance, context=self.context).data


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "nom", "categorie"]
        read_only_fields = fields


class CandidateSkillSerializer(serializers.ModelSerializer):
    """Compétence déclarée par le candidat (création par nom)."""

    nom = serializers.CharField(source="skill.nom", max_length=100)
    categorie = serializers.CharField(source="skill.categorie", read_only=True)
    niveau_display = serializers.CharField(source="get_niveau_display", read_only=True)

    class Meta:
        model = CandidateSkill
        fields = ["id", "nom", "categorie", "niveau", "niveau_display", "annees_experience", "created_at"]
        read_only_fields = ["id", "categorie", "niveau_display", "created_at"]

    def validate_annees_experience(self, value):
        if value is not None and not 0 <= value <= 50:
            raise serializers.ValidationError("Valeur comprise entre 0 et 50.")
        return value

    def _resolve_skill(self, validated_data):
        from ai.services import SkillService

        name = validated_data.pop("skill", {}).get("nom", "")
        skill = SkillService.get_or_create(name)
        if skill is None:
            raise serializers.ValidationError({"nom": "Nom de compétence invalide."})
        return skill

    def create(self, validated_data):
        skill = self._resolve_skill(validated_data)
        candidate = validated_data.pop("candidate")
        instance, _ = CandidateSkill.objects.update_or_create(
            candidate=candidate, skill=skill, defaults=validated_data
        )
        return instance

    def update(self, instance, validated_data):
        if "skill" in validated_data:
            instance.skill = self._resolve_skill(validated_data)
        return super().update(instance, validated_data)


class WorkExperienceSerializer(serializers.ModelSerializer):
    duree_mois = serializers.IntegerField(read_only=True)

    class Meta:
        model = WorkExperience
        fields = ["id", "poste", "entreprise", "description", "date_debut", "date_fin", "en_cours",
                  "duree_mois", "created_at", "updated_at"]
        read_only_fields = ["id", "duree_mois", "created_at", "updated_at"]

    def validate(self, attrs):
        debut = attrs.get("date_debut", getattr(self.instance, "date_debut", None))
        fin = attrs.get("date_fin", getattr(self.instance, "date_fin", None))
        en_cours = attrs.get("en_cours", getattr(self.instance, "en_cours", False))
        if en_cours:
            attrs["date_fin"] = None
        elif debut and fin and fin < debut:
            raise serializers.ValidationError({"date_fin": "La date de fin doit suivre la date de début."})
        return attrs


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ["id", "diplome", "etablissement", "description", "date_debut", "date_fin", "en_cours",
                  "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        debut = attrs.get("date_debut", getattr(self.instance, "date_debut", None))
        fin = attrs.get("date_fin", getattr(self.instance, "date_fin", None))
        if debut and fin and fin < debut:
            raise serializers.ValidationError({"date_fin": "La date de fin doit suivre la date de début."})
        return attrs


class CandidateProfileSerializer(serializers.ModelSerializer):
    """Profil candidat complet."""

    user = UserSerializer(read_only=True)
    competences = CandidateSkillSerializer(many=True, read_only=True)
    experiences = WorkExperienceSerializer(many=True, read_only=True)
    formations = EducationSerializer(many=True, read_only=True)
    experience_annees = serializers.FloatField(read_only=True)

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
            "experience_annees",
            "competences",
            "experiences",
            "formations",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


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

    def to_representation(self, instance):
        return CandidateProfileSerializer(instance, context=self.context).data

