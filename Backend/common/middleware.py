"""
Custom middleware for TafLocal AI.
"""

import logging
from django.utils.deprecation import MiddlewareMixin
from common.models import AuditLog
from django.contrib.auth import get_user_model

User = get_user_model()

logger = logging.getLogger(__name__)


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
        if hasattr(request, "user") and request.user.is_authenticated:
            # Log specific actions
            if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
                self.log_action(request, response)
        return response

    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = request.META.get("REMOTE_ADDR")
        return ip

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
                AuditLog.objects.create(
                    user=request.user,
                    action=action,
                    model_name=self.get_model_name(request),
                    object_id=str(getattr(request, "pk", "")),
                    ip_address=request.audit_log_data.get("ip_address"),
                    user_agent=request.audit_log_data.get("user_agent"),
                )
        except Exception as e:
            logger.error(f"Error logging audit: {e}")

    def get_model_name(self, request):
        """Extract model name from request path."""
        path_parts = request.path.strip("/").split("/")
        if len(path_parts) >= 2:
            return path_parts[1].replace("-", "_")
        return "unknown"
