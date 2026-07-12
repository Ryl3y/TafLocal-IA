"""
Services IA pour TafLocal AI.
Intégration avec Google Gemini pour les fonctionnalités IA.
"""

import logging
import os
import json
from typing import Dict, List, Any
from google import genai
from django.conf import settings

logger = logging.getLogger(__name__)

# Configuration de Gemini
MODEL_NAME = 'gemini-1.5-flash'
_client = None

def get_genai_client():
    global _client
    if _client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        _client = genai.Client(api_key=api_key)
    return _client


class AIService:
    """Service IA de base."""

    @staticmethod
    def is_available() -> bool:
        """Vérifier si le service IA est disponible."""
        # TODO : Ajouter une vérification réelle de disponibilité du service IA
        return True

    @staticmethod
    def generate_text(prompt: str, max_tokens: int = 500) -> str:
        """Générer du texte en utilisant l'IA."""
        try:
            response = get_genai_client().models.generate_content(
                model=MODEL_NAME,
                contents=prompt
            )
            return response.text
        except Exception as e:
            logger.error(f"Erreur lors de la génération de texte : {e}")
            return f"Erreur : {str(e)}"


class CVAnalyzerService:
    """Service d'analyse de CV."""

    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extraire le texte d'un fichier PDF."""
        try:
            from PyPDF2 import PdfReader
            
            reader = PdfReader(file_path)
            text = ""
            
            for page in reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction de texte PDF : {e}")
            return ""

    @staticmethod
    def analyze_skills(text: str) -> List[Dict[str, Any]]:
        """Analyser les compétences à partir du texte du CV."""
        try:
            prompt = f"""
            Analyse le texte de CV suivant et extrait les compétences techniques.
            Retourne uniquement une liste JSON valide avec ce format :
            [
                {{"name": "nom_compétence", "category": "catégorie", "proficiency": "niveau", "years_experience": nombre}}
            ]
            
            Texte du CV :
            {text}
            """
            response = get_genai_client().models.generate_content(model=MODEL_NAME, contents=prompt)
            skills_data = json.loads(response.text)
            return skills_data
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse des compétences : {e}")
            return []

    @staticmethod
    def calculate_employability_score(skills: List[Dict], experience: int) -> int:
        """Calculer le score d'employabilité."""
        # TODO : Implémenter l'algorithme de scoring réel
        base_score = 50
        skill_bonus = min(len(skills) * 5, 30)
        experience_bonus = min(experience * 2, 20)
        return base_score + skill_bonus + experience_bonus

    @staticmethod
    def generate_recommendations(analysis: Dict) -> List[Dict[str, Any]]:
        """Générer des recommandations d'amélioration de CV."""
        try:
            prompt = f"""
            Basé sur l'analyse de CV suivante, génère 3-5 recommandations d'amélioration.
            Retourne uniquement une liste JSON valide avec ce format :
            [
                {{"category": "catégorie", "title": "titre", "description": "description", "priority": "high/medium/low"}}
            ]
            
            Analyse :
            {json.dumps(analysis, ensure_ascii=False)}
            """
            response = get_genai_client().models.generate_content(model=MODEL_NAME, contents=prompt)
            recommendations_data = json.loads(response.text)
            return recommendations_data
        except Exception as e:
            logger.error(f"Erreur lors de la génération des recommandations : {e}")
            return []


class MatchingService:
    """Service de correspondance d'emploi."""

    @staticmethod
    def match_cv_to_job(cv_id: int, job_id: int) -> Dict[str, Any]:
        """Correspondre le CV à l'emploi et retourner le score de compatibilité."""
        try:
            from cv_analysis.models import CV, CVAnalysis
            from jobs.models import Job
            
            # Récupérer le CV et l'emploi
            cv = CV.objects.get(id=cv_id)
            job = Job.objects.get(id=job_id)
            
            # Récupérer l'analyse du CV si elle existe
            try:
                analysis = CVAnalysis.objects.get(cv=cv)
                cv_text = cv.extracted_text or ""
                cv_skills = [skill.name for skill in analysis.detected_skills.all()]
            except CVAnalysis.DoesNotExist:
                cv_text = cv.extracted_text or ""
                cv_skills = []
            
            # Préparer les données de l'emploi
            job_text = f"""
            Titre : {job.title}
            Description : {job.description}
            Exigences : {job.requirements}
            Compétences requises : {job.skills_required}
            """
            
            # Utiliser Gemini pour le matching
            prompt = f"""
            Analyse la compatibilité entre ce CV et cet emploi.
            Retourne uniquement un JSON valide avec ce format :
            {{
                "compatibility_score": nombre_entre_0_et_100,
                "explanation": "explication_détaillée",
                "matched_skills": ["compétence1", "compétence2"],
                "missing_skills": ["compétence_manquante1", "compétence_manquante2"],
                "recommendations": ["recommandation1", "recommandation2"]
            }}
            
            CV :
            {cv_text}
            Compétences du CV : {', '.join(cv_skills)}
            
            Emploi :
            {job_text}
            """
            response = get_genai_client().models.generate_content(model=MODEL_NAME, contents=prompt)
            matching_data = json.loads(response.text)
            
            return {
                "cv_id": cv_id,
                "job_id": job_id,
                **matching_data
            }
        except Exception as e:
            logger.error(f"Erreur lors du matching CV/Emploi : {e}")
            return {
                "cv_id": cv_id,
                "job_id": job_id,
                "compatibility_score": 50,
                "explanation": f"Erreur lors de l'analyse : {str(e)}",
                "matched_skills": [],
                "missing_skills": [],
                "recommendations": []
            }

    @staticmethod
    def get_job_recommendations(candidate_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """Obtenir des recommandations d'emploi pour un candidat."""
        try:
            from users.models import CandidateProfile
            from cv_analysis.models import CV, CVAnalysis
            from jobs.models import Job
            
            # Récupérer le profil candidat
            candidate = CandidateProfile.objects.get(id=candidate_id)
            
            # Récupérer le CV et l'analyse
            try:
                cv = CV.objects.filter(candidate=candidate).first()
                if cv:
                    analysis = CVAnalysis.objects.filter(cv=cv).first()
                    cv_text = cv.extracted_text or ""
                    cv_skills = [skill.name for skill in analysis.detected_skills.all()] if analysis else []
                else:
                    cv_text = ""
                    cv_skills = []
            except:
                cv_text = ""
                cv_skills = []
            
            # Récupérer les emplois actifs
            jobs = Job.objects.filter(is_active=True, is_archived=False)[:limit * 2]
            
            # Analyser chaque emploi avec Gemini
            recommendations = []
            for job in jobs:
                job_text = f"""
                Titre : {job.title}
                Entreprise : {job.company.profile.company_name if job.company else "N/A"}
                Description : {job.description}
                Exigences : {job.requirements}
                Compétences requises : {job.skills_required}
                """
                
                prompt = f"""
                Évalue la compatibilité de ce candidat pour ce poste.
                Retourne uniquement un JSON valide avec ce format :
                {{
                    "compatibility_score": nombre_entre_0_et_100,
                    "match_reason": "raison_de_la_correspondance"
                }}
                
                Profil du candidat :
                Expérience : {candidate.experience_years} ans
                Compétences : {', '.join(cv_skills)}
                CV : {cv_text[:500]}
                
                Emploi :
                {job_text}
                """
                
                try:
                    response = get_genai_client().models.generate_content(model=MODEL_NAME, contents=prompt)
                    match_data = json.loads(response.text)
                    
                    recommendations.append({
                        "job_id": job.id,
                        "title": job.title,
                        "company": job.company.profile.company_name if job.company else "N/A",
                        "compatibility_score": match_data.get("compatibility_score", 50),
                        "match_reason": match_data.get("match_reason", "Analyse non disponible")
                    })
                except:
                    continue
            
            # Trier par score de compatibilité et limiter
            recommendations.sort(key=lambda x: x["compatibility_score"], reverse=True)
            return recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Erreur lors des recommandations d'emploi : {e}")
            return []


class InterviewService:
    """Service d'entretien."""

    @staticmethod
    def generate_questions(interview_session_id: int) -> List[Dict[str, Any]]:
        """Générer des questions d'entretien basées sur les exigences de l'emploi."""
        try:
            from interviews.models import InterviewSession, InterviewQuestion
            from jobs.models import Job
            
            # Récupérer la session d'entretien
            session = InterviewSession.objects.get(id=interview_session_id)
            
            # Récupérer l'emploi
            job = session.offre
            
            # Préparer les données de l'emploi
            job_text = f"""
            Titre : {job.titre}
            Description : {job.description}
            """
            
            # Utiliser Gemini pour générer les questions
            prompt = f"""
            Génère 5 questions d'entretien pour ce poste.
            Retourne uniquement une liste JSON valide avec ce format :
            [
                {{
                    "question": "texte_de_la_question",
                    "type_question": "OPEN",
                    "ordre": numéro
                }}
            ]
            
            Poste :
            {job_text}
            """
            response = get_genai_client().models.generate_content(model=MODEL_NAME, contents=prompt)
            questions_data = json.loads(response.text)
            
            # Créer les questions en base de données
            for q_data in questions_data:
                InterviewQuestion.objects.create(
                    session=session,
                    question=q_data["question"],
                    type_question=q_data["type_question"],
                    ordre=q_data["ordre"]
                )
            
            return questions_data
        except Exception as e:
            logger.error(f"Erreur lors de la génération des questions : {e}")
            return []

    @staticmethod
    def evaluate_answer(question: str, answer: str) -> Dict[str, Any]:
        """Évaluer la réponse d'entretien."""
        try:
            prompt = f"""
            Évalue la réponse suivante à la question d'entretien.
            Retourne uniquement un JSON valide avec ce format :
            {{
                "score": nombre_entre_0_et_10,
                "feedback": "feedback_bref",
                "strengths": ["force1", "force2"],
                "improvements": ["amélioration1", "amélioration2"]
            }}
            
            Question : {question}
            Réponse : {answer}
            """
            response = get_genai_client().models.generate_content(model=MODEL_NAME, contents=prompt)
            evaluation_data = json.loads(response.text)
            return evaluation_data
        except Exception as e:
            logger.error(f"Erreur lors de l'évaluation de la réponse : {e}")
            return {
                "score": 5.0,
                "feedback": "Erreur lors de l'évaluation",
                "strengths": [],
                "improvements": []
            }

    @staticmethod
    def generate_feedback(interview_session_id: int) -> Dict[str, Any]:
        """Générer un feedback d'entretien complet."""
        try:
            from interviews.models import InterviewSession, InterviewQuestion, AIFeedback
            from jobs.models import Job
            
            # Récupérer la session d'entretien
            session = InterviewSession.objects.get(id=interview_session_id)
            
            # Récupérer l'emploi
            job = session.offre
            
            # Récupérer les questions et réponses du candidat
            questions = InterviewQuestion.objects.filter(session=session)
            
            # Préparer le contexte de l'entretien
            job_text = f"""
            Titre : {job.titre}
            Description : {job.description}
            """
            
            # Préparer les réponses
            answers_text = "\n".join([
                f"Q{i+1}: {q.question}\nR: {q.reponse}"
                for i, q in enumerate(questions)
            ])
            
            # Utiliser Gemini pour générer le feedback
            prompt = f"""
            Évalue cette session d'entretien et génère un feedback complet.
            Retourne uniquement un JSON valide avec ce format :
            {{
                "score_global": nombre_entre_0_et_100,
                "points_forts": ["force1", "force2"],
                "points_faibles": ["amélioration1", "amélioration2"],
                "conseils": ["conseil1", "conseil2"]
            }}
            
            Poste :
            {job_text}
            
            Réponses du candidat :
            {answers_text}
            """
            response = get_genai_client().models.generate_content(model=MODEL_NAME, contents=prompt)
            feedback_data = json.loads(response.text)
            
            # Créer le feedback en base de données
            AIFeedback.objects.create(
                session=session,
                score_global=feedback_data.get("score_global", 50),
                points_forts=feedback_data.get("points_forts", []),
                points_faibles=feedback_data.get("points_faibles", []),
                conseils=feedback_data.get("conseils", [])
            )
            
            return feedback_data
        except Exception as e:
            logger.error(f"Erreur lors de la génération du feedback : {e}")
            return {
                "score_global": 50,
                "points_forts": [],
                "points_faibles": [],
                "conseils": []
            }
