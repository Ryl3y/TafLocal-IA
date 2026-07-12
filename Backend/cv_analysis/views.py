"""
Vues d'analyse de CV pour TafLocal AI.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import CV, CVAnalysis
from .serializers import (
    CVSerializer,
    CVUploadSerializer,
    CVAnalysisSerializer,
)
from .services import CVAnalysisService
from users.models import UserRole, CandidateProfile


class CVViewSet(viewsets.ModelViewSet):
    """ViewSet de CV."""

    queryset = CV.objects.select_related("candidate__user").all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ["uploaded_at"]
    ordering = ["-uploaded_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return CVUploadSerializer
        return CVSerializer

    def perform_create(self, serializer):
        file = serializer.validated_data["file"]
        try:
            candidate_profile = self.request.user.candidate_profile
        except CandidateProfile.DoesNotExist:
            candidate_profile, created = CandidateProfile.objects.get_or_create(
                user=self.request.user,
                first_name=self.request.user.first_name,
                last_name=self.request.user.last_name
            )
        cv = serializer.save(
            candidate=candidate_profile,
            file_name=file.name,
            file_size=file.size,
            file_type=file.content_type,
        )
        # Déclencher l'analyse de CV
        CVAnalysisService.analyze_cv(cv.id)
        return cv

    def get_queryset(self):
        import logging
        logger = logging.getLogger(__name__)
        logger.info("get_queryset called")
        logger.info(f"request.user: {self.request.user}")
        logger.info(f"request.user.role: {self.request.user.role}")
        queryset = super().get_queryset()
        if self.request.user.role == UserRole.CANDIDATE:
            try:
                candidate_profile = self.request.user.candidate_profile
                logger.info(f"candidate_profile: {candidate_profile}")
            except CandidateProfile.DoesNotExist:
                candidate_profile, created = CandidateProfile.objects.get_or_create(
                    user=self.request.user,
                    first_name=self.request.user.first_name,
                    last_name=self.request.user.last_name
                )
                logger.info(f"created candidate_profile: {created}")
            return queryset.filter(candidate=candidate_profile)
        return queryset

    @extend_schema(
        methods=["POST"],
        responses=OpenApiResponse(description="Analyse de CV démarrée"),
        description="Déclencher l'analyse de CV"
    )
    @action(detail=True, methods=["post"])
    def analyze(self, request, pk=None):
        """Déclencher l'analyse de CV."""
        cv = self.get_object()
        try:
            candidate_profile = request.user.candidate_profile
        except CandidateProfile.DoesNotExist:
            return Response({"error": "Profil candidat introuvable"}, status=status.HTTP_400_BAD_REQUEST)
        if cv.candidate != candidate_profile:
            return Response({"error": "Non autorisé"}, status=status.HTTP_403_FORBIDDEN)
        CVAnalysisService.analyze_cv(cv.id)
        return Response({"message": "Analyse de CV démarrée"}, status=status.HTTP_200_OK)


class CVAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet d'analyse de CV."""

    queryset = CVAnalysis.objects.select_related("cv__candidate").all()
    serializer_class = CVAnalysisSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["cv"]
    ordering_fields = ["analyzed_at"]
    ordering = ["-analyzed_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == UserRole.CANDIDATE:
            try:
                return queryset.filter(cv__candidate=self.request.user.candidate_profile)
            except CandidateProfile.DoesNotExist:
                return CVAnalysis.objects.none()
        return queryset
