"""
Invalidation du cache de matching quand les données sources changent.
"""

from django.db.models.signals import m2m_changed, post_delete, post_save
from django.dispatch import receiver

from cv_analysis.models import CV, CVAnalysis
from jobs.models import Job
from users.models import CandidateProfile, CandidateSkill, Education, WorkExperience

from .models import MatchResult


def _invalidate_candidate(candidate_id):
    if candidate_id:
        MatchResult.objects.filter(candidate_id=candidate_id).delete()


@receiver(post_save, sender=CandidateProfile)
def candidate_profile_changed(sender, instance, **kwargs):
    _invalidate_candidate(instance.pk)


@receiver([post_save, post_delete], sender=CandidateSkill)
@receiver([post_save, post_delete], sender=WorkExperience)
@receiver([post_save, post_delete], sender=Education)
@receiver([post_save, post_delete], sender=CV)
def candidate_data_changed(sender, instance, **kwargs):
    _invalidate_candidate(instance.candidate_id)


@receiver([post_save, post_delete], sender=CVAnalysis)
def cv_analysis_changed(sender, instance, **kwargs):
    candidate_id = CV.objects.filter(pk=instance.cv_id).values_list("candidate_id", flat=True).first()
    _invalidate_candidate(candidate_id)


@receiver(post_save, sender=Job)
def job_changed(sender, instance, **kwargs):
    MatchResult.objects.filter(job_id=instance.pk).delete()


@receiver(m2m_changed, sender=Job.competences_requises.through)
def job_skills_changed(sender, instance, action, **kwargs):
    if action in {"post_add", "post_remove", "post_clear"} and isinstance(instance, Job):
        MatchResult.objects.filter(job_id=instance.pk).delete()
