"""
Filtres personnalisés pour TafLocal AI.
"""

from django.db.models import Q
from django_filters import rest_framework as filters

from applications.models import Application, ApplicationStatus
from jobs.models import ContractType, Job, JobCategory, JobStatus


class JobFilter(filters.FilterSet):
    """Filtres des offres d'emploi."""

    categorie = filters.ChoiceFilter(choices=JobCategory.choices)
    type_contrat = filters.MultipleChoiceFilter(choices=ContractType.choices)
    stage_remunere = filters.BooleanFilter()
    statut = filters.MultipleChoiceFilter(choices=JobStatus.choices)
    localisation = filters.CharFilter(field_name="localisation", lookup_expr="icontains")
    salaire_min = filters.NumberFilter(field_name="salaire_max", lookup_expr="gte")
    salaire_max = filters.NumberFilter(field_name="salaire_min", lookup_expr="lte")
    # Expérience demandée maximale : en mois (experience_max_mois) ou en années (experience_max, ancien paramètre).
    experience_max_mois = filters.NumberFilter(field_name="experience_requise_mois", lookup_expr="lte")
    experience_max = filters.NumberFilter(method="filter_experience_max_years")
    competence = filters.CharFilter(method="filter_competence")

    class Meta:
        model = Job
        fields = ["categorie", "type_contrat", "statut", "experience_requise_mois", "entreprise"]

    def filter_experience_max_years(self, queryset, name, value):
        return queryset.filter(experience_requise_mois__lte=value * 12)

    def filter_competence(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(competences_requises__nom__icontains=value).distinct()


class ApplicationFilter(filters.FilterSet):
    """Filtres des candidatures."""

    statut = filters.MultipleChoiceFilter(choices=ApplicationStatus.choices)
    offre_titre = filters.CharFilter(field_name="offre__titre", lookup_expr="icontains")
    candidat = filters.CharFilter(method="filter_candidate_name")

    class Meta:
        model = Application
        fields = ["statut", "offre"]

    def filter_candidate_name(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(candidate__user__prenom__icontains=value) | Q(candidate__user__nom__icontains=value)
        )
