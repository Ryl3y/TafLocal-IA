"""
URL d'analyse de CV pour TafLocal AI.
"""

from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import CVViewSet, CVAnalysisViewSet

router = SimpleRouter()
router.register(r"cvs", CVViewSet, basename="cv")
router.register(r"analyses", CVAnalysisViewSet, basename="cv-analysis")

urlpatterns = [
    path("", include(router.urls)),
]
