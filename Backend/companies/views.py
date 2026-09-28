"""
Vues d'entreprise pour TafLocal AI.
"""

from django.db.models import Q
from django.http import Http404
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from authentication.permissions import IsAdmin
from common.storage import private_file_response
from users.models import UserRole

from . import services
from .models import Company, VerificationStatus
from .serializers import (
    CompanyAdminSerializer,
    CompanyRejectSerializer,
    CompanySerializer,
    CompanyUpdateSerializer,
)


class CompanyViewSet(viewsets.ModelViewSet):
    """Entreprises.

    - les utilisateurs ne voient que les entreprises validées (et la leur) ;
    - seule l'entreprise elle-même (ou un administrateur) peut modifier sa fiche ;
    - seul un administrateur valide ou rejette une entreprise, en crée ou en supprime.
    """

    queryset = Company.objects.select_related("user").all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["verified", "statut_verification", "ville", "secteur"]
    search_fields = ["nom_entreprise", "secteur", "ville", "registre_commerce", "user__email"]
    ordering_fields = ["created_at", "verifie_le"]
    ordering = ["-created_at"]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role == UserRole.ADMIN:
            return queryset
        # Une entreprise non vérifiée n'est pas présentée aux autres utilisateurs.
        return queryset.filter(Q(statut_verification=VerificationStatus.APPROVED) | Q(user=user))

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return CompanyUpdateSerializer
        if self.request.user.is_authenticated and self.request.user.role == UserRole.ADMIN:
            return CompanyAdminSerializer
        return CompanySerializer

    # Actions réservées aux administrateurs. get_permissions() a priorité sur les
    # permission_classes déclarées dans @action : toute action admin DOIT figurer ici.
    ADMIN_ACTIONS = {"create", "destroy", "approve", "reject", "verification", "document_rccm"}

    def get_permissions(self):
        if self.action in self.ADMIN_ACTIONS:
            return [IsAdmin()]
        return [IsAuthenticated()]

    def perform_update(self, serializer):
        user = self.request.user
        if user.role != UserRole.ADMIN and serializer.instance.user_id != user.id:
            raise PermissionDenied("Vous ne pouvez modifier que votre propre entreprise.")
        self._save_and_resubmit(serializer)

    @staticmethod
    def _save_and_resubmit(serializer):
        previous_rccm = serializer.instance.registre_commerce
        previous_document = serializer.instance.document_rccm.name if serializer.instance.document_rccm else None
        company = serializer.save()
        changed = company.registre_commerce != previous_rccm or (
            (company.document_rccm.name if company.document_rccm else None) != previous_document
        )
        services.resubmit_if_needed(company, rccm_changed=changed)
        return company

    @staticmethod
    def _pdf_response(company):
        # Affichage dans le navigateur (inline), jamais mis en cache, scripts du PDF bloqués.
        return private_file_response(
            company.document_rccm, company.document_rccm_nom or "certificat-rccm.pdf",
            inline=True, content_type="application/pdf",
        )

    @extend_schema(responses={(200, "application/pdf"): bytes},
                   description="Administrateur : certificat RCCM (PDF) fourni par l'entreprise.")
    @action(detail=True, methods=["get"], url_path="document-rccm", permission_classes=[IsAdmin])
    def document_rccm(self, request, pk=None):
        return self._pdf_response(self.get_object())

    @extend_schema(responses={(200, "application/pdf"): bytes},
                   description="Entreprise : son propre certificat RCCM (PDF).")
    @action(detail=False, methods=["get"], url_path="me/document-rccm")
    def my_document_rccm(self, request):
        if request.user.role != UserRole.COMPANY:
            raise PermissionDenied("Seules les entreprises possèdent un certificat RCCM.")
        company = Company.objects.filter(user=request.user).first()
        if company is None:
            raise Http404
        return self._pdf_response(company)

    @extend_schema(methods=["GET"], responses=CompanySerializer, description="Obtenir le profil entreprise actuel")
    @extend_schema(methods=["PATCH"], request=CompanyUpdateSerializer, responses=CompanySerializer,
                   description="Mettre à jour le profil entreprise actuel (un RCCM corrigé repart en vérification)")
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
        profile = self._save_and_resubmit(serializer)
        return Response(CompanySerializer(profile).data)

    @extend_schema(
        parameters=[OpenApiParameter("statut", str, description="PENDING (défaut), APPROVED, REJECTED ou ALL")],
        responses=CompanyAdminSerializer(many=True),
        description="Administrateur : entreprises à vérifier.",
    )
    @action(detail=False, methods=["get"], url_path="verification", permission_classes=[IsAdmin])
    def verification(self, request):
        statut = request.query_params.get("statut", VerificationStatus.PENDING).upper()
        queryset = Company.objects.select_related("user").prefetch_related("jobs").order_by("created_at")
        if statut != "ALL":
            queryset = queryset.filter(statut_verification=statut)
        counts = {
            value: Company.objects.filter(statut_verification=value).count() for value in VerificationStatus.values
        }
        return Response({"counts": counts, "results": CompanyAdminSerializer(queryset, many=True).data})

    @extend_schema(request=None, responses=CompanyAdminSerializer, description="Administrateur : valider l'entreprise.")
    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        company = services.approve(self.get_object(), request.user)
        return Response(CompanyAdminSerializer(company).data)

    @extend_schema(request=CompanyRejectSerializer, responses=CompanyAdminSerializer,
                   description="Administrateur : rejeter l'entreprise (motif obligatoire, communiqué à l'entreprise).")
    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        serializer = CompanyRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = services.reject(self.get_object(), request.user, serializer.validated_data["motif"])
        return Response(CompanyAdminSerializer(company).data)
