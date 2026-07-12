"""
Vues d'entreprise pour TafLocal AI.
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema

from .models import Company
from .serializers import CompanySerializer, CompanyUpdateSerializer
from authentication.permissions import IsAdmin


class CompanyViewSet(viewsets.ModelViewSet):
    """Viewset d'entreprise."""

    queryset = Company.objects.select_related("user").all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["verified", "ville", "secteur"]
    search_fields = ["nom_entreprise", "secteur", "ville"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return CompanyUpdateSerializer
        return CompanySerializer

    def get_permissions(self):
        if self.action in ["destroy"]:
            return [IsAdmin]
        return [IsAuthenticated]
    
    @extend_schema(
        methods=["GET"],
        responses=CompanySerializer,
        description="Obtenir le profil entreprise actuel"
    )
    @extend_schema(
        methods=["PATCH"],
        request=CompanyUpdateSerializer,
        responses=CompanySerializer,
        description="Mettre à jour le profil entreprise actuel"
    )
    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        """Obtenir ou mettre à jour le profil entreprise actuel."""
        try:
            profile = request.user.company
        except Company.DoesNotExist:
            return Response({"error": "Profil entreprise introuvable"}, status=404)
        
        if request.method == "GET":
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        elif request.method == "PATCH":
            serializer = CompanyUpdateSerializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
