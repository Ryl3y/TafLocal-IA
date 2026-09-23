"""
Fixtures pytest pour TafLocal AI.
"""

import pytest
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from ai.services import SkillService
from companies.models import Company
from jobs.models import Job, JobStatus
from users.models import CandidateProfile, UserRole

User = get_user_model()
PASSWORD = "TestPass!2026"


@pytest.fixture(autouse=True)
def _isolation(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path / "media"
    # Pas de limitation de débit pendant les tests.
    settings.REST_FRAMEWORK = {
        **settings.REST_FRAMEWORK,
        "DEFAULT_THROTTLE_CLASSES": [],
        "DEFAULT_THROTTLE_RATES": {k: "10000/min" for k in settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]},
    }
    cache.clear()
    yield
    cache.clear()


def auth_client(user):
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {RefreshToken.for_user(user).access_token}")
    return client


def make_user(email, role, **extra):
    extra.setdefault("nom", "Test")
    extra.setdefault("prenom", role.title())
    return User.objects.create_user(email=email, password=PASSWORD, role=role, **extra)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return make_user("admin@example.com", UserRole.ADMIN, is_staff=True, is_superuser=True)


@pytest.fixture
def candidate_user(db):
    user = make_user("candidate@example.com", UserRole.CANDIDATE, nom="Mballa", prenom="Jean")
    CandidateProfile.objects.create(user=user, ville="Douala")
    return user


@pytest.fixture
def other_candidate_user(db):
    user = make_user("other@example.com", UserRole.CANDIDATE, nom="Ekane", prenom="Marie")
    CandidateProfile.objects.create(user=user, ville="Yaoundé")
    return user


@pytest.fixture
def company_user(db):
    user = make_user("company@example.com", UserRole.COMPANY)
    Company.objects.create(user=user, nom_entreprise="Tech Corp", secteur="Technology")
    return user


@pytest.fixture
def other_company_user(db):
    user = make_user("company2@example.com", UserRole.COMPANY)
    Company.objects.create(user=user, nom_entreprise="Other Corp")
    return user


@pytest.fixture
def authenticated_client(candidate_user):
    return auth_client(candidate_user)


@pytest.fixture
def admin_client(admin_user):
    return auth_client(admin_user)


@pytest.fixture
def company_client(company_user):
    return auth_client(company_user)


@pytest.fixture
def job(db, company_user):
    job = Job.objects.create(
        entreprise=company_user.company,
        titre="Senior Django Developer",
        description="We are looking for a senior Django developer with PostgreSQL and Docker.",
        localisation="Douala",
        type_contrat="CDI",
        salaire_min=80000,
        salaire_max=120000,
        experience_requise=3,
        niveau_etude="Bac+5",
        statut=JobStatus.PUBLISHED,
    )
    SkillService.set_job_skills(job, ["Python", "Django", "PostgreSQL", "Docker"])
    return job


@pytest.fixture
def other_job(db, company_user):
    job = Job.objects.create(
        entreprise=company_user.company,
        titre="Comptable",
        description="Comptabilité générale OHADA, fiscalité, Sage et Excel.",
        localisation="Yaoundé",
        type_contrat="CDD",
        experience_requise=2,
        statut=JobStatus.PUBLISHED,
    )
    SkillService.set_job_skills(job, ["Comptabilité", "Fiscalité", "Sage", "Microsoft Excel"])
    return job
