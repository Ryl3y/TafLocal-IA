"""
Expérience requise exprimée en mois (à partir de 3 mois) puis en années.
"""

import pytest

from ai.engine.matching import CandidateData, JobData, compute_match
from jobs.models import format_months

pytestmark = pytest.mark.django_db

BASE = {"titre": "Assistant", "description": "Missions variées.", "localisation": "Douala", "type_contrat": "CDD"}


@pytest.mark.parametrize("months, label", [
    (None, "non précisée"), (0, "débutant accepté"), (3, "3 mois"), (6, "6 mois"),
    (12, "1 an"), (18, "1 an et 6 mois"), (24, "2 ans"),
])
def test_format_months(months, label):
    assert format_months(months) == label


def test_job_accepts_three_months(company_client):
    response = company_client.post("/api/jobs/", {**BASE, "experience_requise_mois": 3}, format="json")
    assert response.status_code == 201, response.data
    assert response.data["experience_requise_mois"] == 3
    assert response.data["experience_requise_display"] == "3 mois"


def test_experience_bounds(company_client):
    response = company_client.post("/api/jobs/", {**BASE, "experience_requise_mois": 601}, format="json")
    assert response.status_code == 400 and "experience_requise_mois" in response.data


def test_filter_by_months_and_legacy_years(company_client, authenticated_client):
    for months in (3, 24):
        company_client.post("/api/jobs/", {**BASE, "titre": f"Poste {months}", "experience_requise_mois": months,
                                           "statut": "PUBLISHED"}, format="json")

    def titles(query):
        data = authenticated_client.get(f"/api/jobs/?{query}").data
        return {job["titre"] for job in (data["results"] if isinstance(data, dict) else data)}

    assert titles("experience_max_mois=6") == {"Poste 3"}
    assert titles("experience_max=1") == {"Poste 3"}  # ancien paramètre en années
    assert titles("experience_max_mois=24") == {"Poste 3", "Poste 24"}


def test_matching_handles_months():
    job = JobData(title="Assistant", required_experience=0.25)  # 3 mois
    beginner = compute_match(CandidateData(experience_years=0.0), job)
    enough = compute_match(CandidateData(experience_years=0.5), job)
    assert enough["details"]["experience"] == 100
    assert beginner["details"]["experience"] < 100
    assert "3 mois demandé" in beginner["explanation"]
