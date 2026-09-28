"""
Tests de sécurité : fichiers personnels, force brute, usurpation d'IP, en-têtes HTTP.
"""

from pathlib import Path

import pytest
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import RequestFactory
from rest_framework import status

from applications.models import Application
from common.middleware import client_ip
from common.throttling import AnonBurstRateThrottle
from cv_analysis.models import CV
from tests.conftest import PASSWORD, auth_client
from tests.test_ai_api import SAMPLE_CV, docx_file

pytestmark = pytest.mark.django_db
UPLOAD = "/api/cv-analysis/cvs/"


@pytest.fixture
def cv(authenticated_client):
    response = authenticated_client.post(UPLOAD, {"file": docx_file(SAMPLE_CV, name="CV Jean Mballa.docx")},
                                         format="multipart")
    assert response.status_code == 201, response.data
    return CV.objects.get(pk=response.data["id"])


class TestCVFilesArePrivate:
    def test_api_never_exposes_file_path(self, authenticated_client, cv):
        data = authenticated_client.get(f"{UPLOAD}{cv.id}/").data
        assert "file" not in data
        assert data["file_name"] == "CV Jean Mballa.docx"

    def test_file_is_outside_public_media_with_random_name(self, cv):
        path = Path(cv.file.path)
        assert Path(settings.PRIVATE_MEDIA_ROOT) in path.parents
        assert Path(settings.MEDIA_ROOT) not in path.parents
        assert "Mballa" not in path.name and len(path.stem) == 32

    def test_owner_downloads_with_safe_headers(self, authenticated_client, cv):
        response = authenticated_client.get(f"{UPLOAD}{cv.id}/download/")
        assert response.status_code == 200
        assert response["Cache-Control"] == "private, no-store"
        assert response["X-Content-Type-Options"] == "nosniff"
        assert "sandbox" in response["Content-Security-Policy"]
        assert "attachment" in response["Content-Disposition"]
        assert b"".join(response.streaming_content).startswith(b"PK")

    def test_strangers_cannot_download(self, api_client, other_candidate_user, company_client, cv):
        url = f"{UPLOAD}{cv.id}/download/"
        assert api_client.get(url).status_code == status.HTTP_401_UNAUTHORIZED
        assert auth_client(other_candidate_user).get(url).status_code == status.HTTP_404_NOT_FOUND
        # Une entreprise sans candidature de ce candidat n'y a pas accès.
        assert company_client.get(url).status_code == status.HTTP_404_NOT_FOUND

    def test_company_receiving_an_application_can_download(self, company_client, candidate_user, job, cv):
        Application.objects.create(candidate=candidate_user.candidate_profile, offre=job, cv=cv)
        assert company_client.get(f"{UPLOAD}{cv.id}/download/").status_code == 200

    def test_company_only_sees_the_cv_sent_with_the_application(self, company_client, authenticated_client,
                                                               candidate_user, job, cv):
        Application.objects.create(candidate=candidate_user.candidate_profile, offre=job, cv=cv)
        other = authenticated_client.post(UPLOAD, {"file": docx_file(SAMPLE_CV, name="autre.docx")},
                                          format="multipart").data["id"]
        # Le candidat a un autre CV, non transmis : l'entreprise n'y a pas accès.
        assert company_client.get(f"{UPLOAD}{other}/download/").status_code == 404

    @pytest.mark.parametrize("name,content", [
        ("cv.pdf", b"MZ\x90\x00 executable windows"),          # exécutable renommé
        ("cv.docx", b"%PDF-1.4 un PDF deguise en docx"),       # mauvaise signature
        ("cv.doc", b"PK\x03\x04 une archive"),
        ("cv.txt", b"texte\x00binaire\x00cache"),               # binaire déguisé en texte
    ])
    def test_disguised_files_are_rejected(self, authenticated_client, name, content):
        upload = SimpleUploadedFile(name, content, content_type="application/octet-stream")
        response = authenticated_client.post(UPLOAD, {"file": upload}, format="multipart")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "ne correspond pas" in str(response.data["file"])

    def test_plain_text_cv_is_accepted(self, authenticated_client):
        upload = SimpleUploadedFile("cv.txt", "Développeur Python, 5 ans d'expérience.".encode(),
                                    content_type="text/plain")
        assert authenticated_client.post(UPLOAD, {"file": upload}, format="multipart").status_code == 201


class TestBruteForceProtection:
    def _login(self, client, password):
        return client.post("/api/auth/login/", {"email": "candidate@example.com", "password": password})

    def test_account_is_locked_after_repeated_failures(self, api_client, candidate_user):
        for _ in range(settings.LOGIN_MAX_FAILURES - 1):
            assert self._login(api_client, "mauvais").status_code == 401
        blocked = self._login(api_client, "mauvais")
        assert blocked.status_code == status.HTTP_429_TOO_MANY_REQUESTS
        # Même le bon mot de passe est refusé pendant le verrouillage.
        assert self._login(api_client, PASSWORD).status_code == status.HTTP_429_TOO_MANY_REQUESTS

    def test_unknown_account_behaves_the_same(self, api_client):
        responses = [
            api_client.post("/api/auth/login/", {"email": "inconnu@example.com", "password": "x"}).status_code
            for _ in range(settings.LOGIN_MAX_FAILURES)
        ]
        assert responses[-1] == status.HTTP_429_TOO_MANY_REQUESTS

    def test_success_resets_the_counter(self, api_client, candidate_user):
        for _ in range(settings.LOGIN_MAX_FAILURES - 1):
            self._login(api_client, "mauvais")
        assert self._login(api_client, PASSWORD).status_code == 200
        assert self._login(api_client, "mauvais").status_code == 401  # compteur reparti de zéro

    def test_password_reset_unlocks_the_account(self, api_client, candidate_user):
        import re

        from django.core import mail

        for _ in range(settings.LOGIN_MAX_FAILURES):
            self._login(api_client, "mauvais")
        api_client.post("/api/auth/password-reset/request/", {"email": "candidate@example.com"})
        code = re.search(r"\b(\d{6})\b", mail.outbox[-1].body).group(1)
        token = api_client.post("/api/auth/password-reset/verify/",
                                {"email": "candidate@example.com", "code": code}).data["token"]
        api_client.post("/api/auth/password-reset/confirm/", {"token": token, "new_password": "Nouveau!Pass2026"})
        assert self._login(api_client, "Nouveau!Pass2026").status_code == 200


class TestIPSpoofing:
    def test_forwarded_header_is_ignored_without_trusted_proxy(self, settings):
        settings.REST_FRAMEWORK = {**settings.REST_FRAMEWORK, "NUM_PROXIES": 0}
        request = RequestFactory().post("/api/auth/login/", REMOTE_ADDR="203.0.113.7",
                                        HTTP_X_FORWARDED_FOR="10.0.0.99")
        assert client_ip(request) == "203.0.113.7"
        assert AnonBurstRateThrottle().get_ident(request) == "203.0.113.7"

    def test_only_trusted_proxy_hop_is_used(self, settings):
        settings.REST_FRAMEWORK = {**settings.REST_FRAMEWORK, "NUM_PROXIES": 1}
        # Le client a injecté « 1.1.1.1 » ; notre proxy a ajouté la vraie IP à la fin.
        request = RequestFactory().get("/", REMOTE_ADDR="10.0.0.1", HTTP_X_FORWARDED_FOR="1.1.1.1, 198.51.100.4")
        assert client_ip(request) == "198.51.100.4"


class TestSecurityHeaders:
    def test_api_responses_carry_protective_headers(self, authenticated_client):
        response = authenticated_client.get("/api/notifications/")
        assert response["X-Frame-Options"] == "DENY"
        assert response["X-Content-Type-Options"] == "nosniff"
        assert response["Referrer-Policy"] == "strict-origin-when-cross-origin"
