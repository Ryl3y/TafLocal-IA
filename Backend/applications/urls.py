"""
URL de candidature pour TafLocal AI.
"""

from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import ApplicationViewSet

router = SimpleRouter()
router.register(r"", ApplicationViewSet, basename="application")

urlpatterns = [
    path("", include(router.urls)),
]
