"""
Application tests for TafLocal AI.
"""

import pytest
from rest_framework import status


@pytest.mark.django_db
class TestApplications:
    """Test application endpoints."""

    def test_create_application(self, authenticated_client, job, candidate_user):
        """Test creating a job application."""
        data = {
            "job": job.id,
            "cover_letter": "I am very interested in this position.",
        }
        response = authenticated_client.post("/api/applications/", data)
        assert response.status_code == status.HTTP_201_CREATED

    def test_list_applications_as_candidate(self, authenticated_client, candidate_user):
        """Test listing applications as candidate."""
        response = authenticated_client.get("/api/applications/")
        assert response.status_code == status.HTTP_200_OK

    def test_list_applications_as_company(self, company_client, company_user):
        """Test listing applications as company."""
        response = company_client.get("/api/applications/")
        assert response.status_code == status.HTTP_200_OK

    def test_update_application_status_as_company(self, company_client, job, candidate_user):
        """Test updating application status as company."""
        from applications.models import Application
        from users.models import CandidateProfile
        
        candidate = CandidateProfile.objects.get(user=candidate_user)
        application = Application.objects.create(
            job=job,
            candidate=candidate,
            status="PENDING",
        )
        
        data = {"status": "REVIEWED", "notes": "Good candidate"}
        response = company_client.patch(f"/api/applications/{application.id}/", data)
        assert response.status_code == status.HTTP_200_OK
