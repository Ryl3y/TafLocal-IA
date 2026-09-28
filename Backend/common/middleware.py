"""
Custom middleware for TafLocal AI.
"""

import logging
from django.utils.deprecation import MiddlewareMixin
from common.models import AuditLog
from django.contrib.auth import get_user_model

User = get_user_model()

logger = logging.getLogger(__name__)


def client_ip(request) -> str | None:
    """IP réelle du client, sans faire confiance à un X-Forwarded-For fourni par le client.

    Même règle que la limitation de débit de DRF (REST_FRAMEWORK["NUM_PROXIES"]) : l'en-tête
    n'est lu que si des proxys de confiance sont déclarés, et seulement l'adresse ajoutée
    par le proxy le plus proche de nous (les valeurs plus à gauche sont falsifiables).
    """
    from django.conf import settings

    remote_addr = request.META.get("REMOTE_ADDR")
    num_proxies = settings.REST_FRAMEWORK.get("NUM_PROXIES") or 0
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if num_proxies <= 0 or not forwarded:
        return remote_addr
    addresses = [part.strip() for part in forwarded.split(",") if part.strip()]
    return addresses[-min(num_proxies, len(addresses))] if addresses else remote_addr


class AuditLogMiddleware(MiddlewareMixin):
    """Middleware to log user actions for audit trail."""

    def process_request(self, request):
        """Process incoming request."""
        request.audit_log_data = {
            "ip_address": self.get_client_ip(request),
            "user_agent": request.META.get("HTTP_USER_AGENT", ""),
        }
        return None

    def process_response(self, request, response):
        """Process outgoing response."""
        user = getattr(request, "user", None)
        if user is not None and user.is_authenticated and request.path.startswith("/api/"):
            # Log specific actions
            if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
                self.log_action(request, response)
        return response

    def get_client_ip(self, request):
        return client_ip(request)

    def log_action(self, request, response):
        """Log user action."""
        try:
            action_map = {
                "POST": "CREATE",
                "PUT": "UPDATE",
                "PATCH": "UPDATE",
                "DELETE": "DELETE",
            }
            action = action_map.get(request.method, "VIEW")
            
            # Only log successful requests
            if response.status_code < 400:
                match = getattr(request, "resolver_match", None)
                object_id = (match.kwargs.get("pk") if match else None) or ""
                AuditLog.objects.create(
                    user=request.user,
                    action=action,
                    model_name=self.get_model_name(request),
                    object_id=str(object_id)[:100],
                    ip_address=request.audit_log_data.get("ip_address"),
                    user_agent=(request.audit_log_data.get("user_agent") or "")[:1000],
                )
        except Exception as e:
            logger.error(f"Error logging audit: {e}")

    def get_model_name(self, request):
        """Extract model name from request path."""
        path_parts = request.path.strip("/").split("/")
        if len(path_parts) >= 2:
            return path_parts[1].replace("-", "_")
        return "unknown"
