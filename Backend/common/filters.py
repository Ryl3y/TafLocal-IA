"""
Custom filters for TafLocal AI.
"""

import django_filters
from django_filters import rest_framework as filters
from jobs.models import Job, EmploymentType, ExperienceLevel
from applications.models import Application, ApplicationStatus


class JobFilter(filters.FilterSet):
    """Custom filter for Job model."""

    min_salary = filters.NumberFilter(field_name="salary_min", lookup_expr="gte")
    max_salary = filters.NumberFilter(field_name="salary_max", lookup_expr="lte")
    salary_range = filters.RangeFilter(field_name="salary_min")
    search = filters.CharFilter(method="filter_search")
    employment_type = filters.MultipleChoiceFilter(choices=EmploymentType.choices)
    experience_level = filters.MultipleChoiceFilter(choices=ExperienceLevel.choices)

    class Meta:
        model = Job
        fields = ["employment_type", "experience_level", "remote", "is_active"]

    def filter_search(self, queryset, name, value):
        """Custom search filter."""
        if value:
            return queryset.filter(
                title__icontains=value
            ) | queryset.filter(
                description__icontains=value
            ) | queryset.filter(
                requirements__icontains=value
            ) | queryset.filter(
                location__icontains=value
            )
        return queryset


class ApplicationFilter(filters.FilterSet):
    """Custom filter for Application model."""

    status = filters.MultipleChoiceFilter(choices=ApplicationStatus.choices)
    job_title = filters.CharFilter(field_name="job__title", lookup_expr="icontains")
    candidate_name = filters.CharFilter(method="filter_candidate_name")

    class Meta:
        model = Application
        fields = ["status", "job"]

    def filter_candidate_name(self, queryset, name, value):
        """Filter by candidate name."""
        if value:
            return queryset.filter(
                candidate__first_name__icontains=value
            ) | queryset.filter(
                candidate__last_name__icontains=value
            )
        return queryset
