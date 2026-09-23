"""
Sérialiseurs de notification pour TafLocal AI.
"""

from rest_framework import serializers
from .models import Notification, NotificationType


class NotificationSerializer(serializers.ModelSerializer):
    """Sérialiseur de notification."""

    type_display = serializers.CharField(source="get_type_display", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "type",
            "type_display",
            "titre",
            "message",
            "lu",
            "date_envoi",
        ]
        read_only_fields = ["id", "user", "type", "titre", "message", "date_envoi"]


class NotificationUpdateSerializer(serializers.ModelSerializer):
    """Sérialiseur de mise à jour de notification."""

    class Meta:
        model = Notification
        fields = ["lu"]
