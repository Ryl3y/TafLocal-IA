"""
Service de notification.
"""

import logging

from .models import Notification, NotificationType

logger = logging.getLogger(__name__)


class NotificationService:
    """Création des notifications envoyées aux utilisateurs."""

    @staticmethod
    def notify(user, notification_type: str, titre: str, message: str) -> Notification | None:
        """Créer une notification ; une erreur ici ne doit jamais bloquer l'action métier."""
        if user is None:
            return None
        try:
            return Notification.objects.create(
                user=user, type=notification_type, titre=titre[:255], message=message
            )
        except Exception:  # pragma: no cover - journalisation uniquement
            logger.exception("Impossible de créer la notification « %s »", titre)
            return None

    @staticmethod
    def notify_application_status(application) -> Notification | None:
        """Informer le candidat du changement de statut de sa candidature."""
        return NotificationService.notify(
            application.candidate.user,
            NotificationType.APPLICATION,
            "Statut de candidature mis à jour",
            f"Votre candidature pour « {application.offre.titre} » chez "
            f"{application.offre.entreprise.nom_entreprise} est maintenant : "
            f"{application.get_statut_display()}.",
        )

    @staticmethod
    def notify_system(users, titre: str, message: str) -> list[Notification]:
        notifications = [
            NotificationService.notify(user, NotificationType.SYSTEM, titre, message) for user in users
        ]
        return [n for n in notifications if n is not None]
