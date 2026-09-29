"""
Classes de limitation de débit (les taux sont définis dans settings.REST_FRAMEWORK).
"""

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class BurstRateThrottle(UserRateThrottle):
    """Burst rate throttle for authenticated users."""
    scope = "burst"


class SustainedRateThrottle(UserRateThrottle):
    """Sustained rate throttle for authenticated users."""
    scope = "sustained"


class AnonBurstRateThrottle(AnonRateThrottle):
    """Burst rate throttle for anonymous users."""
    scope = "anon_burst"


class AnonSustainedRateThrottle(AnonRateThrottle):
    """Sustained rate throttle for anonymous users."""
    scope = "anon_sustained"


class PasswordResetRateThrottle(AnonRateThrottle):
    """Limite les demandes de code (évite d'inonder une boîte mail ou de griller le quota SMTP)."""
    scope = "password_reset"


class AIRateThrottle(UserRateThrottle):
    """Limite dédiée aux endpoints de calcul IA (scoring, génération)."""
    scope = "ai"
