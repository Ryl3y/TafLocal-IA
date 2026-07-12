"""
Service de matching entre candidats et offres d'emploi.
"""

import logging
from typing import Dict, List, Any
from django.db.models import Q
from users.models import CandidateProfile
from companies.models import Company
from .models import Job, ContractType
from cv_analysis.models import CV, CVAnalysis, DetectedSkill, AIRecommendation

logger = logging.getLogger(__name__)


class JobMatchingService:
    """Service pour le matching entre candidats et offres d'emploi."""

    @staticmethod
    def get_candidate_skills(candidate_id: str) -> List[str]:
        """Récupérer les compétences d'un candidat depuis ses CVs."""
        try:
            candidate = CandidateProfile.objects.get(id=candidate_id)
            cvs = CV.objects.filter(candidate=candidate, is_processed=True)
            
            skills = set()
            for cv in cvs:
                analysis = CVAnalysis.objects.filter(cv=cv).first()
                if analysis:
                    cv_skills = DetectedSkill.objects.filter(analysis=analysis)
                    for skill in cv_skills:
                        skills.add(skill.name.lower())
            
            return list(skills)
        except CandidateProfile.DoesNotExist:
            logger.error(f"Candidat introuvable : {candidate_id}")
            return []

    @staticmethod
    def calculate_skill_match(candidate_skills: List[str], job_requirements: str) -> float:
        """Calculer le score de correspondance des compétences (0-100)."""
        if not job_requirements:
            return 50.0
        
        # Extraire les compétences requises depuis la description
        # Pour simplifier, on suppose que job_requirements contient des mots-clés
        required_skills = set()
        common_tech_keywords = [
            'python', 'javascript', 'java', 'react', 'angular', 'vue', 'nodejs',
            'django', 'flask', 'spring', 'docker', 'kubernetes', 'aws', 'azure',
            'sql', 'postgresql', 'mongodb', 'redis', 'git', 'agile', 'scrum',
            'html', 'css', 'typescript', 'go', 'rust', 'php', 'laravel',
            'machine learning', 'ai', 'data science', 'devops', 'ci/cd'
        ]
        
        job_text = job_requirements.lower()
        for keyword in common_tech_keywords:
            if keyword in job_text:
                required_skills.add(keyword)
        
        if not required_skills:
            return 50.0
        
        candidate_skills_set = set(skill.lower() for skill in candidate_skills)
        
        # Calculer le nombre de compétences correspondantes
        matched_skills = required_skills & candidate_skills_set
        match_score = (len(matched_skills) / len(required_skills)) * 100
        
        return min(match_score, 100.0)

    @staticmethod
    def calculate_experience_match(candidate_experience: int, required_experience: str) -> float:
        """Calculer le score de correspondance de l'expérience (0-100)."""
        if not required_experience:
            return 50.0
        
        # Extraire le nombre d'années requises
        try:
            if 'junior' in required_experience.lower():
                required_years = 1
            elif 'senior' in required_experience.lower():
                required_years = 5
            elif 'expert' in required_experience.lower() or 'lead' in required_experience.lower():
                required_years = 8
            else:
                # Tenter d'extraire un nombre
                import re
                match = re.search(r'(\d+)', required_experience)
                required_years = int(match.group(1)) if match else 3
        except:
            required_years = 3
        
        if candidate_experience >= required_years:
            return 100.0
        elif candidate_experience >= required_years * 0.8:
            return 80.0
        elif candidate_experience >= required_years * 0.5:
            return 60.0
        else:
            return 30.0

    @staticmethod
    def calculate_location_match(candidate_location: str, job_location: str) -> float:
        """Calculer le score de correspondance de la localisation (0-100)."""
        if not candidate_location or not job_location:
            return 50.0
        
        candidate_loc = candidate_location.lower()
        job_loc = job_location.lower()
        
        # Correspondance exacte
        if candidate_loc == job_loc:
            return 100.0
        
        # Correspondance partielle
        if candidate_loc in job_loc or job_loc in candidate_loc:
            return 80.0
        
        # Télétravail
        if 'remote' in job_loc or 'télétravail' in job_loc:
            return 90.0
        
        return 30.0

    @staticmethod
    def calculate_salary_match(expected_salary: float, job_salary_min: float, job_salary_max: float) -> float:
        """Calculer le score de correspondance salariale (0-100)."""
        if not expected_salary or not job_salary_min or not job_salary_max:
            return 50.0
        
        if job_salary_min <= expected_salary <= job_salary_max:
            return 100.0
        elif expected_salary < job_salary_min:
            # Candidat demande moins que le minimum - bon pour l'entreprise
            return 90.0
        elif expected_salary > job_salary_max:
            # Candidat demande plus que le maximum
            diff = (expected_salary - job_salary_max) / job_salary_max
            if diff < 0.1:  # Moins de 10% au-dessus
                return 70.0
            elif diff < 0.2:  # Moins de 20% au-dessus
                return 50.0
            else:
                return 20.0
        
        return 50.0

    @staticmethod
    def match_candidate_with_jobs(candidate_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Matcher un candidat avec les offres d'emploi disponibles.
        
        Args:
            candidate_id: ID du candidat
            limit: Nombre maximum de résultats à retourner
            
        Returns:
            Liste des offres avec leur score de compatibilité
        """
        try:
            candidate = CandidateProfile.objects.get(id=candidate_id)
            
            # Récupérer les compétences du candidat
            candidate_skills = JobMatchingService.get_candidate_skills(candidate_id)
            
            # Récupérer toutes les offres actives
            jobs = Job.objects.filter(statut='ACTIVE').select_related('entreprise')
            
            results = []
            for job in jobs:
                # Calculer les scores de correspondance
                skill_score = JobMatchingService.calculate_skill_match(
                    candidate_skills, 
                    job.description
                )
                
                experience_score = JobMatchingService.calculate_experience_match(
                    0,  # À remplacer par l'expérience réelle du candidat
                    job.experience_requise or ""
                )
                
                location_score = JobMatchingService.calculate_location_match(
                    candidate.ville or "",
                    job.localisation or ""
                )
                
                # Score global (pondéré)
                global_score = (
                    skill_score * 0.4 +
                    experience_score * 0.3 +
                    location_score * 0.3
                )
                
                results.append({
                    'job_id': str(job.id),
                    'job_title': job.titre,
                    'company_name': job.entreprise.nom_entreprise,
                    'location': job.localisation,
                    'contract_type': job.type_contrat,
                    'salary_min': job.salaire_min,
                    'salary_max': job.salaire_max,
                    'skill_score': round(skill_score, 2),
                    'experience_score': round(experience_score, 2),
                    'location_score': round(location_score, 2),
                    'global_score': round(global_score, 2),
                    'matched_skills': candidate_skills[:5] if candidate_skills else [],
                })
            
            # Trier par score global décroissant
            results.sort(key=lambda x: x['global_score'], reverse=True)
            
            return results[:limit]
            
        except CandidateProfile.DoesNotExist:
            logger.error(f"Candidat introuvable : {candidate_id}")
            return []
        except Exception as e:
            logger.error(f"Erreur lors du matching : {e}")
            return []

    @staticmethod
    def get_job_recommendations_for_candidate(candidate_id: str) -> List[Dict[str, Any]]:
        """
        Obtenir les recommandations d'emploi pour un candidat.
        Utilise la table recommandation_offre si disponible, sinon calcule en temps réel.
        """
        try:
            candidate = CandidateProfile.objects.get(id=candidate_id)
            
            # Vérifier s'il y a des recommandations existantes
            cvs = CV.objects.filter(candidate=candidate, is_processed=True)
            if cvs.exists():
                cv = cvs.first()
                analysis = CVAnalysis.objects.filter(cv=cv).first()
                
                if analysis:
                    recommendations = AIRecommendation.objects.filter(
                        analysis=analysis
                    ).order_by('-priority')
                    
                    if recommendations.exists():
                        results = []
                        for rec in recommendations:
                            results.append({
                                'title': rec.title,
                                'description': rec.description,
                                'priority': rec.priority,
                                'is_cached': True,
                            })
                        return results[:10]
            
            # Si pas de recommandations en cache, calculer en temps réel
            return JobMatchingService.match_candidate_with_jobs(candidate_id)
            
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des recommandations : {e}")
            return JobMatchingService.match_candidate_with_jobs(candidate_id)
