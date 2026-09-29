"""
Vérification des entreprises (RCCM) par un administrateur avant toute activité.
"""

from pathlib import Path

import pytest
from django.conf import settings
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status

from companies.models import Company, VerificationStatus
from jobs.models import JobStatus
from notifications.models import Notification
from tests.conftest import PASSWORD, auth_client

pytestmark = pytest.mark.django_db

JOB = {"titre": "Comptable", "description": "Tenue de la comptabilité.", "type_contrat": "CDI"}


def pdf(name="rccm.pdf", content=b"%PDF-1.4\n% certificat RCCM de test\n"):
    return SimpleUploadedFile(name, content, content_type="application/pdf")


_DEFAULT = object()


def register_company(api_client, email="new@corp.cm", rccm="RC/DLA/2023/B/04567", document=_DEFAULT, **extra):
    data = {
        "email": email, "password": PASSWORD, "password2": PASSWORD, "role": "COMPANY",
        "nom": "Ndi", "prenom": "Paul", "nom_entreprise": "Nouvelle SARL", "registre_commerce": rccm, **extra,
    }
    document = pdf() if document is _DEFAULT else document
    if document is not None:
        data["document_rccm"] = document
    return api_client.post("/api/auth/register/", data, format="multipart")


@pytest.fixture
def pending_company(api_client, admin_user):
    assert register_company(api_client).status_code == status.HTTP_201_CREATED
    return Company.objects.get(user__email="new@corp.cm")


@pytest.fixture
def pending_client(pending_company):
    return auth_client(pending_company.user)


class TestRegistration:
    def test_rccm_is_required(self, api_client):
        response = register_company(api_client, rccm="")
        assert response.status_code == 400 and "registre_commerce" in response.data

    def test_rccm_format_is_checked(self, api_client):
        assert register_company(api_client, rccm="abc").status_code == 400

    def test_rccm_must_be_unique(self, api_client, company_user):
        response = register_company(api_client, rccm="rc/dla/2020/b/10001")  # déjà pris par Tech Corp
        assert response.status_code == 400 and "déjà associé" in str(response.data["registre_commerce"])

    def test_company_name_is_required(self, api_client):
        assert register_company(api_client, nom_entreprise="").status_code == 400

    def test_new_company_is_pending_and_admins_are_notified(self, pending_company, admin_user):
        assert pending_company.statut_verification == VerificationStatus.PENDING
        assert pending_company.verified is False
        assert Notification.objects.filter(user=admin_user, titre__icontains="entreprise à vérifier").exists()

    def test_candidate_registration_ignores_rccm(self, api_client):
        response = api_client.post("/api/auth/register/", {
            "email": "cand@x.cm", "password": PASSWORD, "password2": PASSWORD, "role": "CANDIDATE",
            "nom": "A", "prenom": "B", "registre_commerce": "n'importe quoi",
        }, format="json")
        assert response.status_code == 201


class TestPendingCompanyIsBlocked:
    def test_can_log_in_and_read_own_profile(self, api_client, pending_company):
        login = api_client.post("/api/auth/login/", {"email": "new@corp.cm", "password": PASSWORD})
        assert login.status_code == 200
        client = auth_client(pending_company.user)
        assert client.get("/api/auth/me/").status_code == 200
        me = client.get("/api/companies/me/")
        assert me.status_code == 200 and me.data["statut_verification"] == "PENDING"
        assert client.get("/api/notifications/").status_code == 200

    @pytest.mark.parametrize("method,url", [
        ("post", "/api/jobs/"),
        ("get", "/api/jobs/"),
        ("get", "/api/applications/"),
        ("get", "/api/users/candidates/"),
        ("get", "/api/cv-analysis/cvs/"),
        ("get", "/api/companies/"),
    ])
    def test_everything_else_is_refused(self, pending_client, method, url):
        response = getattr(pending_client, method)(url, JOB, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert response.data["code"] == "company_not_approved"
        assert response.data["statut_verification"] == "PENDING"

    def test_pending_company_is_hidden_from_other_users(self, pending_company, authenticated_client):
        ids = [c["id"] for c in authenticated_client.get("/api/companies/").data["results"]]
        assert str(pending_company.id) not in ids

    def test_jobs_of_unapproved_company_are_hidden_from_candidates(self, company_user, job, authenticated_client):
        company = company_user.company
        company.statut_verification = VerificationStatus.PENDING
        company.save()
        assert authenticated_client.get("/api/jobs/").data["count"] == 0
        assert authenticated_client.get(f"/api/jobs/{job.id}/").status_code == 404
        apply = authenticated_client.post("/api/applications/", {"offre": str(job.id)}, format="json")
        assert apply.status_code == 400


class TestAdminDecision:
    def test_admin_lists_pending_companies(self, admin_client, pending_company, company_user):
        response = admin_client.get("/api/companies/verification/")
        assert response.status_code == 200
        assert [c["id"] for c in response.data["results"]] == [str(pending_company.id)]
        assert response.data["results"][0]["registre_commerce"] == "RC/DLA/2023/B/04567"
        assert response.data["results"][0]["email"] == "new@corp.cm"
        assert response.data["counts"]["PENDING"] == 1

    def test_approval_unlocks_the_company(self, admin_client, admin_user, pending_company, pending_client):
        mail.outbox.clear()
        response = admin_client.post(f"/api/companies/{pending_company.id}/approve/")
        assert response.status_code == 200 and response.data["statut_verification"] == "APPROVED"
        pending_company.refresh_from_db()
        assert pending_company.verified is True and pending_company.verifie_par == admin_user
        assert Notification.objects.filter(user=pending_company.user, titre__icontains="validée").exists()
        assert len(mail.outbox) == 1 and mail.outbox[0].to == ["new@corp.cm"]

        created = pending_client.post("/api/jobs/", {**JOB, "statut": JobStatus.PUBLISHED}, format="json")
        assert created.status_code == 201, created.data

    def test_rejection_requires_reason_and_is_shown_to_company(self, admin_client, pending_company, pending_client):
        assert admin_client.post(f"/api/companies/{pending_company.id}/reject/", {}).status_code == 400
        response = admin_client.post(
            f"/api/companies/{pending_company.id}/reject/", {"motif": "RCCM introuvable au registre."}
        )
        assert response.status_code == 200
        blocked = pending_client.get("/api/jobs/")
        assert blocked.status_code == 403 and blocked.data["statut_verification"] == "REJECTED"
        assert blocked.data["motif_rejet"] == "RCCM introuvable au registre."
        assert Notification.objects.filter(user=pending_company.user, titre__icontains="refusée").exists()

    def test_correction_after_rejection_resubmits(self, admin_client, pending_company, pending_client):
        admin_client.post(f"/api/companies/{pending_company.id}/reject/", {"motif": "Numéro erroné."})
        response = pending_client.patch("/api/companies/me/", {"registre_commerce": "RC/DLA/2023/B/09999"},
                                        format="json")
        assert response.status_code == 200
        assert response.data["statut_verification"] == "PENDING" and response.data["motif_rejet"] == ""

    def test_changing_rccm_of_approved_company_requires_new_check(self, company_client, company_user):
        response = company_client.patch("/api/companies/me/", {"registre_commerce": "RC/DLA/2024/B/55555"},
                                        format="json")
        assert response.data["statut_verification"] == "PENDING"
        # Modifier une autre information ne remet pas le compte en attente.
        company_user.company.statut_verification = VerificationStatus.APPROVED
        company_user.company.save()
        response = company_client.patch("/api/companies/me/", {"ville": "Douala"}, format="json")
        assert response.data["statut_verification"] == "APPROVED"

    def test_company_cannot_approve_itself(self, company_client, pending_company, pending_client):
        assert company_client.post(f"/api/companies/{pending_company.id}/approve/").status_code == 403
        # L'entreprise bloquée ne peut même pas atteindre la route.
        assert pending_client.post(f"/api/companies/{pending_company.id}/approve/").status_code == 403
        pending_company.refresh_from_db()
        assert pending_company.statut_verification == VerificationStatus.PENDING

    def test_status_cannot_be_forged_through_profile_update(self, pending_client, pending_company):
        pending_client.patch("/api/companies/me/", {"statut_verification": "APPROVED", "verified": True},
                             format="json")
        pending_company.refresh_from_db()
        assert pending_company.statut_verification == VerificationStatus.PENDING

    @pytest.mark.parametrize("url", ["/api/companies/verification/", "/api/companies/verification/?statut=ALL"])
    def test_review_list_is_admin_only(self, url, authenticated_client, company_client, pending_company):
        """Non-régression : la liste (RCCM, e-mails, contacts) n'est visible que des administrateurs."""
        assert authenticated_client.get(url).status_code == 403
        assert company_client.get(url).status_code == 403


class TestRccmCertificate:
    def test_certificate_is_required(self, api_client):
        response = register_company(api_client, document=None)
        assert response.status_code == 400 and "document_rccm" in response.data

    @pytest.mark.parametrize("document,message", [
        (SimpleUploadedFile("rccm.docx", b"%PDF-1.4", content_type="application/pdf"), "PDF"),
        (SimpleUploadedFile("rccm.pdf", b"MZ\x90 exe", content_type="application/pdf"), "PDF valide"),
    ])
    def test_only_real_pdf_is_accepted(self, api_client, document, message):
        response = register_company(api_client, document=document)
        assert response.status_code == 400 and message in str(response.data["document_rccm"])

    def test_size_limit(self, api_client, settings):
        settings.RCCM_MAX_UPLOAD_SIZE = 100
        response = register_company(api_client, document=pdf(content=b"%PDF-" + b"x" * 200))
        assert response.status_code == 400 and "Mo" in str(response.data["document_rccm"])

    def test_file_is_stored_privately(self, pending_company):
        stored = Path(pending_company.document_rccm.path)
        assert stored.is_file()
        assert Path(settings.PRIVATE_MEDIA_ROOT) in stored.parents
        assert Path(settings.MEDIA_ROOT) not in stored.parents  # jamais servi par /media/
        assert "rccm" not in stored.stem  # nom aléatoire sur le disque
        assert pending_company.document_rccm_nom == "rccm.pdf"

    def test_profile_exposes_presence_not_path(self, pending_client):
        data = pending_client.get("/api/companies/me/").data
        assert data["document_rccm_disponible"] is True
        assert "document_rccm" not in data

    def test_admin_and_owner_can_read_the_pdf(self, admin_client, pending_client, pending_company):
        for client, url in [
            (admin_client, f"/api/companies/{pending_company.id}/document-rccm/"),
            (pending_client, "/api/companies/me/document-rccm/"),
        ]:
            response = client.get(url)
            assert response.status_code == 200
            assert response["Content-Type"] == "application/pdf"
            assert response["Cache-Control"] == "private, no-store"
            assert b"".join(response.streaming_content).startswith(b"%PDF-")

    def test_others_cannot_read_the_pdf(self, authenticated_client, company_client, pending_company):
        from rest_framework.test import APIClient

        url = f"/api/companies/{pending_company.id}/document-rccm/"
        assert authenticated_client.get(url).status_code == 403
        assert company_client.get(url).status_code == 403
        # Client neuf : celui qui a servi à l'inscription est désormais connecté (cookies de session).
        assert APIClient().get(url).status_code == 401

    def test_new_certificate_replaces_old_one_and_resubmits(self, admin_client, pending_company, pending_client):
        old_path = Path(pending_company.document_rccm.path)
        admin_client.post(f"/api/companies/{pending_company.id}/reject/", {"motif": "Certificat illisible."})
        response = pending_client.patch("/api/companies/me/", {"document_rccm": pdf("nouveau.pdf")},
                                        format="multipart")
        assert response.status_code == 200
        assert response.data["statut_verification"] == "PENDING"
        assert response.data["document_rccm_nom"] == "nouveau.pdf"
        assert not old_path.exists()
