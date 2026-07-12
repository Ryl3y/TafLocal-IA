"""
URL utilisateur pour TafLocal AI.
"""

from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import UserViewSet, CandidateProfileViewSet

router = SimpleRouter()
router.register(r"candidates", CandidateProfileViewSet, basename="candidate-profile")
router.register(r"", UserViewSet, basename="user")

urlpatterns = [
    path("", include(router.urls)),
]
