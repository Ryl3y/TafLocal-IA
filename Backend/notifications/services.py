"""
Implémentation du service de notification.
"""

import logging
from typing import Dict, Any, List
from django.contrib.auth import get_user_model
from .models import Notification, NotificationType

User = get_user_model()

logger = logging.getLogger(__name__)


class NotificationService:
    """Service pour les opérations de notification."""

    @staticmethod
    def create_notification(
        user_id: int,
        notification_type: NotificationType,
        title: str,
        message: str,
        data: Dict[str, Any] = None,
    ) -> Notification:
        """Créer une notification pour un utilisateur."""
        try:
            user = User.objects.get(id=user_id)
            notification = Notification.objects.create(
                user=user,
                type=notification_type,
                title=title,
                message=message,
                data=data or {},
            )
            logger.info(f"Notification créée pour l'utilisateur {user_id} : {title}")
            return notification
        except User.DoesNotExist:
            logger.error(f"Utilisateur introuvable : {user_id}")
            raise

    @staticmethod
    def create_application_notification(application_id: int, status: str) -> Notification:
        """Créer une notification pour le changement de statut de candidature."""
        from applications.models import Application
        application = Application.objects.get(id=application_id)
        title = f"Statut de candidature mis à jour"
        message = f"Votre candidature pour {application.job.title} est maintenant {status}"
        return NotificationService.create_notification(
            user_id=application.candidate.user.id,
            notification_type=NotificationType.APPLICATION,
            title=title,
            message=message,
            data={"application_id": application_id, "status": status},
        )

    @staticmethod
    def create_interview_notification(interview_id: int, action: str) -> Notification:
        """Créer une notification pour les actions d'entretien."""
        from interviews.models import InterviewSession
        session = InterviewSession.objects.get(id=interview_id)
        title = f"Entretien {action}"
        message = f"Votre entretien pour {session.job.title} a été {action.lower()}"
        return NotificationService.create_notification(
            user_id=session.candidate.user.id,
            notification_type=NotificationType.INTERVIEW,
            title=title,
            message=message,
            data={"interview_id": interview_id, "action": action},
        )

    @staticmethod
    def create_job_notification(job_id: int, action: str) -> List[Notification]:
        """Créer des notifications pour les actions d'emploi."""
        from jobs.models import Job
        from users.models import CandidateProfile
        from cv_analysis.models import CV, CVAnalysis
        
        job = Job.objects.get(id=job_id)
        notifications = []
        
        # Notifier les candidats dont le profil correspond aux exigences de l'emploi
        candidates = CandidateProfile.objects.all()
        
        for candidate in candidates:
            # Vérifier si le candidat a un CV analysé
            try:
                cv = CV.objects.filter(candidate=candidate).first()
                if not cv:
                    continue
                    
                analysis = CVAnalysis.objects.filter(cv=cv).first()
                if not analysis:
                    continue
                
                # Vérifier la correspondance des compétences
                job_skills = set(job.skills_required)
                candidate_skills = set(skill.name for skill in analysis.detected_skills.all())
                
                # Si au moins 30% des compétences correspondent
                if job_skills and candidate_skills:
                    match_ratio = len(job_skills & candidate_skills) / len(job_skills)
                    if match_ratio >= 0.3:
                        title = f"Nouvelle offre correspondante : {job.title}"
                        message = f"Un nouveau poste correspondant à votre profil est disponible chez {job.company.profile.company_name if job.company else 'une entreprise'}"
                        notification = NotificationService.create_notification(
                            user_id=candidate.user.id,
                            notification_type=NotificationType.JOB,
                            title=title,
                            message=message,
                            data={"job_id": job_id, "action": action},
                        )
                        notifications.append(notification)
            except Exception as e:
                logger.error(f"Erreur lors de la notification pour le candidat {candidate.id} : {e}")
                continue
        
        logger.info(f"{len(notifications)} notifications d'emploi créées pour le job {job_id}")
        return notifications

    @staticmethod
    def create_system_notification(user_ids: List[int], title: str, message: str) -> List[Notification]:
        """Créer des notifications système pour plusieurs utilisateurs."""
        notifications = []
        for user_id in user_ids:
            notification = NotificationService.create_notification(
                user_id=user_id,
                notification_type=NotificationType.SYSTEM,
                title=title,
                message=message,
            )
            notifications.append(notification)
        return notifications
