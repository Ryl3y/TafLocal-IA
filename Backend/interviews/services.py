"""
Implémentation du service d'entretien.
"""

import logging
from typing import Dict, Any
from .models import InterviewSession, InterviewQuestion, InterviewFeedback
from ai.services import InterviewService, FeedbackService

logger = logging.getLogger(__name__)


class InterviewService:
    """Service pour les opérations d'entretien."""

    @staticmethod
    def generate_questions(interview_session_id: int) -> Dict[str, Any]:
        """Générer des questions d'entretien pour une session."""
        try:
            session = InterviewSession.objects.get(id=interview_session_id)
            
            # Générer des questions en utilisant le service IA
            questions_data = InterviewService.generate_questions(interview_session_id)
            
            # Créer les objets de questions
            for q_data in questions_data:
                InterviewQuestion.objects.create(
                    session=session,
                    question_text=q_data["question_text"],
                    question_type=q_data["question_type"],
                    category=q_data.get("category"),
                    order=q_data["order"],
                )
            
            logger.info(f"Généré {len(questions_data)} questions pour la session {interview_session_id}")
            return {"success": True, "questions_count": len(questions_data)}
            
        except InterviewSession.DoesNotExist:
            logger.error(f"Session d'entretien introuvable : {interview_session_id}")
            return {"success": False, "error": "Session d'entretien introuvable"}
        except Exception as e:
            logger.error(f"Erreur lors de la génération des questions : {e}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def generate_feedback(interview_session_id: int) -> Dict[str, Any]:
        """Générer un feedback pour une session d'entretien."""
        try:
            session = InterviewSession.objects.get(id=interview_session_id)
            
            # Générer un feedback en utilisant le service IA
            feedback_data = FeedbackService.generate_feedback(interview_session_id)
            
            # Créer ou mettre à jour le feedback
            feedback, created = InterviewFeedback.objects.get_or_create(
                session=session,
                defaults={
                    "communication_score": feedback_data["communication_score"],
                    "technical_score": feedback_data["technical_score"],
                    "problem_solving_score": feedback_data["problem_solving_score"],
                    "cultural_fit_score": feedback_data["cultural_fit_score"],
                    "strengths": feedback_data["strengths"],
                    "areas_for_improvement": feedback_data["areas_for_improvement"],
                    "detailed_feedback": feedback_data["detailed_feedback"],
                    "recommendation": feedback_data["recommendation"],
                }
            )
            
            if not created:
                feedback.communication_score = feedback_data["communication_score"]
                feedback.technical_score = feedback_data["technical_score"]
                feedback.problem_solving_score = feedback_data["problem_solving_score"]
                feedback.cultural_fit_score = feedback_data["cultural_fit_score"]
                feedback.strengths = feedback_data["strengths"]
                feedback.areas_for_improvement = feedback_data["areas_for_improvement"]
                feedback.detailed_feedback = feedback_data["detailed_feedback"]
                feedback.recommendation = feedback_data["recommendation"]
                feedback.save()
            
            # Calculer le score global
            scores = [
                feedback.communication_score,
                feedback.technical_score,
                feedback.problem_solving_score,
                feedback.cultural_fit_score,
            ]
            session.overall_score = sum(scores) / len(scores)
            session.feedback_summary = feedback_data["detailed_feedback"]
            session.save()
            
            logger.info(f"Feedback généré pour la session {interview_session_id}")
            return {"success": True, "feedback_id": feedback.id}
            
        except InterviewSession.DoesNotExist:
            logger.error(f"Session d'entretien introuvable : {interview_session_id}")
            return {"success": False, "error": "Session d'entretien introuvable"}
        except Exception as e:
            logger.error(f"Erreur lors de la génération du feedback : {e}")
            return {"success": False, "error": str(e)}
