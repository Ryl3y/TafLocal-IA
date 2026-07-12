"""
Pytest configuration and fixtures for TafLocal AI.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import CandidateProfile, UserRole
from companies.models import Company
from jobs.models import Job

User = get_user_model()


@pytest.fixture
def api_client():
    """API client fixture."""
    return APIClient()


@pytest.fixture
def admin_user(db):
    """Admin user fixture."""
    return User.objects.create_user(
        email="admin@example.com",
        username="admin",
        password="testpass123",
        role=UserRole.ADMIN,
        is_staff=True,
        is_superuser=True,
    )


@pytest.fixture
def candidate_user(db):
    """Candidate user fixture."""
    user = User.objects.create_user(
        email="candidate@example.com",
        username="candidate",
        password="testpass123",
        role=UserRole.CANDIDATE,
    )
    CandidateProfile.objects.create(user=user)
    return user


@pytest.fixture
def company_user(db):
    """Company user fixture."""
    user = User.objects.create_user(
        email="company@example.com",
        username="company",
        password="testpass123",
        role=UserRole.COMPANY,
    )
    Company.objects.create(user=user, nom_entreprise="Tech Corp", secteur="Technology")
    return user


@pytest.fixture
def authenticated_client(api_client, candidate_user):
    """Authenticated API client fixture."""
    refresh = RefreshToken.for_user(candidate_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    """Admin authenticated API client fixture."""
    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.fixture
def company_client(api_client, company_user):
    """Company authenticated API client fixture."""
    refresh = RefreshToken.for_user(company_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.fixture
def job(db, company_user):
    """Job fixture."""
    company = company_user.company
    return Job.objects.create(
        entreprise=company,
        titre="Senior Django Developer",
        description="We are looking for a senior Django developer.",
        localisation="Remote",
        type_contrat="CDI",
        salaire_min=80000,
        salaire_max=120000,
        statut="PUBLISHED",
    )
