"""
Sérialiseurs d'emploi pour TafLocal AI.
"""

from rest_framework import serializers

from .models import EXPERIENCE_MAX_MONTHS, EMPLOYMENT_CONTRACTS, format_months, STAGE_MAX_MONTHS, ContractType, Job, JobCategory, JobStatus


class SkillNamesField(serializers.ListField):
    """Liste de noms de compétences, lue depuis/écrite vers ``competences_requises``."""

    child = serializers.CharField(max_length=100)

    def __init__(self, **kwargs):
        kwargs.setdefault("required", False)
        kwargs.setdefault("max_length", 30)
        super().__init__(**kwargs)

    def to_representation(self, value):
        return [skill.nom for skill in value.all()]


class JobSerializer(serializers.ModelSerializer):
    """Sérialiseur d'emploi (lecture)."""

    entreprise_nom = serializers.CharField(source="entreprise.nom_entreprise", read_only=True)
    entreprise_logo = serializers.CharField(source="entreprise.logo", read_only=True)
    entreprise_ville = serializers.CharField(source="entreprise.ville", read_only=True)
    type_contrat_display = serializers.CharField(source="get_type_contrat_display", read_only=True)
    statut_display = serializers.CharField(source="get_statut_display", read_only=True)
    lettre_motivation_display = serializers.CharField(source="get_lettre_motivation_display", read_only=True)
    categorie_display = serializers.CharField(source="get_categorie_display", read_only=True)
    experience_requise_display = serializers.SerializerMethodField()
    competences_requises = SkillNamesField(read_only=True)
    nombre_candidatures = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            "id",
            "entreprise",
            "entreprise_nom",
            "entreprise_logo",
            "entreprise_ville",
            "titre",
            "description",
            "exigences",
            "competences_requises",
            "categorie",
            "categorie_display",
            "duree_stage_mois",
            "stage_remunere",
            "localisation",
            "type_contrat",
            "type_contrat_display",
            "salaire_min",
            "salaire_max",
            "devise",
            "experience_requise_mois",
            "experience_requise_display",
            "niveau_etude",
            "lettre_motivation",
            "lettre_motivation_display",
            "date_publication",
            "date_expiration",
            "statut",
            "statut_display",
            "nombre_candidatures",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_experience_requise_display(self, obj) -> str:
        return format_months(obj.experience_requise_mois)

    def get_nombre_candidatures(self, obj) -> int | None:
        # Annoté par la vue pour éviter une requête par offre.
        return getattr(obj, "nombre_candidatures", None)


class JobWriteSerializer(serializers.ModelSerializer):
    """Sérialiseur de création / mise à jour d'une offre."""

    competences_requises = SkillNamesField()

    class Meta:
        model = Job
        fields = [
            "entreprise",
            "titre",
            "description",
            "exigences",
            "competences_requises",
            "categorie",
            "duree_stage_mois",
            "stage_remunere",
            "localisation",
            "type_contrat",
            "salaire_min",
            "salaire_max",
            "devise",
            "experience_requise_mois",
            "niveau_etude",
            "lettre_motivation",
            "date_expiration",
            "statut",
        ]
        extra_kwargs = {
            # L'entreprise est déduite de l'utilisateur connecté (seul un admin peut la choisir).
            "entreprise": {"required": False},
            "statut": {"required": False},
            "categorie": {"required": False},
        }

    def validate_categorie(self, value):
        # Le type d'offre est choisi à la création : le changer ensuite fausserait les candidatures reçues.
        if self.instance is not None and value != self.instance.categorie:
            raise serializers.ValidationError("Le type d'offre (emploi ou stage) ne peut pas être modifié.")
        return value

    def validate_experience_requise_mois(self, value):
        if value is not None and not 0 <= value <= EXPERIENCE_MAX_MONTHS:
            raise serializers.ValidationError("L'expérience requise doit être comprise entre 0 mois et 50 ans.")
        return value

    def validate_statut(self, value):
        if self.instance is None and value not in {JobStatus.DRAFT, JobStatus.PUBLISHED}:
            raise serializers.ValidationError("Une nouvelle offre doit être en brouillon ou publiée.")
        return value

    def validate(self, attrs):
        salaire_min = attrs.get("salaire_min", getattr(self.instance, "salaire_min", None))
        salaire_max = attrs.get("salaire_max", getattr(self.instance, "salaire_max", None))
        if salaire_min is not None and salaire_max is not None and salaire_min > salaire_max:
            raise serializers.ValidationError(
                {"salaire_max": "Le salaire maximum doit être supérieur ou égal au salaire minimum."}
            )
        for field in ("salaire_min", "salaire_max"):
            if attrs.get(field) is not None and attrs[field] < 0:
                raise serializers.ValidationError({field: "Le salaire ne peut pas être négatif."})
        return self._validate_category(attrs)

    def _value(self, attrs, field, default=None):
        return attrs[field] if field in attrs else getattr(self.instance, field, default)

    def _validate_category(self, attrs):
        categorie = self._value(attrs, "categorie", JobCategory.EMPLOI)
        if categorie == JobCategory.STAGE:
            duree = self._value(attrs, "duree_stage_mois")
            remunere = self._value(attrs, "stage_remunere")
            errors = {}
            if duree is None:
                errors["duree_stage_mois"] = "Indiquez la durée du stage (en mois)."
            elif not 1 <= duree <= STAGE_MAX_MONTHS:
                errors["duree_stage_mois"] = f"La durée d'un stage est comprise entre 1 et {STAGE_MAX_MONTHS} mois."
            if remunere is None:
                errors["stage_remunere"] = "Précisez si le stage est rémunéré ou non."
            if errors:
                raise serializers.ValidationError(errors)
            attrs["type_contrat"] = ContractType.INTERNSHIP
            if not remunere:
                # Stage non rémunéré : aucune gratification affichée.
                attrs["salaire_min"] = attrs["salaire_max"] = None
        else:
            type_contrat = self._value(attrs, "type_contrat", ContractType.CDI)
            if type_contrat not in EMPLOYMENT_CONTRACTS:
                raise serializers.ValidationError(
                    {"type_contrat": "Pour un stage, choisissez le type d'offre « Stage »."}
                )
            attrs["duree_stage_mois"] = None
            attrs["stage_remunere"] = None
        return attrs

    def _save_skills(self, job, names):
        if names is None:
            return
        from ai.services import SkillService

        SkillService.set_job_skills(job, names)

    def create(self, validated_data):
        names = validated_data.pop("competences_requises", None)
        job = super().create(validated_data)
        if names is None:
            # Aucune compétence fournie : le moteur IA les déduit de la description.
            from ai.engine.skills import extract_skill_names

            names = extract_skill_names(f"{job.titre}\n{job.description}\n{job.exigences or ''}")[:15]
        self._save_skills(job, names)
        return job

    def update(self, instance, validated_data):
        names = validated_data.pop("competences_requises", None)
        job = super().update(instance, validated_data)
        self._save_skills(job, names)
        return job

    def to_representation(self, instance):
        return JobSerializer(instance, context=self.context).data


# Compatibilité avec les anciens noms
JobCreateSerializer = JobWriteSerializer
JobUpdateSerializer = JobWriteSerializer
