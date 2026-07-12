from django.contrib import admin
from .models import InterviewSession, InterviewQuestion, AIFeedback


@admin.register(InterviewSession)
class InterviewSessionAdmin(admin.ModelAdmin):
    list_display = ["candidate", "offre", "statut", "date_session", "score_global"]
    list_filter = ["statut", "type_entretien", "date_session"]
    search_fields = ["candidate__user__nom", "candidate__user__prenom", "offre__titre"]


@admin.register(InterviewQuestion)
class InterviewQuestionAdmin(admin.ModelAdmin):
    list_display = ["question", "type_question", "ordre", "session"]
    list_filter = ["type_question"]
    search_fields = ["question"]


@admin.register(AIFeedback)
class AIFeedbackAdmin(admin.ModelAdmin):
    list_display = ["session", "score_global", "date_feedback"]
    list_filter = ["date_feedback"]
