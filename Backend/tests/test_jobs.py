"""
Tests des offres d'emploi.
"""

import pytest
from rest_framework import status

from jobs.models import Job, JobStatus

from .conftest import auth_client


@pytest.mark.django_db
class TestJobs:
    def test_list_jobs_public(self, api_client, job):
        response = api_client.get("/api/jobs/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1
        assert set(response.data["results"][0]["competences_requises"]) == {"Python", "Django", "PostgreSQL", "Docker"}

    def test_draft_jobs_hidden_from_candidates(self, authenticated_client, job):
        job.statut = JobStatus.DRAFT
        job.save()
        response = authenticated_client.get("/api/jobs/")
        assert response.data["count"] == 0

    def test_create_job_as_company_without_entreprise_field(self, company_client, company_user):
        data = {
            "titre": "Python Developer",
            "description": "We need a Python developer.",
            "localisation": "Douala",
            "type_contrat": "CDI",
            "salaire_min": 70000,
            "salaire_max": 90000,
            "experience_requise_mois": 24,
            "competences_requises": ["python", "Django", "API REST"],
        }
        response = company_client.post("/api/jobs/", data, format="json")
        assert response.status_code == status.HTTP_201_CREATED, response.data
        assert response.data["titre"] == "Python Developer"
        assert response.data["entreprise"] == company_user.company.id
        assert set(response.data["competences_requises"]) == {"Python", "Django", "API REST"}

    def test_skills_inferred_when_not_provided(self, company_client):
        data = {"titre": "Data analyst", "description": "SQL, Power BI et Excel requis.", "type_contrat": "CDI"}
        response = company_client.post("/api/jobs/", data, format="json")
        assert response.status_code == status.HTTP_201_CREATED, response.data
        assert {"SQL", "Power BI", "Microsoft Excel"} <= set(response.data["competences_requises"])

    def test_invalid_salary_range(self, company_client):
        data = {"titre": "X", "description": "Y", "salaire_min": 100, "salaire_max": 50}
        response = company_client.post("/api/jobs/", data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_job_as_candidate_forbidden(self, authenticated_client):
        response = authenticated_client.post("/api/jobs/", {"titre": "Test", "description": "Test"}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_company_cannot_edit_other_company_job(self, job, other_company_user):
        client = auth_client(other_company_user)
        response = client.patch(f"/api/jobs/{job.id}/", {"titre": "Piraté"}, format="json")
        assert response.status_code == status.HTTP_404_NOT_FOUND
        job.refresh_from_db()
        assert job.titre != "Piraté"

    def test_retrieve_job(self, api_client, job):
        response = api_client.get(f"/api/jobs/{job.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == str(job.id)

    def test_filter_jobs_by_type(self, api_client, job, other_job):
        response = api_client.get("/api/jobs/", {"type_contrat": "CDD"})
        assert response.status_code == status.HTTP_200_OK
        assert [j["titre"] for j in response.data["results"]] == ["Comptable"]

    def test_search_jobs(self, api_client, job, other_job):
        response = api_client.get("/api/jobs/", {"search": "Django"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_archive_and_activate(self, company_client, job):
        assert company_client.post(f"/api/jobs/{job.id}/archive/").status_code == 200
        job.refresh_from_db()
        assert job.statut == JobStatus.ARCHIVED
        assert company_client.post(f"/api/jobs/{job.id}/activate/").status_code == 200
        assert Job.objects.get(pk=job.pk).statut == JobStatus.PUBLISHED
