"""
Service d'analyse de CV.

Délègue au moteur IA interne (``ai.services.CVAnalysisService``). Ce module
est conservé pour compatibilité avec les imports existants.
"""

from ai.services import CVAnalysisService as _EngineCVAnalysisService


class CVAnalysisService:
    """Façade historique : ``CVAnalysisService.analyze_cv(cv_id)``."""

    @staticmethod
    def analyze_cv(cv_id: int):
        from .models import CV

        cv = CV.objects.select_related("candidate__user").get(pk=cv_id)
        return _EngineCVAnalysisService.analyze(cv)
