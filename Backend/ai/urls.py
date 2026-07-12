"""
URL IA pour TafLocal AI.
"""

from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import AIViewSet

router = SimpleRouter()
router.register(r"", AIViewSet, basename="ai")

urlpatterns = [
    path("", include(router.urls)),
]
