"""
Vérification des entreprises par un administrateur (lutte contre les faux recruteurs).
"""

import logging
import re

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from .models import Company, VerificationStatus

logger = logging.getLogger(__name__)

# Format OHADA habituel : RC/DLA/2020/B/01234 ; nouveau format : CM-DLA-01-2020-B12-00123.
_RCCM_ALLOWED = re.compile(r"^[A-Z0-9][A-Z0-9/\-. ]{3,48}[A-Z0-9]$")


def normalize_rccm(value: str | None) -> str:
    """Majuscules, espaces uniformisés : « rc / dla/2020/b/1234 » -> « RC/DLA/2020/B/1234 »."""
    value = re.sub(r"\s*([/\-.])\s*", r"\1", (value or "").strip().upper())
    return re.sub(r"\s+", " ", value)


def rccm_error(value: str) -> str | None:
    """Message d'erreur si le numéro n'a pas une forme plausible, sinon None."""
    if not value:
        return "Le numéro de registre de commerce (RCCM) est obligatoire."
    if not _RCCM_ALLOWED.match(value) or sum(ch.isdigit() for ch in value) < 4:
        return "Numéro RCCM invalide. Exemple attendu : RC/DLA/2020/B/01234."
    return None


def rccm_document_error(file) -> str | None:
    """Le certificat doit être un vrai PDF (extension ET signature du fichier) de taille raisonnable."""
    if file is None:
        return "Joignez une copie de votre certificat RCCM (PDF)."
    max_size = getattr(settings, "RCCM_MAX_UPLOAD_SIZE", 5 * 1024 * 1024)
    if not (file.name or "").lower().endswith(".pdf"):
        return "Le certificat doit être un fichier PDF."
    if file.size > max_size:
        return f"Le certificat ne doit pas dépasser {max_size // (1024 * 1024)} Mo."
    position = file.tell() if hasattr(file, "tell") else 0
    file.seek(0)
    header = file.read(5)
    file.seek(position)
    if header != b"%PDF-":
        return "Ce fichier n'est pas un PDF valide."
    return None


def store_rccm_document(company: Company, file) -> None:
    """Enregistrer le certificat (à appeler avant save) en supprimant l'ancien fichier."""
    old_name = company.document_rccm.name if company.document_rccm else None
    company.document_rccm_nom = (file.name or "certificat.pdf")[-255:]
    company.document_rccm.save("certificat.pdf", file, save=False)
    if old_name and old_name != company.document_rccm.name:
        company.document_rccm.storage.delete(old_name)


def _inform(company: Company, titre: str, message: str) -> None:
    """Notification dans l'application + e-mail (un échec d'envoi ne bloque pas la décision)."""
    from notifications.models import NotificationType
    from notifications.services import NotificationService

    NotificationService.notify(company.user, NotificationType.PROFILE, titre, message)
    try:
        send_mail(
            subject=f"TafLocal AI – {titre}",
            message=f"Bonjour,\n\n{message}\n\n— L'équipe TafLocal AI",
            from_email=None,
            recipient_list=[company.user.email],
            fail_silently=False,
        )
    except Exception as exc:
        logger.error("E-mail de vérification non envoyé à %s : %s", company.user.email, exc)


@transaction.atomic
def approve(company: Company, admin) -> Company:
    company.statut_verification = VerificationStatus.APPROVED
    company.motif_rejet = ""
    company.verifie_par = admin
    company.verifie_le = timezone.now()
    company.save(update_fields=["statut_verification", "motif_rejet", "verifie_par", "verifie_le", "updated_at"])
    _inform(
        company,
        "Votre entreprise est validée",
        f"Le compte de « {company.nom_entreprise} » a été vérifié par notre équipe. "
        "Vous pouvez maintenant publier des offres et consulter les candidatures.",
    )
    return company


@transaction.atomic
def reject(company: Company, admin, motif: str) -> Company:
    company.statut_verification = VerificationStatus.REJECTED
    company.motif_rejet = motif.strip()
    company.verifie_par = admin
    company.verifie_le = timezone.now()
    company.save(update_fields=["statut_verification", "motif_rejet", "verifie_par", "verifie_le", "updated_at"])
    _inform(
        company,
        "Vérification de votre entreprise refusée",
        f"La vérification de « {company.nom_entreprise} » n'a pas abouti.\nMotif : {company.motif_rejet}\n\n"
        "Corrigez les informations (notamment le numéro RCCM) depuis votre espace : "
        "votre dossier repassera automatiquement en vérification.",
    )
    return company


def resubmit_if_needed(company: Company, rccm_changed: bool) -> None:
    """Après un rejet, toute correction renvoie le dossier en vérification ; un RCCM ou un
    certificat modifié sur un compte validé doit aussi être revérifié."""
    if company.statut_verification == VerificationStatus.REJECTED or (
        rccm_changed and company.statut_verification == VerificationStatus.APPROVED
    ):
        # Un RCCM modifié sur un compte validé doit aussi être revérifié.
        company.statut_verification = VerificationStatus.PENDING
        company.motif_rejet = ""
        company.verifie_par = None
        company.verifie_le = None
        company.save(update_fields=["statut_verification", "motif_rejet", "verifie_par", "verifie_le", "updated_at"])
