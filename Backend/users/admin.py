from django.contrib import admin
from .models import User, CandidateProfile


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["email", "username", "role", "is_active", "created_at"]
    list_filter = ["role", "is_active", "created_at"]
    search_fields = ["email", "username", "nom", "prenom"]


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "ville", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["user__nom", "user__prenom", "ville"]
