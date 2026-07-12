"""
URL d'entretien pour TafLocal AI.
"""

from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import InterviewSessionViewSet, InterviewQuestionViewSet

router = SimpleRouter()
router.register(r"sessions", InterviewSessionViewSet, basename="interview-session")
router.register(r"questions", InterviewQuestionViewSet, basename="interview-question")

urlpatterns = [
    path("", include(router.urls)),
]
