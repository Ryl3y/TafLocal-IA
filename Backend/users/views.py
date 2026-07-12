"""
Vues utilisateur pour TafLocal AI.
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema

from .models import User, CandidateProfile
from .serializers import (
    UserSerializer,
    UserUpdateSerializer,
    CandidateProfileSerializer,
    CandidateProfileUpdateSerializer,
)
from authentication.permissions import IsAdmin


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """Viewset utilisateur pour les administrateurs uniquement."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["role", "is_active"]
    search_fields = ["email", "username", "nom", "prenom"]
    ordering_fields = ["created_at", "email"]
    ordering = ["-created_at"]

    @extend_schema(
        methods=["GET"],
        responses=UserSerializer,
        description="Obtenir l'utilisateur actuel"
    )
    @extend_schema(
        methods=["PATCH"],
        request=UserUpdateSerializer,
        responses=UserSerializer,
        description="Mettre à jour l'utilisateur actuel"
    )
    @action(detail=False, methods=["get", "patch"], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Obtenir ou mettre à jour l'utilisateur actuel."""
        if request.method == "GET":
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        elif request.method == "PATCH":
            serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)


class CandidateProfileViewSet(viewsets.ModelViewSet):
    """Viewset de profil candidat."""

    queryset = CandidateProfile.objects.select_related("user").all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["ville", "genre"]
    search_fields = ["user__nom", "user__prenom", "biographie", "ville", "adresse"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return CandidateProfileUpdateSerializer
        return CandidateProfileSerializer

    @extend_schema(
        methods=["GET"],
        responses=CandidateProfileSerializer,
        description="Obtenir le profil candidat actuel"
    )
    @extend_schema(
        methods=["PATCH"],
        request=CandidateProfileUpdateSerializer,
        responses=CandidateProfileSerializer,
        description="Mettre à jour le profil candidat actuel"
    )
    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        """Obtenir ou mettre à jour le profil candidat actuel."""
        try:
            profile = request.user.candidate_profile
        except CandidateProfile.DoesNotExist:
            profile = CandidateProfile.objects.create(user=request.user)

        if request.method == "GET":
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        elif request.method == "PATCH":
            serializer = CandidateProfileUpdateSerializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

