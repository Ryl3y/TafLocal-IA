"""
Factories factory_boy alignées sur les modèles réels de TafLocal AI.
"""

import factory
from django.contrib.auth import get_user_model

from applications.models import Application, ApplicationStatus
from companies.models import Company
from jobs.models import ContractType, Job, JobStatus
from users.models import CandidateProfile, UserRole

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    username = factory.LazyAttribute(lambda o: o.email)
    nom = factory.Faker("last_name")
    prenom = factory.Faker("first_name")
    password = factory.PostGenerationMethodCall("set_password", "TestPass!2026")

    class Meta:
        model = User


class CandidateUserFactory(UserFactory):
    role = UserRole.CANDIDATE


class CompanyUserFactory(UserFactory):
    role = UserRole.COMPANY


class CandidateProfileFactory(factory.django.DjangoModelFactory):
    user = factory.SubFactory(CandidateUserFactory)
    ville = "Douala"

    class Meta:
        model = CandidateProfile


class CompanyFactory(factory.django.DjangoModelFactory):
    user = factory.SubFactory(CompanyUserFactory)
    nom_entreprise = factory.Faker("company")

    class Meta:
        model = Company


class JobFactory(factory.django.DjangoModelFactory):
    entreprise = factory.SubFactory(CompanyFactory)
    titre = factory.Faker("job")
    description = factory.Faker("paragraph")
    localisation = "Douala"
    type_contrat = ContractType.CDI
    statut = JobStatus.PUBLISHED

    class Meta:
        model = Job


class ApplicationFactory(factory.django.DjangoModelFactory):
    offre = factory.SubFactory(JobFactory)
    candidate = factory.SubFactory(CandidateProfileFactory)
    statut = ApplicationStatus.PENDING

    class Meta:
        model = Application
