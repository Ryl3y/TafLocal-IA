"""
Permissions personnalisées pour TafLocal AI.
"""

from rest_framework import permissions
from users.models import UserRole


class IsAdmin(permissions.BasePermission):
    """Permission pour vérifier si l'utilisateur est administrateur."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == UserRole.ADMIN)


class IsCandidate(permissions.BasePermission):
    """Permission pour vérifier si l'utilisateur est candidat."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == UserRole.CANDIDATE)


class IsCompany(permissions.BasePermission):
    """Permission pour vérifier si l'utilisateur est une entreprise."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == UserRole.COMPANY)


class IsCompanyOrAdmin(permissions.BasePermission):
    """Permission pour vérifier si l'utilisateur est une entreprise ou un administrateur."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == UserRole.COMPANY or request.user.role == UserRole.ADMIN)
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Permission pour vérifier si l'utilisateur est propriétaire ou administrateur."""

    def has_object_permission(self, request, view, obj):
        return bool(request.user.is_authenticated and (request.user.is_admin or obj.user == request.user))


class IsCompanyOwnerOrAdmin(permissions.BasePermission):
    """Permission pour vérifier si l'utilisateur est propriétaire d'entreprise ou administrateur."""

    def has_object_permission(self, request, view, obj):
        return bool(request.user.is_authenticated and (request.user.is_admin or (
            hasattr(obj, "company") and getattr(obj.company, "user", None) == request.user
        )))
