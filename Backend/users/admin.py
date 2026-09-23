from django.contrib import admin
from .models import (
    User,
    CandidateProfile,
    Skill,
    CandidateSkill,
    WorkExperience,
    Education,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["email", "username", "role", "is_active", "created_at"]
    list_filter = ["role", "is_active", "created_at"]
    search_fields = ["email", "username", "nom", "prenom"]


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "ville", "experience_annees", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["user__nom", "user__prenom", "ville"]


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ["nom", "categorie"]
    list_filter = ["categorie"]
    search_fields = ["nom"]


@admin.register(CandidateSkill)
class CandidateSkillAdmin(admin.ModelAdmin):
    list_display = ["candidate", "skill", "niveau", "annees_experience"]
    list_filter = ["niveau"]
    search_fields = ["candidate__user__nom", "skill__nom"]


@admin.register(WorkExperience)
class WorkExperienceAdmin(admin.ModelAdmin):
    list_display = ["candidate", "poste", "entreprise", "date_debut", "date_fin", "en_cours"]
    list_filter = ["en_cours"]
    search_fields = ["candidate__user__nom", "poste", "entreprise"]


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ["candidate", "diplome", "etablissement", "date_debut", "date_fin"]
    search_fields = ["candidate__user__nom", "diplome", "etablissement"]
