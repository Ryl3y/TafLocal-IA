from django.contrib import admin
from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ["candidate", "offre", "statut", "date_candidature"]
    list_filter = ["statut", "date_candidature"]
    search_fields = ["candidate__user__prenom", "candidate__user__nom", "offre__titre"]
