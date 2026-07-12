"""
Authentication tests for TafLocal AI.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()


@pytest.mark.django_db
class TestAuthentication:
    """Test authentication endpoints."""

    def test_register_candidate(self, api_client):
        """Test candidate registration."""
        data = {
            "email": "newcandidate@example.com",
            "username": "newcandidate",
            "password": "testpass123",
            "password2": "testpass123",
            "role": "CANDIDATE",
            "first_name": "Jane",
            "last_name": "Smith",
        }
        response = api_client.post("/api/auth/register/", data)
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(email="newcandidate@example.com").exists()

    def test_register_company(self, api_client):
        """Test company registration."""
        data = {
            "email": "newcompany@example.com",
            "username": "newcompany",
            "password": "testpass123",
            "password2": "testpass123",
            "role": "COMPANY",
            "company_name": "New Company",
        }
        response = api_client.post("/api/auth/register/", data)
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(email="newcompany@example.com").exists()

    def test_login(self, api_client, candidate_user):
        """Test user login."""
        data = {
            "email": "candidate@example.com",
            "password": "testpass123",
        }
        response = api_client.post("/api/auth/login/", data)
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data

    def test_get_profile(self, authenticated_client, candidate_user):
        """Test getting user profile."""
        response = authenticated_client.get("/api/auth/me/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == candidate_user.email

    def test_logout(self, authenticated_client, candidate_user):
        """Test user logout."""
        # First get tokens
        response = authenticated_client.post("/api/auth/login/", {
            "email": "candidate@example.com",
            "password": "testpass123",
        })
        refresh_token = response.data["refresh"]
        
        # Logout
        response = authenticated_client.post("/api/auth/logout/", {"refresh_token": refresh_token})
        assert response.status_code == status.HTTP_200_OK
