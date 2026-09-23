from django.contrib import admin

from .models import MatchResult


@admin.register(MatchResult)
class MatchResultAdmin(admin.ModelAdmin):
    list_display = ["candidate", "job", "score", "computed_at"]
    list_filter = ["computed_at"]
    search_fields = ["candidate__user__nom", "candidate__user__prenom", "job__titre"]
    readonly_fields = ["candidate", "job", "score", "details", "computed_at"]
