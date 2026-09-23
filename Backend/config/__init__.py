# Charger Celery au démarrage de Django (utilisé seulement si un worker tourne).
try:
    from .celery import app as celery_app

    __all__ = ("celery_app",)
except ImportError:  # Celery non installé : l'application fonctionne sans.
    pass
