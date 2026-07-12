from django.contrib import admin
from .models import CV, CVAnalysis, DetectedSkill, MissingSkill, AIRecommendation


@admin.register(CV)
class CVAdmin(admin.ModelAdmin):
    list_display = ["file_name", "candidate", "uploaded_at", "is_processed"]
    list_filter = ["is_processed", "uploaded_at"]
    search_fields = ["file_name", "candidate__user__nom", "candidate__user__prenom"]


@admin.register(CVAnalysis)
class CVAnalysisAdmin(admin.ModelAdmin):
    list_display = ["cv", "employability_score", "analyzed_at"]
    list_filter = ["analyzed_at"]


@admin.register(DetectedSkill)
class DetectedSkillAdmin(admin.ModelAdmin):
    list_display = ["name", "proficiency_level", "analysis"]
    list_filter = ["proficiency_level"]
    search_fields = ["name"]


@admin.register(MissingSkill)
class MissingSkillAdmin(admin.ModelAdmin):
    list_display = ["name", "importance", "analysis"]
    list_filter = ["importance"]
    search_fields = ["name"]


@admin.register(AIRecommendation)
class AIRecommendationAdmin(admin.ModelAdmin):
    list_display = ["title", "priority", "analysis"]
    list_filter = ["priority"]
    search_fields = ["title"]
