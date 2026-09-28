"""
Type d'offre choisi par le recruteur : emploi ou stage (durée et rémunération obligatoires).
"""

import pytest

from jobs.models import Job

pytestmark = pytest.mark.django_db

BASE = {"titre": "Assistant comptable", "description": "Tenue des comptes.", "localisation": "Douala"}


def create(client, **data):
    return client.post("/api/jobs/", {**BASE, **data}, format="json")


class TestStage:
    def test_paid_internship(self, company_client):
        response = create(company_client, categorie="STAGE", duree_stage_mois=6, stage_remunere=True,
                          salaire_min=50000, salaire_max=80000)
        assert response.status_code == 201, response.data
        assert response.data["categorie"] == "STAGE"
        assert response.data["categorie_display"] == "Stage"
        assert response.data["duree_stage_mois"] == 6
        assert response.data["stage_remunere"] is True
        assert response.data["type_contrat"] == "INTERNSHIP"  # imposé pour un stage
        assert float(response.data["salaire_min"]) == 50000

    def test_unpaid_internship_drops_salary(self, company_client):
        response = create(company_client, categorie="STAGE", duree_stage_mois=3, stage_remunere=False,
                          salaire_min=50000, type_contrat="CDI")
        assert response.status_code == 201, response.data
        assert response.data["stage_remunere"] is False
        assert response.data["salaire_min"] is None and response.data["salaire_max"] is None
        assert response.data["type_contrat"] == "INTERNSHIP"

    def test_duration_and_pay_are_required(self, company_client):
        response = create(company_client, categorie="STAGE")
        assert response.status_code == 400
        assert "duree_stage_mois" in response.data and "stage_remunere" in response.data

    @pytest.mark.parametrize("months", [0, 25])
    def test_duration_bounds(self, company_client, months):
        response = create(company_client, categorie="STAGE", duree_stage_mois=months, stage_remunere=True)
        assert response.status_code == 400 and "duree_stage_mois" in response.data


class TestEmploi:
    def test_default_is_employment_without_internship_fields(self, company_client):
        response = create(company_client, type_contrat="CDD", duree_stage_mois=6, stage_remunere=True)
        assert response.status_code == 201, response.data
        assert response.data["categorie"] == "EMPLOI"
        assert response.data["duree_stage_mois"] is None and response.data["stage_remunere"] is None

    def test_employment_cannot_use_internship_contract(self, company_client):
        response = create(company_client, categorie="EMPLOI", type_contrat="INTERNSHIP")
        assert response.status_code == 400 and "type_contrat" in response.data


class TestUpdateAndFilter:
    def test_category_cannot_change_after_creation(self, company_client):
        job_id = create(company_client, categorie="STAGE", duree_stage_mois=6, stage_remunere=False).data["id"]
        response = company_client.patch(f"/api/jobs/{job_id}/", {"categorie": "EMPLOI"}, format="json")
        assert response.status_code == 400 and "categorie" in response.data

    def test_internship_partial_update_keeps_rules(self, company_client):
        job_id = create(company_client, categorie="STAGE", duree_stage_mois=6, stage_remunere=False).data["id"]
        response = company_client.patch(f"/api/jobs/{job_id}/", {"duree_stage_mois": 4}, format="json")
        assert response.status_code == 200, response.data
        assert Job.objects.get(pk=job_id).duree_stage_mois == 4

    def test_candidates_can_filter_internships(self, company_client, authenticated_client):
        create(company_client, categorie="STAGE", duree_stage_mois=6, stage_remunere=True, statut="PUBLISHED")
        create(company_client, type_contrat="CDI", statut="PUBLISHED")
        response = authenticated_client.get("/api/jobs/?categorie=STAGE")
        results = response.data["results"] if isinstance(response.data, dict) else response.data
        assert results and all(job["categorie"] == "STAGE" for job in results)
