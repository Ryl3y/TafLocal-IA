"""
URL d'entreprise pour TafLocal AI.
"""

from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import CompanyViewSet

router = SimpleRouter()
router.register(r"", CompanyViewSet, basename="company")

urlpatterns = [
    path("", include(router.urls)),
]
