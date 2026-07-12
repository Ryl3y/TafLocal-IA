"""
Vues IA pour TafLocal AI.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import serializers
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .services import (
    AIService,
    CVAnalyzerService,
    MatchingService,
    InterviewService,
)


class JobMatchSerializer(serializers.Serializer):
    """Sérialiseur de demande de correspondance d'emploi."""
    cv_id = serializers.IntegerField()
    job_id = serializers.IntegerField()


class JobRecommendationSerializer(serializers.Serializer):
    """Sérialiseur de demande de recommandations d'emploi."""
    candidate_id = serializers.IntegerField(required=False)
    limit = serializers.IntegerField(required=False, default=10)


class AIViewSet(viewsets.ViewSet):
    """Viewset de services IA."""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        methods=["POST"],
        request=JobMatchSerializer,
        responses=OpenApiResponse(description="Score de compatibilité"),
        description="Correspondre le CV à l'emploi et obtenir le score de compatibilité"
    )
    @action(detail=False, methods=["post"])
    def match_job(self, request):
        """Correspondre le CV à l'emploi et obtenir le score de compatibilité."""
        serializer = JobMatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        result = MatchingService.match_cv_to_job(
            serializer.validated_data["cv_id"],
            serializer.validated_data["job_id"],
        )
        return Response(result, status=status.HTTP_200_OK)

    @extend_schema(
        methods=["GET"],
        responses=OpenApiResponse(description="Recommandations d'emploi"),
        description="Obtenir des recommandations d'emploi pour un candidat"
    )
    @action(detail=False, methods=["get"])
    def job_recommendations(self, request):
        """Obtenir des recommandations d'emploi pour un candidat."""
        serializer = JobRecommendationSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        
        candidate_id = serializer.validated_data.get("candidate_id")
        limit = serializer.validated_data.get("limit", 10)
        
        result = MatchingService.get_job_recommendations(candidate_id, limit)
        return Response(result, status=status.HTTP_200_OK)

    @extend_schema(
        methods=["GET"],
        responses=OpenApiResponse(description="État de santé du service IA"),
        description="Vérifier l'état de santé du service IA"
    )
    @action(detail=False, methods=["get"])
    def health(self, request):
        """Vérifier l'état de santé du service IA."""
        return Response({"status": "healthy", "message": "Services IA opérationnels"})
