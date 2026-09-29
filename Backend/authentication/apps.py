from django.apps import AppConfig


class AuthenticationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "authentication"

    def ready(self):
        # Enregistre l'extension OpenAPI de notre authentification JWT.
        from . import schema  # noqa: F401
