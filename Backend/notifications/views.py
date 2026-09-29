"""
Vues de notification pour TafLocal AI.
"""

from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Notification
from .serializers import NotificationSerializer, NotificationUpdateSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """Notifications de l'utilisateur connecté.

    La création se fait uniquement côté serveur (services métier) : un
    utilisateur ne peut pas créer de notification pour un autre utilisateur.
    """

    queryset = Notification.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["lu", "type"]
    ordering_fields = ["date_envoi"]
    ordering = ["-date_envoi"]
    http_method_names = ["get", "patch", "delete", "post", "head", "options"]

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return NotificationUpdateSerializer
        return NotificationSerializer

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        return Response(
            {"detail": "La création de notifications n'est pas autorisée."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @extend_schema(responses=OpenApiResponse(description="Notification marquée comme lue"))
    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.lu = True
        notification.save(update_fields=["lu"])
        return Response(NotificationSerializer(notification).data)

    @extend_schema(responses=OpenApiResponse(description="Toutes les notifications marquées comme lues"))
    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        """Marquer toutes les notifications comme lues."""
        updated = self.get_queryset().filter(lu=False).update(lu=True)
        return Response(
            {"message": "Toutes les notifications marquées comme lues", "updated": updated},
            status=status.HTTP_200_OK,
        )

    @extend_schema(responses=OpenApiResponse(description="Nombre de notifications non lues"))
    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        """Obtenir le nombre de notifications non lues."""
        count = self.get_queryset().filter(lu=False).count()
        return Response({"unread_count": count}, status=status.HTTP_200_OK)
