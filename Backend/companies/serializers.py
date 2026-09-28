"""
Sérialiseurs d'entreprise pour TafLocal AI.
"""

from rest_framework import serializers

from .models import Company
from .services import normalize_rccm, rccm_document_error, rccm_error, store_rccm_document


class CompanySerializer(serializers.ModelSerializer):
    """Sérialiseur d'entreprise (le statut de vérification n'est modifiable que par un administrateur)."""

    statut_verification_display = serializers.CharField(source="get_statut_verification_display", read_only=True)
    # Le fichier n'est jamais exposé par URL : seulement sa présence et son nom d'origine.
    document_rccm_disponible = serializers.SerializerMethodField()

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
            "registre_commerce",
            "document_rccm_disponible",
            "document_rccm_nom",
            "statut_verification",
            "statut_verification_display",
            "motif_rejet",
            "verifie_le",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_document_rccm_disponible(self, obj) -> bool:
        return bool(obj.document_rccm)


class CompanyUpdateSerializer(serializers.ModelSerializer):
    """Mise à jour de la fiche par l'entreprise (RCCM ou certificat corrigé : nouvelle vérification)."""

    document_rccm = serializers.FileField(write_only=True, required=False)

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
            "registre_commerce",
            "document_rccm",
        ]

    def validate_document_rccm(self, file):
        error = rccm_document_error(file)
        if error:
            raise serializers.ValidationError(error)
        return file

    def update(self, instance, validated_data):
        document = validated_data.pop("document_rccm", None)
        if document is not None:
            store_rccm_document(instance, document)
        return super().update(instance, validated_data)

    def validate_registre_commerce(self, value):
        rccm = normalize_rccm(value)
        error = rccm_error(rccm)
        if error:
            raise serializers.ValidationError(error)
        duplicates = Company.objects.filter(registre_commerce__iexact=rccm)
        if self.instance is not None:
            duplicates = duplicates.exclude(pk=self.instance.pk)
        if duplicates.exists():
            raise serializers.ValidationError("Ce numéro RCCM est déjà associé à un compte entreprise.")
        return rccm


class CompanyAdminSerializer(CompanySerializer):
    """Vue administrateur : coordonnées du compte pour la vérification."""

    email = serializers.EmailField(source="user.email", read_only=True)
    contact = serializers.SerializerMethodField()
    nombre_offres = serializers.IntegerField(source="jobs.count", read_only=True)

    class Meta(CompanySerializer.Meta):
        fields = [*CompanySerializer.Meta.fields, "email", "contact", "nombre_offres"]
        read_only_fields = fields

    def get_contact(self, obj) -> str:
        return f"{obj.user.prenom or ''} {obj.user.nom or ''}".strip()


class CompanyRejectSerializer(serializers.Serializer):
    motif = serializers.CharField(min_length=5, max_length=1000, trim_whitespace=True)
