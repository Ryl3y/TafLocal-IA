"""
Jetons JWT en cookies HttpOnly + protection CSRF.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from tests.conftest import PASSWORD, auth_client

pytestmark = pytest.mark.django_db
ORIGIN = "http://testserver"


def browser():
    """Client qui se comporte comme un navigateur : contrôles CSRF actifs."""
    return APIClient(enforce_csrf_checks=True)


def csrf(client) -> str:
    return client.get("/api/auth/csrf/").data["csrfToken"]


def login(client, token=None, **extra):
    headers = {"HTTP_X_CSRFTOKEN": token} if token else {}
    return client.post("/api/auth/login/", {"email": "candidate@example.com", "password": PASSWORD},
                       format="json", **headers, **extra)


class TestCookies:
    def test_login_sets_protected_cookies_and_hides_tokens(self, api_client, candidate_user):
        response = login(api_client)
        assert response.status_code == 200
        assert "access" not in response.data and "refresh" not in response.data
        access, refresh = response.cookies["taflocal_access"], response.cookies["taflocal_refresh"]
        for cookie in (access, refresh):
            assert cookie["httponly"] is True
            assert cookie["samesite"] == "Strict"
        assert access["path"] == "/api/"
        assert refresh["path"] == "/api/auth/"  # jamais envoyé aux autres routes

    def test_cookie_authenticates_requests(self, api_client, candidate_user):
        login(api_client)
        me = api_client.get("/api/auth/me/")
        assert me.status_code == 200 and me.data["email"] == "candidate@example.com"

    def test_bearer_header_still_supported(self, candidate_user):
        assert auth_client(candidate_user).get("/api/auth/me/").status_code == 200

    def test_invalid_cookie_is_anonymous_not_an_error(self, api_client, candidate_user):
        api_client.cookies["taflocal_access"] = "jeton.falsifie.invalide"
        assert api_client.get("/api/auth/me/").status_code == status.HTTP_401_UNAUTHORIZED
        # Une route publique reste utilisable malgré le cookie invalide.
        assert login(api_client).status_code == 200


class TestCSRF:
    def test_modifying_request_without_csrf_is_refused(self, candidate_user):
        client = browser()
        login(client, csrf(client), HTTP_ORIGIN=ORIGIN)
        response = client.patch("/api/users/candidates/me/", {"ville": "Douala"}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "CSRF" in str(response.data)

    def test_modifying_request_with_csrf_is_accepted(self, candidate_user):
        client = browser()
        token = csrf(client)
        login(client, token, HTTP_ORIGIN=ORIGIN)
        response = client.patch("/api/users/candidates/me/", {"ville": "Douala"}, format="json",
                                HTTP_X_CSRFTOKEN=token)
        assert response.status_code == 200

    def test_reading_does_not_need_csrf(self, candidate_user):
        client = browser()
        login(client, csrf(client), HTTP_ORIGIN=ORIGIN)
        assert client.get("/api/auth/me/").status_code == 200

    def test_browser_login_requires_csrf(self, candidate_user):
        client = browser()
        client.get("/api/auth/csrf/")
        assert login(client, HTTP_ORIGIN=ORIGIN).status_code == status.HTTP_403_FORBIDDEN
        assert login(client, csrf(client), HTTP_ORIGIN=ORIGIN).status_code == 200

    def test_foreign_origin_is_refused(self, candidate_user):
        client = browser()
        token = csrf(client)
        response = login(client, token, HTTP_ORIGIN="https://site-malveillant.example")
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestRefreshAndLogout:
    def test_refresh_from_cookie_rotates_tokens(self, api_client, candidate_user):
        first = login(api_client).cookies["taflocal_refresh"].value
        response = api_client.post("/api/auth/token/refresh/", format="json")
        assert response.status_code == 200
        assert "access" not in response.data
        assert response.cookies["taflocal_refresh"].value != first  # rotation
        # L'ancien jeton de rafraîchissement est révoqué.
        replay = APIClient().post("/api/auth/token/refresh/", {"refresh": first}, format="json")
        assert replay.status_code == status.HTTP_401_UNAUTHORIZED

    def test_refresh_without_cookie_fails_cleanly(self, api_client):
        response = api_client.post("/api/auth/token/refresh/", format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout_revokes_and_clears(self, api_client, candidate_user):
        refresh = login(api_client).cookies["taflocal_refresh"].value
        response = api_client.post("/api/auth/logout/", format="json")
        assert response.status_code == 200
        assert response.cookies["taflocal_access"].value == ""
        assert response.cookies["taflocal_refresh"].value == ""
        assert api_client.get("/api/auth/me/").status_code == status.HTTP_401_UNAUTHORIZED
        replay = APIClient().post("/api/auth/token/refresh/", {"refresh": refresh}, format="json")
        assert replay.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout_works_with_expired_access(self, api_client, candidate_user):
        login(api_client)
        api_client.cookies["taflocal_access"] = "expire"
        assert api_client.post("/api/auth/logout/", format="json").status_code == 200
