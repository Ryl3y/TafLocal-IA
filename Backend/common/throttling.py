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


class AIRateThrottle(UserRateThrottle):
    """Limite dédiée aux endpoints de calcul IA (scoring, génération)."""
    scope = "ai"
