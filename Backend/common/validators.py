"""
Custom validators for TafLocal AI.
"""

import re
import os
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class PhoneNumberValidator:
    """Validate phone number format."""

    def __call__(self, value):
        if not re.match(r'^\+?[\d\s()\-]{8,20}$', value):
            raise ValidationError(_("Please enter a valid phone number."))


class URLValidator:
    """Validate URL format."""

    def __call__(self, value):
        if not re.match(
            r'^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$',
            value
        ):
            raise ValidationError(_("Please enter a valid URL."))


class SalaryValidator:
    """Validate salary range."""

    def __call__(self, value):
        if value and (value < 0 or value > 1000000):
            raise ValidationError(_("Salary must be between 0 and 1,000,000."))


class SkillValidator:
    """Validate skills list."""

    def __call__(self, value):
        if not isinstance(value, list):
            raise ValidationError(_("Skills must be a list."))
        if len(value) > 50:
            raise ValidationError(_("Maximum 50 skills allowed."))
        for skill in value:
            if not isinstance(skill, str) or len(skill) > 100:
                raise ValidationError(_("Each skill must be a string with max 100 characters."))


class ExperienceValidator:
    """Validate experience years."""

    def __call__(self, value):
        if value is not None and (value < 0 or value > 50):
            raise ValidationError(_("Experience must be between 0 and 50 years."))


class FileValidator:
    """Validate uploaded files (type, size)."""

    ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx']
    ALLOWED_MIME_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

    def __call__(self, value):
        # Vérifier la taille du fichier
        if value.size > self.MAX_FILE_SIZE:
            raise ValidationError(
                _(f"Le fichier ne doit pas dépasser {self.MAX_FILE_SIZE / (1024 * 1024)} MB.")
            )

        # Vérifier l'extension
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            raise ValidationError(
                _(f"Extensions autorisées : {', '.join(self.ALLOWED_EXTENSIONS)}.")
            )

        # Vérifier le type MIME si disponible
        if hasattr(value, 'content_type') and value.content_type:
            if value.content_type not in self.ALLOWED_MIME_TYPES:
                raise ValidationError(
                    _(f"Types de fichiers autorisés : PDF, DOC, DOCX.")
                )
