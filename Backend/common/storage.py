"""
Stockage des fichiers privés (documents justificatifs).

Contrairement à MEDIA_ROOT, ce dossier n'est jamais servi directement : les
fichiers ne sont lisibles qu'à travers une vue qui contrôle les droits.
"""

import os

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.utils.deconstruct import deconstructible


@deconstructible
class PrivateMediaStorage(FileSystemStorage):
    """FileSystemStorage sur PRIVATE_MEDIA_ROOT, sans URL publique.

    L'emplacement est relu à chaque accès (et non figé au chargement des modèles),
    ce qui permet aux tests de le rediriger vers un dossier temporaire.
    """

    def __init__(self, **kwargs):
        kwargs.setdefault("base_url", None)
        super().__init__(**kwargs)

    @property
    def base_location(self):
        return self._value_or_setting(self._location, settings.PRIVATE_MEDIA_ROOT)

    @property
    def location(self):
        return os.path.abspath(self.base_location)

    def url(self, name):
        raise NotImplementedError("Les fichiers privés n'ont pas d'URL publique.")


private_storage = PrivateMediaStorage()


def private_file_response(field_file, filename: str, *, inline: bool = False, content_type: str | None = None):
    """Servir un fichier privé après contrôle des droits par la vue appelante.

    En-têtes défensifs : pas de mise en cache, pas d'interprétation du contenu par le
    navigateur (nosniff) et aucune exécution de script si le fichier est ouvert (CSP sandbox).
    """
    import mimetypes

    from django.http import FileResponse, Http404

    if not field_file:
        raise Http404("Fichier introuvable.")
    try:
        handle = field_file.open("rb")
    except FileNotFoundError as exc:
        raise Http404("Fichier introuvable.") from exc
    content_type = content_type or mimetypes.guess_type(filename)[0] or "application/octet-stream"
    response = FileResponse(handle, content_type=content_type, as_attachment=not inline, filename=filename)
    response["Cache-Control"] = "private, no-store"
    response["X-Content-Type-Options"] = "nosniff"
    response["Content-Security-Policy"] = "sandbox; default-src 'none'"
    return response
