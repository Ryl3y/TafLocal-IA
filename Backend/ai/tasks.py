"""
Tâches Celery optionnelles (activées avec AI_USE_CELERY=True).
"""

from celery import shared_task


@shared_task(ignore_result=True)
def analyze_cv_task(cv_id: int):
    from cv_analysis.models import CV

    from .services import CVAnalysisService

    cv = CV.objects.filter(pk=cv_id).select_related("candidate__user").first()
    if cv is not None:
        CVAnalysisService.analyze(cv)
