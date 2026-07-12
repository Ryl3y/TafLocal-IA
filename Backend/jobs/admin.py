from django.contrib import admin
from .models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ["titre", "entreprise", "type_contrat", "experience_requise", "statut", "date_publication"]
    list_filter = ["type_contrat", "experience_requise", "statut", "date_publication"]
    search_fields = ["titre", "description", "localisation"]
