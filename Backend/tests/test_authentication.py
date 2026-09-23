"""
Tests d'authentification.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status

from companies.models import Company
from users.models import CandidateProfile, UserRole

from .conftest import PASSWORD

User = get_user_model()


@pytest.mark.django_db
class TestAuthentication:
    def _register(self, api_client, **overrides):
        data = {
            "email": "new@example.com",
            "password": PASSWORD,
            "password2": PASSWORD,
            "role": "CANDIDATE",
            "nom": "Smith",
            "prenom": "Jane",
        }
        data.update(overrides)
        return api_client.post("/api/auth/register/", data, format="json")

    def test_register_candidate_creates_single_profile(self, api_client):
        response = self._register(api_client)
        assert response.status_code == status.HTTP_201_CREATED, response.data
        assert "access" in response.data and "refresh" in response.data
        user = User.objects.get(email="new@example.com")
        assert CandidateProfile.objects.filter(user=user).count() == 1

    def test_register_company_creates_company(self, api_client):
        response = self._register(api_client, email="co@example.com", role="COMPANY", nom_entreprise="New Co")
        assert response.status_code == status.HTTP_201_CREATED, response.data
        company = Company.objects.get(user__email="co@example.com")
        assert company.nom_entreprise == "New Co"

    def test_register_as_admin_is_refused(self, api_client):
        response = self._register(api_client, email="hacker@example.com", role="ADMIN")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert not User.objects.filter(email="hacker@example.com").exists()

    def test_register_duplicate_email(self, api_client, candidate_user):
        response = self._register(api_client, email=candidate_user.email)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login(self, api_client, candidate_user):
        response = api_client.post("/api/auth/login/", {"email": candidate_user.email, "password": PASSWORD})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["user"]["role"] == UserRole.CANDIDATE

    def test_login_wrong_password(self, api_client, candidate_user):
        response = api_client.post("/api/auth/login/", {"email": candidate_user.email, "password": "bad"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_profile(self, authenticated_client, candidate_user):
        response = authenticated_client.get("/api/auth/me/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == candidate_user.email
        assert response.data["candidate_profile"] is not None

    def test_role_cannot_be_escalated(self, authenticated_client, candidate_user):
        response = authenticated_client.patch("/api/auth/profile/", {"role": "ADMIN"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        candidate_user.refresh_from_db()
        assert candidate_user.role == UserRole.CANDIDATE

    def test_logout_blacklists_refresh_token(self, api_client, candidate_user):
        login = api_client.post("/api/auth/login/", {"email": candidate_user.email, "password": PASSWORD})
        refresh = login.data["refresh"]
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        response = api_client.post("/api/auth/logout/", {"refresh_token": refresh}, format="json")
        assert response.status_code == status.HTTP_200_OK
        api_client.credentials()
        reuse = api_client.post("/api/auth/token/refresh/", {"refresh": refresh}, format="json")
        assert reuse.status_code == status.HTTP_401_UNAUTHORIZED
