"""
Récupération du mot de passe par code envoyé par e-mail.
"""

import re
from datetime import timedelta

from django.core import mail
from django.utils import timezone
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from authentication.models import PasswordResetCode

REQUEST = "/api/auth/password-reset/request/"
VERIFY = "/api/auth/password-reset/verify/"
CONFIRM = "/api/auth/password-reset/confirm/"
EMAIL = "candidate@example.com"
NEW_PASSWORD = "NouveauMotDePasse!2026"


def last_email_code() -> str:
    return re.search(r"\b(\d{6})\b", mail.outbox[-1].body).group(1)


def request_code(api_client, email=EMAIL):
    return api_client.post(REQUEST, {"email": email})


def verify(api_client, code, email=EMAIL):
    return api_client.post(VERIFY, {"email": email, "code": code})


def full_reset(api_client, code):
    token = verify(api_client, code).data["token"]
    return api_client.post(CONFIRM, {"token": token, "new_password": NEW_PASSWORD})


class TestPasswordResetFlow:
    def test_full_flow(self, api_client, candidate_user):
        response = request_code(api_client, "Candidate@Example.com")
        assert response.status_code == 200
        assert len(mail.outbox) == 1 and mail.outbox[0].to == [EMAIL]

        assert full_reset(api_client, last_email_code()).status_code == 200
        candidate_user.refresh_from_db()
        assert candidate_user.check_password(NEW_PASSWORD)
        assert api_client.post("/api/auth/login/", {"email": EMAIL, "password": NEW_PASSWORD}).status_code == 200

    def test_code_is_stored_hashed(self, api_client, candidate_user):
        request_code(api_client)
        entry = PasswordResetCode.objects.get(user=candidate_user)
        assert last_email_code() not in entry.code_hash
        assert entry.matches(last_email_code())

    def test_unknown_email_gets_same_answer(self, api_client, candidate_user):
        known = request_code(api_client)
        unknown = request_code(api_client, "personne@example.com")
        assert unknown.status_code == known.status_code == 200
        assert unknown.data == known.data
        assert len(mail.outbox) == 1

    def test_invalid_email_is_rejected(self, api_client):
        assert request_code(api_client, "pas-un-email").status_code == 400

    def test_legacy_endpoint_sends_a_code(self, api_client, candidate_user):
        assert api_client.post("/api/auth/reset-password/", {"email": EMAIL}).status_code == 200
        assert len(mail.outbox) == 1 and last_email_code()

    def test_smtp_failure_does_not_leak(self, api_client, candidate_user, monkeypatch):
        def broken(*args, **kwargs):
            raise OSError("SMTP injoignable")

        monkeypatch.setattr("authentication.password_reset.send_mail", broken)
        assert request_code(api_client).status_code == 200


class TestPasswordResetProtections:
    def test_wrong_code_counts_attempts_then_locks(self, api_client, candidate_user):
        request_code(api_client)
        code = last_email_code()
        wrong = "000000" if code != "000000" else "111111"
        for remaining in (4, 3, 2, 1):
            response = verify(api_client, wrong)
            assert response.status_code == 400 and f"{remaining} essai" in response.data["error"]
        assert "Trop d'essais" in verify(api_client, wrong).data["error"]
        # Même le bon code est refusé une fois le compteur épuisé.
        assert verify(api_client, code).status_code == 400

    def test_expired_code_is_refused(self, api_client, candidate_user):
        request_code(api_client)
        PasswordResetCode.objects.update(expires_at=timezone.now() - timedelta(seconds=1))
        assert verify(api_client, last_email_code()).status_code == 400

    def test_new_request_invalidates_previous_code(self, api_client, candidate_user, settings):
        settings.PASSWORD_RESET_RESEND_SECONDS = 0
        request_code(api_client)
        first = last_email_code()
        request_code(api_client)
        second = last_email_code()
        if first != second:
            assert verify(api_client, first).status_code == 400
        assert verify(api_client, second).status_code == 200

    def test_resend_cooldown(self, api_client, candidate_user):
        request_code(api_client)
        request_code(api_client)
        assert len(mail.outbox) == 1
        assert PasswordResetCode.objects.count() == 1

    def test_token_cannot_be_reused(self, api_client, candidate_user):
        request_code(api_client)
        token = verify(api_client, last_email_code()).data["token"]
        assert api_client.post(CONFIRM, {"token": token, "new_password": NEW_PASSWORD}).status_code == 200
        assert api_client.post(CONFIRM, {"token": token, "new_password": "EncoreUnAutre!2026"}).status_code == 400

    def test_forged_token_is_refused(self, api_client, candidate_user):
        assert api_client.post(CONFIRM, {"token": "faux", "new_password": NEW_PASSWORD}).status_code == 400

    def test_weak_password_is_refused(self, api_client, candidate_user):
        request_code(api_client)
        token = verify(api_client, last_email_code()).data["token"]
        response = api_client.post(CONFIRM, {"token": token, "new_password": "12345678"})
        assert response.status_code == 400 and "new_password" in response.data
        # Le code n'a pas été consommé : l'utilisateur peut réessayer avec un meilleur mot de passe.
        assert api_client.post(CONFIRM, {"token": token, "new_password": NEW_PASSWORD}).status_code == 200

    def test_existing_sessions_are_closed(self, api_client, candidate_user):
        RefreshToken.for_user(candidate_user)
        RefreshToken.for_user(candidate_user)
        request_code(api_client)
        full_reset(api_client, last_email_code())
        outstanding = OutstandingToken.objects.filter(user=candidate_user)
        assert outstanding.count() == 2
        assert BlacklistedToken.objects.filter(token__in=outstanding).count() == 2
