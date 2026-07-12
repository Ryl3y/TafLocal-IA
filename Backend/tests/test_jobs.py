"""
Job tests for TafLocal AI.
"""

import pytest
from rest_framework import status


@pytest.mark.django_db
class TestJobs:
    """Test job endpoints."""

    def test_list_jobs(self, api_client, job):
        """Test listing jobs."""
        response = api_client.get("/api/jobs/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) >= 1

    def test_create_job_as_company(self, company_client, company_user):
        """Test creating a job as company."""
        data = {
            "title": "Python Developer",
            "description": "We need a Python developer.",
            "requirements": "3+ years Python experience.",
            "responsibilities": "Develop Python applications.",
            "location": "Remote",
            "employment_type": "FULL_TIME",
            "experience_level": "MID",
            "salary_min": 70000,
            "salary_max": 90000,
            "skills_required": ["Python", "Django"],
        }
        response = company_client.post("/api/jobs/", data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["title"] == "Python Developer"

    def test_create_job_as_candidate_forbidden(self, authenticated_client):
        """Test that candidates cannot create jobs."""
        data = {
            "title": "Test Job",
            "description": "Test",
            "requirements": "Test",
            "responsibilities": "Test",
            "location": "Test",
        }
        response = authenticated_client.post("/api/jobs/", data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_retrieve_job(self, api_client, job):
        """Test retrieving a single job."""
        response = api_client.get(f"/api/jobs/{job.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == job.id

    def test_filter_jobs_by_type(self, api_client, job):
        """Test filtering jobs by employment type."""
        response = api_client.get("/api/jobs/", {"employment_type": "FULL_TIME"})
        assert response.status_code == status.HTTP_200_OK

    def test_search_jobs(self, api_client, job):
        """Test searching jobs."""
        response = api_client.get("/api/jobs/", {"search": "Django"})
        assert response.status_code == status.HTTP_200_OK
