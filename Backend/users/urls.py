"""
URL utilisateur pour TafLocal AI.
"""

from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import (
    CandidateProfileViewSet,
    CandidateSkillViewSet,
    EducationViewSet,
    UserViewSet,
    WorkExperienceViewSet,
)

router = SimpleRouter()
router.register(r"candidates", CandidateProfileViewSet, basename="candidate-profile")
router.register(r"skills", CandidateSkillViewSet, basename="candidate-skill")
router.register(r"experiences", WorkExperienceViewSet, basename="work-experience")
router.register(r"formations", EducationViewSet, basename="education")
# Enregistré en dernier : son motif de détail « <pk>/ » capturerait les préfixes ci-dessus.
router.register(r"", UserViewSet, basename="user")

urlpatterns = [
    path("", include(router.urls)),
]
