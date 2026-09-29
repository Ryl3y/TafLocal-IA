"""
Vues de l'API IA interne (/api/ai/).
"""

from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from authentication.permissions import IsCandidate
from common.throttling import AIRateThrottle
from jobs.models import Job, JobStatus
from users.models import get_candidate_profile

from .serializers import ExtractSkillsSerializer, JobIdSerializer, JobRecommendationSerializer, MatchSerializer
from .services import (
    CoverLetterService,
    MatchingService,
    SkillService,
    engine_status,
    extract_skills_from_text,
    jobs_with_skills,
)


def _published_job(job_id):
    job = jobs_with_skills(Job.objects.published().filter(pk=job_id)).first()
    if job is None:
        raise NotFound("Offre introuvable ou non publiée.")
    return job


class AIViewSet(viewsets.ViewSet):
    """Services du moteur IA interne (aucun appel à une API externe)."""

    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ["match_job", "job_recommendations", "cover_letter"]:
            return [IsCandidate()]
        if self.action == "health":
            return [permissions.AllowAny()]
        return super().get_permissions()

    def get_throttles(self):
        throttles = super().get_throttles()
        if self.action != "health":
            throttles.append(AIRateThrottle())
        return throttles

    @extend_schema(request=JobIdSerializer, responses=MatchSerializer,
                   description="Compatibilité entre le profil du candidat connecté et une offre.")
    @action(detail=False, methods=["post"])
    def match_job(self, request):
        serializer = JobIdSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = _published_job(serializer.validated_data["job_id"])
        # Le candidat est toujours l'utilisateur connecté : impossible de
        # demander le score d'un autre candidat (correction IDOR).
        result = MatchingService.get_match(get_candidate_profile(request.user), job)
        return Response({"job_id": str(job.id), **MatchSerializer(result).data})

    @extend_schema(
        parameters=[OpenApiParameter("limit", int), OpenApiParameter("min_score", int)],
        responses=JobRecommendationSerializer(many=True),
        description="Recommandations d'offres pour le candidat connecté (paginées).",
    )
    @action(detail=False, methods=["get"])
    def job_recommendations(self, request):
        try:
            limit = min(int(request.query_params.get("limit", 50)), 100)
            min_score = int(request.query_params.get("min_score", 0))
        except ValueError:
            return Response({"detail": "limit et min_score doivent être des entiers."},
                            status=status.HTTP_400_BAD_REQUEST)
        recommendations = MatchingService.recommend_jobs(
            get_candidate_profile(request.user), limit=limit, min_score=min_score
        )
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(recommendations, request, view=self)
        data = JobRecommendationSerializer(page, many=True, context={"request": request}).data
        return paginator.get_paginated_response(data)

    @extend_schema(request=JobIdSerializer, responses=OpenApiResponse(description="Lettre générée"),
                   description="Générer une lettre de motivation adaptée à l'offre.")
    @action(detail=False, methods=["post"])
    def cover_letter(self, request):
        serializer = JobIdSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = _published_job(serializer.validated_data["job_id"])
        letter = CoverLetterService.generate(get_candidate_profile(request.user), job)
        return Response({"job_id": str(job.id), "contenu": letter, "generated_by_ai": True})

    @extend_schema(request=ExtractSkillsSerializer, responses=OpenApiResponse(description="Compétences détectées"),
                   description="Détecter les compétences présentes dans un texte (description d'offre, CV...).")
    @action(detail=False, methods=["post"])
    def extract_skills(self, request):
        serializer = ExtractSkillsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"competences": extract_skills_from_text(serializer.validated_data["text"])})

    @extend_schema(parameters=[OpenApiParameter("search", str)],
                   responses=OpenApiResponse(description="Catalogue de compétences"))
    @action(detail=False, methods=["get"])
    def skills(self, request):
        return Response({"results": SkillService.search(request.query_params.get("search", ""))})

    @extend_schema(responses=OpenApiResponse(description="État du moteur IA"))
    @action(detail=False, methods=["get"])
    def health(self, request):
        """Vérifier l'état de santé du moteur IA."""
        return Response(engine_status())
