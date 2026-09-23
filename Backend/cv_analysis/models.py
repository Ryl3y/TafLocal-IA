"""
Modèles d'analyse de CV pour TafLocal AI.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _


class AnalysisStatus(models.TextChoices):
    """Énumération des statuts d'analyse."""
    PENDING = "PENDING", _("Pending")
    PROCESSING = "PROCESSING", _("Processing")
    COMPLETED = "COMPLETED", _("Completed")
    FAILED = "FAILED", _("Failed")


class CV(models.Model):
    """Modèle de CV."""

    id = models.BigAutoField(primary_key=True, verbose_name='ID')
    candidate = models.ForeignKey("users.CandidateProfile", on_delete=models.CASCADE, related_name="cvs")
    file = models.FileField(upload_to='cvs/')
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()
    file_type = models.CharField(max_length=50)
    extracted_text = models.TextField(blank=True, null=True)
    is_processed = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cvs'
        verbose_name = _("CV")
        verbose_name_plural = _("CVs")
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.file_name} - {self.candidate}"


class CVAnalysis(models.Model):
    """Modèle d'analyse de CV."""

    id = models.BigAutoField(primary_key=True, verbose_name='ID')
    cv = models.OneToOneField(CV, on_delete=models.CASCADE, related_name="analysis")
    employability_score = models.IntegerField(default=0)
    strengths = models.JSONField(blank=True, default=list)
    weaknesses = models.JSONField(blank=True, default=list)
    recommendations_data = models.JSONField(blank=True, default=list)
    score_details = models.JSONField(blank=True, default=dict)
    summary = models.TextField(blank=True, default="")
    experience_years = models.FloatField(blank=True, null=True)
    education_level = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=AnalysisStatus.choices, default=AnalysisStatus.COMPLETED)
    error_message = models.TextField(blank=True, default="")
    analyzed_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cv_analyses'
        verbose_name = _("CV Analysis")
        verbose_name_plural = _("CV Analyses")
        ordering = ['-analyzed_at']

    def __str__(self):
        return f"Analyse pour {self.cv.file_name}"


class DetectedSkill(models.Model):
    """Modèle de compétence détectée."""

    id = models.BigAutoField(primary_key=True, verbose_name='ID')
    name = models.CharField(max_length=100)
    category = models.CharField(blank=True, max_length=50, null=True)
    proficiency_level = models.CharField(blank=True, max_length=50, null=True)
    years_experience = models.IntegerField(blank=True, null=True)
    analysis = models.ForeignKey(CVAnalysis, on_delete=models.CASCADE, related_name="detected_skills")

    class Meta:
        db_table = 'detected_skills'
        verbose_name = _("Detected Skill")
        verbose_name_plural = _("Detected Skills")
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.proficiency_level})"


class MissingSkill(models.Model):
    """Modèle de compétence manquante."""

    id = models.BigAutoField(primary_key=True, verbose_name='ID')
    name = models.CharField(max_length=100)
    importance = models.CharField(blank=True, max_length=50, null=True)
    analysis = models.ForeignKey(CVAnalysis, on_delete=models.CASCADE, related_name="missing_skills")

    class Meta:
        db_table = 'missing_skills'
        verbose_name = _("Missing Skill")
        verbose_name_plural = _("Missing Skills")
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.importance})"


class AIRecommendation(models.Model):
    """Modèle de recommandation IA."""

    id = models.BigAutoField(primary_key=True, verbose_name='ID')
    category = models.CharField(max_length=50)
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(default='medium', max_length=20)
    analysis = models.ForeignKey(CVAnalysis, on_delete=models.CASCADE, related_name="recommendations")

    class Meta:
        db_table = 'ai_recommendations'
        verbose_name = _("AI Recommendation")
        verbose_name_plural = _("AI Recommendations")
        ordering = ['priority', '-id']

    def __str__(self):
        return f"{self.title} - {self.priority}"
