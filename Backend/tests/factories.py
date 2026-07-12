"""
Factory Boy factories for TafLocal AI.
"""

import factory
from django.contrib.auth import get_user_model
from users.models import CandidateProfile, CompanyProfile, UserRole
from companies.models import Company
from jobs.models import Job, ContractType, JobStatus
from applications.models import Application, ApplicationStatus

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    """User factory."""

    email = factory.Faker("email")
    username = factory.Faker("user_name")
    password = factory.PostGenerationMethodCall("set_password", "testpass123")

    class Meta:
        model = User


class AdminUserFactory(UserFactory):
    """Admin user factory."""

    role = Role.ADMIN
    is_staff = True
    is_superuser = True


class CandidateUserFactory(UserFactory):
    """Candidate user factory."""

    role = Role.CANDIDATE


class CompanyUserFactory(UserFactory):
    """Company user factory."""

    role = Role.COMPANY


class CandidateProfileFactory(factory.django.DjangoModelFactory):
    """Candidate profile factory."""

    user = factory.SubFactory(CandidateUserFactory)
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    experience_years = factory.Faker("pyint", min_value=0, max_value=20)

    class Meta:
        model = CandidateProfile


class CompanyProfileFactory(factory.django.DjangoModelFactory):
    """Company profile factory."""

    user = factory.SubFactory(CompanyUserFactory)
    company_name = factory.Faker("company")
    industry = factory.Faker("word")

    class Meta:
        model = CompanyProfile


class CompanyFactory(factory.django.DjangoModelFactory):
    """Company factory."""

    profile = factory.SubFactory(CompanyProfileFactory)

    class Meta:
        model = Company


class JobFactory(factory.django.DjangoModelFactory):
    """Job factory."""

    company = factory.SubFactory(CompanyFactory)
    title = factory.Faker("job")
    description = factory.Faker("text")
    requirements = factory.Faker("text")
    responsibilities = factory.Faker("text")
    location = factory.Faker("city")
    employment_type = EmploymentType.FULL_TIME
    experience_level = ExperienceLevel.MID
    salary_min = factory.Faker("pyint", min_value=30000, max_value=100000)
    salary_max = factory.Faker("pyint", min_value=100000, max_value=200000)

    class Meta:
        model = Job


class ApplicationFactory(factory.django.DjangoModelFactory):
    """Application factory."""

    job = factory.SubFactory(JobFactory)
    candidate = factory.SubFactory(CandidateProfileFactory)
    status = ApplicationStatus.PENDING

    class Meta:
        model = Application
