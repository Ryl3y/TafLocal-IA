from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["user", "type", "titre", "lu", "date_envoi"]
    list_filter = ["type", "lu", "date_envoi"]
    search_fields = ["titre", "message", "user__email"]
