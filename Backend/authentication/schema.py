"""
Documentation OpenAPI : notre authentification est un JWT « Bearer » standard.
"""

from drf_spectacular.contrib.rest_framework_simplejwt import SimpleJWTScheme


class CompanyApprovalJWTScheme(SimpleJWTScheme):
    target_class = "authentication.authentication.CompanyApprovalJWTAuthentication"
