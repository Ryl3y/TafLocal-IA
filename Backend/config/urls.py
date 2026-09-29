"""
Configuration des URL pour le projet TafLocal AI.
"""

from django.contrib import admin
from django.shortcuts import redirect
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from authentication.permissions import IsAdmin


def redirect_to_docs(request):
    return redirect('swagger-ui')


# La cartographie complète de l'API aide un attaquant : publique en développement seulement.
_docs_access = {} if settings.API_DOCS_PUBLIC else {"permission_classes": [IsAdmin]}

urlpatterns = [
    path("", redirect_to_docs, name="home"),
    path(settings.ADMIN_URL, admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(**_docs_access), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema", **_docs_access), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema", **_docs_access), name="redoc"),
    path("api/auth/", include("authentication.urls")),
    path("api/users/", include("users.urls")),
    path("api/companies/", include("companies.urls")),
    path("api/jobs/", include("jobs.urls")),
    path("api/applications/", include("applications.urls")),
    path("api/cv-analysis/", include("cv_analysis.urls")),
    path("api/interviews/", include("interviews.urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/ai/", include("ai.urls")),
]

# Servir les fichiers médias en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
