"""
Custom throttling classes for TafLocal AI.
"""

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class BurstRateThrottle(UserRateThrottle):
    """Burst rate throttle for authenticated users."""
    scope = "burst"
    rate = "100/min"


class SustainedRateThrottle(UserRateThrottle):
    """Sustained rate throttle for authenticated users."""
    scope = "sustained"
    rate = "1000/hour"


class AnonBurstRateThrottle(AnonRateThrottle):
    """Burst rate throttle for anonymous users."""
    scope = "anon_burst"
    rate = "20/min"


class AnonSustainedRateThrottle(AnonRateThrottle):
    """Sustained rate throttle for anonymous users."""
    scope = "anon_sustained"
    rate = "100/hour"
