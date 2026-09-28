"""
Configuration Django pour le projet TafLocal AI.
"""

import os
from pathlib import Path
from datetime import timedelta

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

# Construction des chemins
BASE_DIR = Path(__file__).resolve().parent.parent

# Chargement des variables d'environnement
load_dotenv(dotenv_path=BASE_DIR / ".env")


def env_bool(key: str, default: bool = False) -> bool:
    value = os.getenv(key)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_list(key: str, default=None, separator: str = ",") -> list[str]:
    value = os.getenv(key)
    if not value:
        return default or []
    return [item.strip() for item in value.split(separator) if item.strip()]


# AVERTISSEMENT DE SÉCURITÉ : gardez la clé secrète utilisée en production confidentielle !
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ImproperlyConfigured("The SECRET_KEY environment variable must be set.")

# AVERTISSEMENT DE SÉCURITÉ : n'exécutez pas avec le mode debug activé en production !
DEBUG = env_bool("DEBUG", default=False)

ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

# Définition des applications
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

# Applications tierces
THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "django_filters",
    "drf_spectacular",
    "corsheaders",
    "rest_framework_simplejwt.token_blacklist",
]

# Applications locales
LOCAL_APPS = [
    "authentication",
    "users",
    "companies",
    "jobs",
    "applications",
    "cv_analysis",
    "interviews",
    "notifications",
    "ai",
    "common",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "common.middleware.AuditLogMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# Base de données (PostgreSQL par défaut ; DB_ENGINE=sqlite pour un essai rapide)
if os.getenv("DB_ENGINE", "postgresql").lower() == "sqlite":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / os.getenv("DB_NAME", "db.sqlite3"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME", "taflocal_ai"),
            "USER": os.getenv("DB_USER", "postgres"),
            "PASSWORD": os.getenv("DB_PASSWORD", "postgres"),
            "HOST": os.getenv("DB_HOST", "localhost"),
            "PORT": os.getenv("DB_PORT", "5432"),
        }
    }

# Validation du mot de passe
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalisation
LANGUAGE_CODE = "fr-fr"
TIME_ZONE = os.getenv("TIME_ZONE", "Africa/Douala")
USE_I18N = True
USE_TZ = True

# Fichiers statiques (CSS, JavaScript, Images)
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Fichiers médias
MEDIA_URL = os.getenv("MEDIA_URL", "/media/")
MEDIA_ROOT = BASE_DIR / "media"

# Type de champ de clé primaire par défaut
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Modèle utilisateur personnalisé
AUTH_USER_MODEL = "users.User"

# Backend d'authentification personnalisé
AUTHENTICATION_BACKENDS = [
    "authentication.backends.EmailBackend",
    "django.contrib.auth.backends.ModelBackend",
]

# Framework REST
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        # JWT + blocage des entreprises non validées par un administrateur.
        "authentication.authentication.CompanyApprovalJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": [
        "common.throttling.BurstRateThrottle",
        "common.throttling.SustainedRateThrottle",
    ],
    # Nombre de proxys de confiance devant l'application (Nginx, load balancer…).
    # 0 = l'en-tête X-Forwarded-For est ignoré : un client ne peut pas usurper une autre IP
    # pour contourner la limitation de débit (force brute sur la connexion).
    "NUM_PROXIES": int(os.getenv("NUM_PROXIES", 0)),
    "DEFAULT_THROTTLE_RATES": {
        "burst": "100/min",
        "sustained": "1000/hour",
        "anon_burst": "20/min",
        "anon_sustained": "100/hour",
        "password_reset": os.getenv("PASSWORD_RESET_THROTTLE_RATE", "5/min"),
        "ai": os.getenv("AI_THROTTLE_RATE", "60/min"),
    },
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_FORMAT_SUFFIX_ENABLED": False,
}

# Configuration JWT
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("JWT_ACCESS_TOKEN_LIFETIME", 60))),
    "REFRESH_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("JWT_REFRESH_TOKEN_LIFETIME", 1440))),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_AUTHENTICATION_RULE": lambda user: user.is_authenticated,
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
}

# Configuration drf-spectacular
SPECTACULAR_SETTINGS = {
    "TITLE": "TafLocal AI API",
    "DESCRIPTION": "AI-powered Career Assistant API",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
    "ENUM_NAME_OVERRIDES": {
        "UserRoleEnum": "users.models.UserRole",
        "JobStatusEnum": "jobs.models.JobStatus",
        "ApplicationStatusEnum": "applications.models.ApplicationStatus",
        "InterviewStatusEnum": "interviews.models.InterviewStatus",
    },
}

# Sécurité HTTPS (activée automatiquement hors mode debug, désactivable par variable d'environnement)
SECURE_SSL = env_bool("SECURE_SSL", default=not DEBUG)
SESSION_COOKIE_SECURE = SECURE_SSL
CSRF_COOKIE_SECURE = SECURE_SSL
SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", default=SECURE_SSL)
# HSTS : le navigateur refuse ensuite tout accès non chiffré (1 an par défaut en production).
SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", 31536000 if SECURE_SSL else 0))
SECURE_HSTS_INCLUDE_SUBDOMAINS = SECURE_HSTS_SECONDS > 0
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https") if env_bool("BEHIND_PROXY") else None

# En-têtes de protection du navigateur
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"  # anti clickjacking
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = "Lax"

# Taille maximale des requêtes (évite l'épuisement mémoire par envois massifs)
DATA_UPLOAD_MAX_MEMORY_SIZE = int(os.getenv("DATA_UPLOAD_MAX_MEMORY_SIZE", 10 * 1024 * 1024))
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000

# Verrouillage de compte après des échecs de connexion (anti force brute)
LOGIN_MAX_FAILURES = int(os.getenv("LOGIN_MAX_FAILURES", 5))
LOGIN_FAILURE_WINDOW_MINUTES = int(os.getenv("LOGIN_FAILURE_WINDOW_MINUTES", 15))
LOGIN_LOCKOUT_MINUTES = int(os.getenv("LOGIN_LOCKOUT_MINUTES", 15))

# Cache : Redis s'il est configuré (indispensable avec plusieurs processus, pour que
# verrouillages et limitations soient partagés), sinon mémoire locale (développement).
if os.getenv("CACHE_REDIS_URL"):
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": os.getenv("CACHE_REDIS_URL"),
        }
    }

# Interface d'administration Django : adresse non devinable en production.
ADMIN_URL = os.getenv("ADMIN_URL", "admin/").strip("/") + "/"
# Documentation de l'API (Swagger / schéma) : publique seulement en développement.
API_DOCS_PUBLIC = env_bool("API_DOCS_PUBLIC", default=DEBUG)

# Garde-fous : refuser de démarrer une production mal configurée.
if not DEBUG:
    if len(SECRET_KEY) < 50 or SECRET_KEY.startswith("django-insecure"):
        raise ImproperlyConfigured("SECRET_KEY trop faible pour la production (50 caractères aléatoires minimum).")
    if "*" in ALLOWED_HOSTS:
        raise ImproperlyConfigured("ALLOWED_HOSTS ne doit pas contenir « * » en production.")

# Configuration CORS
CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
)
CORS_ALLOW_CREDENTIALS = True
# Origines autorisées à envoyer des requêtes modifiantes (contrôle CSRF de l'en-tête Origin).
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", default=CORS_ALLOWED_ORIGINS)

# Jetons JWT en cookies HttpOnly (voir authentication/cookies.py).
# Strict : jamais envoyés depuis un autre site. Le frontend doit appeler l'API sur la
# MÊME origine (/api via le proxy Vite en développement, via le serveur web en production).
AUTH_COOKIE_SAMESITE = os.getenv("AUTH_COOKIE_SAMESITE", "Strict")
CORS_ALLOW_HEADERS = [
    "content-type",
    "authorization",
    "x-requested-with",
]
CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
]

# Moteur IA interne (aucune API externe)
AI_ENGINE = {
    # Durée de validité des scores de compatibilité mis en cache (secondes).
    "MATCH_CACHE_TTL": int(os.getenv("AI_MATCH_CACHE_TTL", 3600)),
    # Nombre de questions générées par défaut pour une simulation d'entretien.
    "INTERVIEW_DEFAULT_QUESTIONS": int(os.getenv("AI_INTERVIEW_QUESTIONS", 6)),
    # Nombre maximal d'offres analysées pour les recommandations.
    "MAX_JOBS_SCANNED": int(os.getenv("AI_MAX_JOBS_SCANNED", 500)),
    # Exécuter l'analyse de CV via Celery (nécessite Redis et un worker).
    "USE_CELERY": env_bool("AI_USE_CELERY", default=False),
}

# Fichiers de CV acceptés
CV_MAX_UPLOAD_SIZE = int(os.getenv("CV_MAX_UPLOAD_SIZE", 5 * 1024 * 1024))

# Documents privés (certificat RCCM des entreprises) : jamais servis publiquement.
PRIVATE_MEDIA_ROOT = Path(os.getenv("PRIVATE_MEDIA_ROOT", BASE_DIR / "private_media"))
RCCM_MAX_UPLOAD_SIZE = int(os.getenv("RCCM_MAX_UPLOAD_SIZE", 5 * 1024 * 1024))

# E-mails (réinitialisation du mot de passe…)
# Sans configuration SMTP, les e-mails sont affichés dans le terminal du serveur.
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.smtp.EmailBackend" if os.getenv("EMAIL_HOST") else "django.core.mail.backends.console.EmailBackend",
)
EMAIL_HOST = os.getenv("EMAIL_HOST", "")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", default=True)
EMAIL_USE_SSL = env_bool("EMAIL_USE_SSL", default=False)
EMAIL_TIMEOUT = 15
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "TafLocal AI <no-reply@taflocal.ai>")

# Réinitialisation du mot de passe par code
PASSWORD_RESET_CODE_TTL_MINUTES = int(os.getenv("PASSWORD_RESET_CODE_TTL_MINUTES", 15))
PASSWORD_RESET_MAX_ATTEMPTS = int(os.getenv("PASSWORD_RESET_MAX_ATTEMPTS", 5))
PASSWORD_RESET_RESEND_SECONDS = int(os.getenv("PASSWORD_RESET_RESEND_SECONDS", 60))

# Configuration Celery
CELERY_BROKER_URL = f"redis://{os.getenv('REDIS_HOST', 'localhost')}:{os.getenv('REDIS_PORT', '6379')}/{os.getenv('REDIS_DB', '0')}"
CELERY_RESULT_BACKEND = f"redis://{os.getenv('REDIS_HOST', 'localhost')}:{os.getenv('REDIS_PORT', '6379')}/{os.getenv('REDIS_DB', '0')}"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE

# Journalisation
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": os.getenv("DJANGO_LOG_LEVEL", "INFO"),
            "propagate": False,
        },
    },
}
