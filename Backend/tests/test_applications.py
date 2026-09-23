"""
Tests des candidatures.
"""

import pytest
from rest_framework import status

from applications.models import Application, ApplicationStatus
from notifications.models import Notification
from users.models import CandidateProfile

from .conftest import auth_client


@pytest.mark.django_db
class TestApplications:
    def test_create_application_with_cover_letter(self, authenticated_client, job, company_user):
        data = {"offre": str(job.id), "lettre_motivation": "Je suis très motivé.", "lettre_generee_par_ia": True}
        response = authenticated_client.post("/api/applications/", data, format="json")
        assert response.status_code == status.HTTP_201_CREATED, response.data
        assert response.data["lettre_motivation"] == "Je suis très motivé."
        assert Notification.objects.filter(user=company_user, type="APPLICATION").exists()

    def test_duplicate_application_refused(self, authenticated_client, job):
        authenticated_client.post("/api/applications/", {"offre": str(job.id)}, format="json")
        response = authenticated_client.post("/api/applications/", {"offre": str(job.id)}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_list_applications_as_candidate(self, authenticated_client, job, candidate_user, other_candidate_user):
        Application.objects.create(offre=job, candidate=candidate_user.candidate_profile)
        Application.objects.create(offre=job, candidate=other_candidate_user.candidate_profile)
        response = authenticated_client.get("/api/applications/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_list_applications_as_company(self, company_client, job, candidate_user):
        Application.objects.create(offre=job, candidate=candidate_user.candidate_profile)
        response = company_client.get("/api/applications/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_update_status_as_company_notifies_candidate(self, company_client, job, candidate_user):
        candidate = CandidateProfile.objects.get(user=candidate_user)
        application = Application.objects.create(offre=job, candidate=candidate)
        response = company_client.patch(
            f"/api/applications/{application.id}/", {"statut": "SHORTLISTED", "commentaire": "Bon profil"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK, response.data
        application.refresh_from_db()
        assert application.statut == ApplicationStatus.SHORTLISTED
        assert Notification.objects.filter(user=candidate_user, type="APPLICATION").exists()

    def test_other_company_cannot_update(self, job, candidate_user, other_company_user):
        application = Application.objects.create(offre=job, candidate=candidate_user.candidate_profile)
        response = auth_client(other_company_user).patch(
            f"/api/applications/{application.id}/", {"statut": "HIRED"}, format="json"
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_withdraw(self, authenticated_client, job, candidate_user):
        application = Application.objects.create(offre=job, candidate=candidate_user.candidate_profile)
        response = authenticated_client.post(f"/api/applications/{application.id}/withdraw/")
        assert response.status_code == status.HTTP_200_OK
        application.refresh_from_db()
        assert application.statut == ApplicationStatus.WITHDRAWN

    def test_ranked_applications(self, company_client, job, candidate_user, other_candidate_user):
        from ai.services import SkillService
        from users.models import CandidateSkill

        strong = candidate_user.candidate_profile
        for name in ["Python", "Django", "PostgreSQL", "Docker"]:
            CandidateSkill.objects.create(candidate=strong, skill=SkillService.get_or_create(name))
        Application.objects.create(offre=job, candidate=other_candidate_user.candidate_profile)
        Application.objects.create(offre=job, candidate=strong)

        response = company_client.get(f"/api/jobs/{job.id}/applications/ranked/")
        assert response.status_code == status.HTTP_200_OK, response.data
        results = response.data["results"]
        assert len(results) == 2
        assert results[0]["application"]["candidate"]["id"] == str(strong.id)
        assert results[0]["match"]["score"] > results[1]["match"]["score"]
        assert "avertissement" in response.data

        global_ranking = company_client.get("/api/applications/ranked/", {"offre": str(job.id)})
        assert global_ranking.status_code == status.HTTP_200_OK
        assert len(global_ranking.data["results"]) == 2

    def test_candidate_cannot_see_ranking(self, authenticated_client, job):
        response = authenticated_client.get(f"/api/jobs/{job.id}/applications/ranked/")
        assert response.status_code == status.HTTP_403_FORBIDDEN
