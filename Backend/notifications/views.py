"""
Vues de notification pour TafLocal AI.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import Notification
from .serializers import NotificationSerializer, NotificationUpdateSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """Viewset de notification."""

    queryset = Notification.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["lu", "type"]
    ordering_fields = ["date_envoi"]
    ordering = ["-date_envoi"]

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return NotificationUpdateSerializer
        return NotificationSerializer

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    @extend_schema(
        methods=["POST"],
        responses=OpenApiResponse(description="Toutes les notifications marquées comme lues"),
        description="Marquer toutes les notifications comme lues"
    )
    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        """Marquer toutes les notifications comme lues."""
        self.get_queryset().update(lu=True)
        return Response({"message": "Toutes les notifications marquées comme lues"}, status=status.HTTP_200_OK)

    @extend_schema(
        methods=["GET"],
        responses=OpenApiResponse(description="Nombre de notifications non lues"),
        description="Obtenir le nombre de notifications non lues"
    )
    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        """Obtenir le nombre de notifications non lues."""
        count = self.get_queryset().filter(lu=False).count()
        return Response({"unread_count": count}, status=status.HTTP_200_OK)
