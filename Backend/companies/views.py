"""
Vues d'entreprise pour TafLocal AI.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from authentication.permissions import IsAdmin
from users.models import UserRole

from .models import Company
from .serializers import CompanySerializer, CompanyUpdateSerializer


class CompanyViewSet(viewsets.ModelViewSet):
    """Entreprises.

    Tout utilisateur connecté peut consulter les fiches entreprises ; seule
    l'entreprise elle-même (ou un administrateur) peut modifier sa fiche, et
    seul un administrateur peut en créer ou en supprimer.
    """

    queryset = Company.objects.select_related("user").all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["verified", "ville", "secteur"]
    search_fields = ["nom_entreprise", "secteur", "ville"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return CompanyUpdateSerializer
        return CompanySerializer

    def get_permissions(self):
        if self.action in ["create", "destroy"]:
            return [IsAdmin()]
        return [IsAuthenticated()]

    def perform_update(self, serializer):
        user = self.request.user
        if user.role != UserRole.ADMIN and serializer.instance.user_id != user.id:
            raise PermissionDenied("Vous ne pouvez modifier que votre propre entreprise.")
        serializer.save()

    @extend_schema(methods=["GET"], responses=CompanySerializer, description="Obtenir le profil entreprise actuel")
    @extend_schema(methods=["PATCH"], request=CompanyUpdateSerializer, responses=CompanySerializer,
                   description="Mettre à jour le profil entreprise actuel")
    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        """Obtenir ou mettre à jour le profil entreprise actuel."""
        if request.user.role != UserRole.COMPANY:
            raise PermissionDenied("Seules les entreprises possèdent un profil entreprise.")
        profile, _ = Company.objects.get_or_create(
            user=request.user,
            defaults={"nom_entreprise": f"{request.user.prenom} {request.user.nom}".strip() or request.user.email},
        )
        if request.method == "GET":
            return Response(CompanySerializer(profile).data)
        serializer = CompanyUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(CompanySerializer(profile).data)
