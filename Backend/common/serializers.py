"""
Sérialiseurs communs pour TafLocal AI.
"""

from rest_framework import serializers
from .models import AuditLog
from users.serializers import UserSerializer


class AuditLogSerializer(serializers.ModelSerializer):
    """Sérialiseur de journal d'audit."""

    user = UserSerializer(read_only=True)
    action_display = serializers.CharField(source="get_action_display", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "user",
            "action",
            "action_display",
            "model_name",
            "object_id",
            "changes",
            "ip_address",
            "user_agent",
            "timestamp",
        ]
        read_only_fields = ["id", "timestamp"]
