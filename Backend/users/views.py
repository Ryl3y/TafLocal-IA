"""
Vues utilisateur pour TafLocal AI.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from authentication.permissions import IsAdmin, IsCandidate
from .models import CandidateProfile, CandidateSkill, Education, User, UserRole, WorkExperience, get_candidate_profile
from .serializers import (
    CandidateProfileSerializer,
    CandidateProfileUpdateSerializer,
    CandidateSkillSerializer,
    EducationSerializer,
    UserSerializer,
    UserUpdateSerializer,
    WorkExperienceSerializer,
)


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

    @extend_schema(methods=["GET"], responses=UserSerializer, description="Obtenir l'utilisateur actuel")
    @extend_schema(methods=["PATCH"], request=UserUpdateSerializer, responses=UserSerializer,
                   description="Mettre à jour l'utilisateur actuel")
    @action(detail=False, methods=["get", "patch"], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Obtenir ou mettre à jour l'utilisateur actuel."""
        if request.method == "GET":
            return Response(UserSerializer(request.user).data)
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @extend_schema(description="Statistiques globales de la plateforme (administrateur).")
    @action(detail=False, methods=["get"])
    def stats(self, request):
        from applications.models import Application
        from cv_analysis.models import CVAnalysis
        from interviews.models import InterviewSession
        from jobs.models import Job, JobStatus

        return Response({
            "utilisateurs": User.objects.count(),
            "candidats": User.objects.filter(role=UserRole.CANDIDATE).count(),
            "entreprises": User.objects.filter(role=UserRole.COMPANY).count(),
            "offres_publiees": Job.objects.published().count(),
            "candidatures": Application.objects.count(),
            "analyses_cv": CVAnalysis.objects.count(),
            "entretiens": InterviewSession.objects.count(),
        })


class CandidateProfileViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Profils candidats.

    - le candidat lit et modifie son propre profil via ``/me/`` ;
    - une entreprise ne voit que les candidats ayant postulé à ses offres ;
    - l'administrateur voit tout.
    """

    queryset = CandidateProfile.objects.select_related("user").prefetch_related(
        "competences__skill", "experiences", "formations"
    )
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["ville", "genre"]
    search_fields = ["user__nom", "user__prenom", "biographie", "ville"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role == UserRole.ADMIN:
            return queryset
        if user.role == UserRole.COMPANY:
            return queryset.filter(applications__offre__entreprise__user=user).distinct()
        return queryset.filter(user=user)

    @extend_schema(methods=["GET"], responses=CandidateProfileSerializer)
    @extend_schema(methods=["PATCH"], request=CandidateProfileUpdateSerializer, responses=CandidateProfileSerializer)
    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        """Obtenir ou mettre à jour le profil candidat actuel."""
        if request.user.role != UserRole.CANDIDATE:
            raise PermissionDenied("Seuls les candidats possèdent un profil candidat.")
        profile = get_candidate_profile(request.user)
        if request.method == "GET":
            profile = self.get_queryset().get(pk=profile.pk)
            return Response(CandidateProfileSerializer(profile, context={"request": request}).data)
        serializer = CandidateProfileUpdateSerializer(profile, data=request.data, partial=True,
                                                      context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @extend_schema(
        description=(
            "Propositions de complétion du profil extraites du dernier CV analysé. "
            "Lecture seule : rien n'est enregistré, le candidat valide lui-même chaque élément "
            "via les endpoints du profil (me, skills, experiences, formations)."
        )
    )
    @action(detail=False, methods=["get"], url_path="me/cv-suggestions", permission_classes=[IsCandidate])
    def cv_suggestions(self, request):
        from ai.services import ProfileSuggestionService

        profile = get_candidate_profile(request.user)
        return Response(ProfileSuggestionService.for_candidate(profile))


class _CandidateOwnedViewSet(viewsets.ModelViewSet):
    """Base des éléments du profil appartenant au candidat connecté."""

    permission_classes = [IsCandidate]
    model = None

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.model.objects.none()
        return self.model.objects.filter(candidate__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(candidate=get_candidate_profile(self.request.user))


class CandidateSkillViewSet(_CandidateOwnedViewSet):
    model = CandidateSkill
    serializer_class = CandidateSkillSerializer

    def get_queryset(self):
        return super().get_queryset().select_related("skill")


class WorkExperienceViewSet(_CandidateOwnedViewSet):
    model = WorkExperience
    serializer_class = WorkExperienceSerializer


class EducationViewSet(_CandidateOwnedViewSet):
    model = Education
    serializer_class = EducationSerializer
