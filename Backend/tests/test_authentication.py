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
        # Jetons en cookies HttpOnly, jamais dans le corps lisible par JavaScript.
        assert "access" not in response.data and "refresh" not in response.data
        assert response.cookies["taflocal_access"]["httponly"] and response.cookies["taflocal_refresh"]["httponly"]
        user = User.objects.get(email="new@example.com")
        assert CandidateProfile.objects.filter(user=user).count() == 1

    def test_register_company_creates_company(self, api_client):
        from django.core.files.uploadedfile import SimpleUploadedFile

        response = api_client.post("/api/auth/register/", {
            "email": "co@example.com", "password": PASSWORD, "password2": PASSWORD, "role": "COMPANY",
            "nom": "Smith", "prenom": "Jane", "nom_entreprise": "New Co",
            "registre_commerce": " rc / dla/2023/b/04567 ",
            "document_rccm": SimpleUploadedFile("rccm.pdf", b"%PDF-1.4 test", content_type="application/pdf"),
        }, format="multipart")
        assert response.status_code == status.HTTP_201_CREATED, response.data
        company = Company.objects.get(user__email="co@example.com")
        assert company.nom_entreprise == "New Co"
        assert company.registre_commerce == "RC/DLA/2023/B/04567"
        assert company.statut_verification == "PENDING"
        assert company.document_rccm and company.document_rccm_nom == "rccm.pdf"

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

    def test_login_count_drives_welcome_message(self, api_client):
        # Inscription = première session (bienvenue), chaque connexion suivante l'incrémente (bon retour).
        assert self._register(api_client).data["user"]["nombre_connexions"] == 1
        login = api_client.post("/api/auth/login/", {"email": "new@example.com", "password": PASSWORD})
        assert login.data["user"]["nombre_connexions"] == 2
        assert api_client.get("/api/auth/me/").data["nombre_connexions"] == 2

    def test_first_login_without_registration_session(self, api_client, candidate_user):
        # Compte créé sans passer par l'inscription (ex. par un administrateur) : 1re connexion = bienvenue.
        response = api_client.post("/api/auth/login/", {"email": candidate_user.email, "password": PASSWORD})
        assert response.data["user"]["nombre_connexions"] == 1

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
        refresh = login.cookies["taflocal_refresh"].value
        response = api_client.post("/api/auth/logout/", format="json")  # jeton lu dans le cookie
        assert response.status_code == status.HTTP_200_OK
        assert response.cookies["taflocal_access"].value == ""  # cookies effacés
        reuse = api_client.post("/api/auth/token/refresh/", {"refresh": refresh}, format="json")
        assert reuse.status_code == status.HTTP_401_UNAUTHORIZED
