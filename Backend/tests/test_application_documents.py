"""
Pièces de candidature : CV obligatoire, lettre de motivation selon l'exigence de l'offre.
"""

import pytest
from django.core.files.base import ContentFile
from rest_framework import status

from applications.models import Application
from cv_analysis.models import CV
from jobs.models import CoverLetterRequirement

pytestmark = pytest.mark.django_db
APPLY = "/api/applications/"
LONG_LETTER = "Madame, Monsieur, " + "je suis très motivé par ce poste de développeur Django. " * 3


def make_cv(candidate, name="cv.txt"):
    return CV.objects.create(candidate=candidate, file=ContentFile(b"contenu", name=name), file_name=name,
                             file_size=7, file_type="text/plain")


def set_letter(job, requirement):
    job.lettre_motivation = requirement
    job.save(update_fields=["lettre_motivation"])


class TestCVIsRequired:
    def test_cannot_apply_without_cv(self, authenticated_client, job):
        response = authenticated_client.post(APPLY, {"offre": str(job.id)}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "CV est obligatoire" in str(response.data["cv"])

    def test_latest_cv_is_used_by_default(self, authenticated_client, candidate_user, job):
        make_cv(candidate_user.candidate_profile, "ancien.txt")
        latest = make_cv(candidate_user.candidate_profile, "recent.txt")
        response = authenticated_client.post(APPLY, {"offre": str(job.id)}, format="json")
        assert response.status_code == 201
        assert response.data["cv"]["id"] == latest.id
        assert response.data["cv"]["file_name"] == "recent.txt"
        assert "file" not in response.data["cv"]  # jamais de chemin de fichier

    def test_candidate_can_choose_the_cv(self, authenticated_client, candidate_user, job):
        chosen = make_cv(candidate_user.candidate_profile, "choisi.txt")
        make_cv(candidate_user.candidate_profile, "recent.txt")
        response = authenticated_client.post(APPLY, {"offre": str(job.id), "cv": chosen.id}, format="json")
        assert response.status_code == 201 and response.data["cv"]["id"] == chosen.id

    def test_cannot_attach_someone_elses_cv(self, authenticated_client, candidate_user, other_candidate_user, job):
        make_cv(candidate_user.candidate_profile)
        stolen = make_cv(other_candidate_user.candidate_profile, "autre.txt")
        response = authenticated_client.post(APPLY, {"offre": str(job.id), "cv": stolen.id}, format="json")
        assert response.status_code == 400 and "ne vous appartient pas" in str(response.data["cv"])


@pytest.mark.usefixtures("candidate_cv")
class TestCoverLetterRequirement:
    def test_required_letter_must_be_provided(self, authenticated_client, job):
        set_letter(job, CoverLetterRequirement.REQUIRED)
        missing = authenticated_client.post(APPLY, {"offre": str(job.id)}, format="json")
        assert missing.status_code == 400 and "exige une lettre" in str(missing.data["lettre_motivation"])
        too_short = authenticated_client.post(APPLY, {"offre": str(job.id), "lettre_motivation": "Motivé."},
                                              format="json")
        assert too_short.status_code == 400
        ok = authenticated_client.post(APPLY, {"offre": str(job.id), "lettre_motivation": LONG_LETTER}, format="json")
        assert ok.status_code == 201 and ok.data["lettre_motivation"].startswith("Madame")

    def test_optional_letter_can_be_omitted(self, authenticated_client, job):
        set_letter(job, CoverLetterRequirement.OPTIONAL)
        response = authenticated_client.post(APPLY, {"offre": str(job.id)}, format="json")
        assert response.status_code == 201 and response.data["lettre_motivation"] is None

    def test_letter_not_requested_is_not_transmitted(self, authenticated_client, job):
        set_letter(job, CoverLetterRequirement.NOT_REQUESTED)
        response = authenticated_client.post(APPLY, {"offre": str(job.id), "lettre_motivation": LONG_LETTER},
                                             format="json")
        assert response.status_code == 201 and response.data["lettre_motivation"] is None


class TestCompanySide:
    def test_company_sets_letter_requirement_when_creating_job(self, company_client):
        data = {"titre": "Comptable", "description": "Tenue de la comptabilité.", "type_contrat": "CDI",
                "lettre_motivation": "OBLIGATOIRE"}
        response = company_client.post("/api/jobs/", data, format="json")
        assert response.status_code == 201, response.data
        assert response.data["lettre_motivation"] == "OBLIGATOIRE"

    def test_default_is_optional_and_invalid_value_refused(self, company_client):
        base = {"titre": "Comptable", "description": "Tenue de la comptabilité.", "type_contrat": "CDI"}
        assert company_client.post("/api/jobs/", base, format="json").data["lettre_motivation"] == "FACULTATIVE"
        bad = company_client.post("/api/jobs/", {**base, "lettre_motivation": "PEUT-ETRE"}, format="json")
        assert bad.status_code == 400

    def test_company_sees_the_cv_sent(self, authenticated_client, company_client, candidate_user, job):
        cv = make_cv(candidate_user.candidate_profile)
        authenticated_client.post(APPLY, {"offre": str(job.id)}, format="json")
        listing = company_client.get(APPLY).data
        results = listing["results"] if isinstance(listing, dict) else listing
        assert results[0]["cv"]["id"] == cv.id
        assert company_client.get(f"/api/cv-analysis/cvs/{cv.id}/download/").status_code == 200


class TestCVDeletion:
    def test_cv_attached_to_active_application_cannot_be_deleted(self, authenticated_client, candidate_user, job):
        cv = make_cv(candidate_user.candidate_profile)
        application_id = authenticated_client.post(APPLY, {"offre": str(job.id)}, format="json").data["id"]
        blocked = authenticated_client.delete(f"/api/cv-analysis/cvs/{cv.id}/")
        assert blocked.status_code == 400 and "candidature en cours" in str(blocked.data)

        authenticated_client.post(f"{APPLY}{application_id}/withdraw/")
        assert authenticated_client.delete(f"/api/cv-analysis/cvs/{cv.id}/").status_code == 204
        assert Application.objects.get(pk=application_id).cv is None
