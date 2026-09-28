from django.apps import AppConfig


class AiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "ai"
    verbose_name = "Moteur IA interne"

    def ready(self):
        from . import signals  # noqa: F401
