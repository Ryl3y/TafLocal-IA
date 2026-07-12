"""
Backend d'authentification personnalisé pour TafLocal AI.
"""

from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()


class EmailBackend(BaseBackend):
    """Backend d'authentification par email."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        """Authentifie un utilisateur par email et mot de passe."""
        try:
            # username peut être email ou username
            user = User.objects.get(Q(email=username) | Q(username=username))
        except User.DoesNotExist:
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None

    def user_can_authenticate(self, user):
        """Vérifie si l'utilisateur peut s'authentifier."""
        return user.is_active

    def get_user(self, user_id):
        """Récupère un utilisateur par son ID."""
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
