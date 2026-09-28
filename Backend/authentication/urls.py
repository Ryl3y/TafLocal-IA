"""
URL d'authentification pour TafLocal AI.
"""

from django.urls import path
from .views import (
    CookieTokenRefreshView,
    csrf_token,
    CustomTokenObtainPairView,
    RegisterView,
    LogoutView,
    ChangePasswordView,
    ResetPasswordView,
    PasswordResetRequestView,
    PasswordResetVerifyView,
    PasswordResetConfirmView,
    ProfileView,
    get_user_profile,
)

urlpatterns = [
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("csrf/", csrf_token, name="csrf_token"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("register/", RegisterView.as_view(), name="register"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset_password"),
    path("password-reset/request/", PasswordResetRequestView.as_view(), name="password_reset_request"),
    path("password-reset/verify/", PasswordResetVerifyView.as_view(), name="password_reset_verify"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("me/", get_user_profile, name="get_user_profile"),
]
