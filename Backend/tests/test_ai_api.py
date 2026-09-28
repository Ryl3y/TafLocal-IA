"""
Tests d'intégration des fonctionnalités IA via l'API.
"""

import io

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status

from ai.models import MatchResult
from cv_analysis.models import CV
from interviews.models import InterviewStatus
from notifications.models import Notification

from .conftest import auth_client
from .test_ai_engine import SAMPLE_CV


def docx_file(text: str, name="cv.docx"):
    from docx import Document

    document = Document()
    for line in text.splitlines():
        document.add_paragraph(line)
    buffer = io.BytesIO()
    document.save(buffer)
    return SimpleUploadedFile(
        name, buffer.getvalue(),
        content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )


@pytest.mark.django_db
class TestCVAnalysis:
    def test_upload_docx_is_analyzed(self, authenticated_client, candidate_user, job):
        response = authenticated_client.post("/api/cv-analysis/cvs/", {"file": docx_file(SAMPLE_CV)},
                                             format="multipart")
        assert response.status_code == status.HTTP_201_CREATED, response.data
        assert response.data["is_processed"] is True
        assert response.data["analysis_status"] == "COMPLETED"

        analysis = authenticated_client.get(f"/api/cv-analysis/analyses/{response.data['analysis_id']}/").data
        assert analysis["employability_score"] > 50
        names = {s["name"] for s in analysis["detected_skills"]}
        assert {"Python", "Django", "Docker"} <= names
        assert analysis["recommendations"] is not None
        assert Notification.objects.filter(user=candidate_user, type="PROFILE").exists()

        latest = authenticated_client.get("/api/cv-analysis/cvs/latest/")
        assert latest.status_code == 200 and latest.data["id"] == analysis["id"]

    def test_no_published_offer_means_no_analysis(self, authenticated_client):
        response = authenticated_client.post("/api/cv-analysis/cvs/", {"file": docx_file(SAMPLE_CV)},
                                             format="multipart")
        assert response.status_code == status.HTTP_201_CREATED, response.data
        assert response.data["analysis_status"] == "NO_OFFERS"
        assert response.data["is_processed"] is False
        analysis = authenticated_client.get(f"/api/cv-analysis/analyses/{response.data['analysis_id']}/").data
        assert analysis["detected_skills"] == [] and analysis["employability_score"] == 0

        retry = authenticated_client.post(f"/api/cv-analysis/cvs/{response.data['id']}/analyze/")
        assert retry.status_code == status.HTTP_409_CONFLICT
        assert "offre" in retry.data["detail"]

    def test_analysis_runs_once_an_offer_is_published(self, authenticated_client, job):
        from jobs.models import JobStatus

        job.statut = JobStatus.DRAFT
        job.save()
        cv_id = authenticated_client.post("/api/cv-analysis/cvs/", {"file": docx_file(SAMPLE_CV)},
                                          format="multipart").data["id"]
        job.statut = JobStatus.PUBLISHED
        job.save()
        response = authenticated_client.post(f"/api/cv-analysis/cvs/{cv_id}/analyze/")
        assert response.status_code == status.HTTP_200_OK, response.data
        assert response.data["status"] == "COMPLETED"
        assert response.data["score_details"]["offres"][0]["id"] == str(job.id)

    def test_upload_rejects_bad_extension(self, authenticated_client):
        bad = SimpleUploadedFile("cv.exe", b"MZ....", content_type="application/octet-stream")
        response = authenticated_client.post("/api/cv-analysis/cvs/", {"file": bad}, format="multipart")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_unreadable_cv_is_reported(self, authenticated_client):
        # Vrai en-tête PDF mais contenu corrompu : accepté à l'envoi, l'analyse signale l'échec.
        broken_pdf = SimpleUploadedFile("cv.pdf", b"%PDF-1.4\ncontenu corrompu", content_type="application/pdf")
        response = authenticated_client.post("/api/cv-analysis/cvs/", {"file": broken_pdf}, format="multipart")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["analysis_status"] == "FAILED"

    def test_candidate_cannot_see_other_cv(self, authenticated_client, other_candidate_user):
        other = auth_client(other_candidate_user)
        cv_id = other.post("/api/cv-analysis/cvs/", {"file": docx_file(SAMPLE_CV)}, format="multipart").data["id"]
        assert authenticated_client.get(f"/api/cv-analysis/cvs/{cv_id}/").status_code == 404
        assert authenticated_client.get("/api/cv-analysis/analyses/").data["count"] == 0

    def test_company_sees_only_applicants_cvs(self, company_client, authenticated_client, job):
        authenticated_client.post("/api/cv-analysis/cvs/", {"file": docx_file(SAMPLE_CV)}, format="multipart")
        assert company_client.get("/api/cv-analysis/cvs/").data["count"] == 0
        authenticated_client.post("/api/applications/", {"offre": str(job.id)}, format="json")
        assert company_client.get("/api/cv-analysis/cvs/").data["count"] == 1

    def test_delete_cv(self, authenticated_client):
        cv_id = authenticated_client.post("/api/cv-analysis/cvs/", {"file": docx_file(SAMPLE_CV)},
                                          format="multipart").data["id"]
        assert authenticated_client.delete(f"/api/cv-analysis/cvs/{cv_id}/").status_code == 204
        assert not CV.objects.filter(pk=cv_id).exists()


@pytest.mark.django_db
class TestRecommendations:
    def test_match_for_me_uses_cv(self, authenticated_client, job, other_job):
        authenticated_client.post("/api/cv-analysis/cvs/", {"file": docx_file(SAMPLE_CV)}, format="multipart")
        response = authenticated_client.get("/api/jobs/match_for_me/")
        assert response.status_code == status.HTTP_200_OK, response.data
        results = response.data["results"]
        assert [r["job"]["titre"] for r in results] == ["Senior Django Developer", "Comptable"]
        assert results[0]["match"]["score"] > results[1]["match"]["score"]
        assert "Django" in results[0]["match"]["matched_skills"]

    def test_cache_invalidated_when_profile_changes(self, authenticated_client, candidate_user, job):
        authenticated_client.get("/api/jobs/match_for_me/")
        assert MatchResult.objects.filter(candidate=candidate_user.candidate_profile).exists()
        authenticated_client.post("/api/users/skills/", {"nom": "Django", "niveau": "EXPERT"}, format="json")
        assert not MatchResult.objects.filter(candidate=candidate_user.candidate_profile).exists()
        second = authenticated_client.get(f"/api/jobs/{job.id}/match/").data
        assert "Django" in second["matched_skills"]

    def test_ai_endpoints(self, authenticated_client, job):
        match = authenticated_client.post("/api/ai/match_job/", {"job_id": str(job.id)}, format="json")
        assert match.status_code == 200 and 0 <= match.data["score"] <= 100
        recos = authenticated_client.get("/api/ai/job_recommendations/")
        assert recos.status_code == 200 and recos.data["count"] == 1
        letter = authenticated_client.post("/api/ai/cover_letter/", {"job_id": str(job.id)}, format="json")
        assert letter.status_code == 200 and job.titre in letter.data["contenu"]
        skills = authenticated_client.post("/api/ai/extract_skills/", {"text": "Python et Docker"}, format="json")
        assert {s["nom"] for s in skills.data["competences"]} == {"Python", "Docker"}
        assert authenticated_client.get("/api/ai/skills/", {"search": "pyth"}).data["results"][0]["nom"] == "Python"

    def test_health_is_public(self, api_client):
        response = api_client.get("/api/ai/health/")
        assert response.status_code == 200 and response.data["external_api"] is False

    def test_company_cannot_use_candidate_matching(self, company_client, job):
        assert company_client.post("/api/ai/match_job/", {"job_id": str(job.id)}, format="json").status_code == 403


@pytest.fixture
def applied_job(candidate_user, job, candidate_cv):
    """La simulation d'entretien exige une candidature à l'offre."""
    from applications.models import Application

    Application.objects.create(candidate=candidate_user.candidate_profile, offre=job, cv=candidate_cv)
    return job


def start_session(client, job, **extra):
    return client.post("/api/interviews/sessions/", {"offre": str(job.id), **extra}, format="json")


@pytest.mark.django_db
class TestInterview:
    def test_interview_requires_an_application(self, authenticated_client, job):
        no_offer = authenticated_client.post("/api/interviews/sessions/", {}, format="json")
        assert no_offer.status_code == 400 and "offre" in no_offer.data
        not_applied = start_session(authenticated_client, job)
        assert not_applied.status_code == 400 and "postulé" in str(not_applied.data["offre"])

    def test_withdrawn_application_no_longer_allows_interview(self, authenticated_client, applied_job):
        from applications.models import Application, ApplicationStatus

        Application.objects.filter(offre=applied_job).update(statut=ApplicationStatus.WITHDRAWN)
        assert start_session(authenticated_client, applied_job).status_code == 400

    def test_full_interview_flow(self, authenticated_client, candidate_user, applied_job):
        job = applied_job
        created = authenticated_client.post(
            "/api/interviews/sessions/", {"offre": str(job.id), "type_entretien": "MIXED", "nombre_questions": 5},
            format="json",
        )
        assert created.status_code == status.HTTP_201_CREATED, created.data
        session_id = created.data["id"]
        questions = created.data["questions"]
        assert len(questions) == 5
        assert created.data["candidate"] == candidate_user.candidate_profile.id

        answer = authenticated_client.post(
            f"/api/interviews/sessions/{session_id}/answer/",
            {"question_id": questions[0]["id"],
             "reponse": "Je suis développeur Python depuis 4 ans. Mon parcours, mes compétences Django et ma "
                        "motivation pour ce poste sont forts : par exemple j'ai livré 3 projets."},
            format="json",
        )
        assert answer.status_code == 200, answer.data
        assert answer.data["score"] is not None and answer.data["evaluation"]["commentaire"]

        feedback = authenticated_client.post(f"/api/interviews/sessions/{session_id}/complete/")
        assert feedback.status_code == 200, feedback.data
        assert feedback.data["points_faibles"]

        detail = authenticated_client.get(f"/api/interviews/sessions/{session_id}/").data
        assert detail["statut"] == InterviewStatus.COMPLETED
        assert detail["feedback"]["score_global"] is not None

        late = authenticated_client.post(
            f"/api/interviews/sessions/{session_id}/answer/",
            {"question_id": questions[1]["id"], "reponse": "Trop tard"}, format="json",
        )
        assert late.status_code == status.HTTP_409_CONFLICT

    def test_complete_without_answers_is_refused(self, authenticated_client, applied_job):
        session = start_session(authenticated_client, applied_job).data
        response = authenticated_client.post(f"/api/interviews/sessions/{session['id']}/complete/")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_candidate_cannot_tamper_question_score(self, authenticated_client, applied_job):
        session = start_session(authenticated_client, applied_job).data
        question_id = session["questions"][0]["id"]
        response = authenticated_client.patch(
            f"/api/interviews/questions/{question_id}/",
            {"reponse": "Ma réponse détaillée au sujet de mon parcours.", "score": 100, "question": "Facile"},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["question"] != "Facile"
        assert float(response.data["score"]) < 100

    def test_other_candidate_cannot_access_session(self, authenticated_client, applied_job, other_candidate_user):
        session = start_session(authenticated_client, applied_job).data
        other = auth_client(other_candidate_user)
        assert other.get(f"/api/interviews/sessions/{session['id']}/").status_code == 404


@pytest.mark.django_db
class TestPermissions:
    def test_notifications_cannot_be_created_by_users(self, authenticated_client, other_candidate_user):
        response = authenticated_client.post(
            "/api/notifications/", {"user": str(other_candidate_user.id), "titre": "x", "message": "y"}, format="json"
        )
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_company_cannot_edit_other_company(self, company_client, other_company_user):
        company_id = other_company_user.company.id
        response = company_client.patch(f"/api/companies/{company_id}/", {"nom_entreprise": "X"}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_candidate_profiles_are_private(self, authenticated_client, other_candidate_user):
        response = authenticated_client.get("/api/users/candidates/")
        assert response.data["count"] == 1

    def test_candidate_profile_sections(self, authenticated_client):
        assert authenticated_client.post("/api/users/experiences/", {
            "poste": "Dev", "entreprise": "Acme", "date_debut": "2020-01-01", "en_cours": True,
        }, format="json").status_code == 201
        assert authenticated_client.post("/api/users/formations/", {
            "diplome": "Licence informatique", "etablissement": "UY1",
        }, format="json").status_code == 201
        profile = authenticated_client.get("/api/users/candidates/me/").data
        assert profile["experience_annees"] > 5
        assert profile["formations"][0]["diplome"] == "Licence informatique"

    def test_admin_stats(self, admin_client, job):
        response = admin_client.get("/api/users/stats/")
        assert response.status_code == 200 and response.data["offres_publiees"] == 1
