"""
Modèles du moteur IA interne.
"""

import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _


class MatchResult(models.Model):
    """Cache des scores de compatibilité candidat ↔ offre.

    Sert à la fois aux recommandations d'offres (côté candidat) et au
    classement des candidatures (côté recruteur). Les entrées sont
    invalidées automatiquement quand le profil, le CV ou l'offre changent
    (voir ``ai.signals``) et expirent après ``AI_ENGINE["MATCH_CACHE_TTL"]``.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(
        "users.CandidateProfile", on_delete=models.CASCADE, related_name="match_results"
    )
    job = models.ForeignKey("jobs.Job", on_delete=models.CASCADE, related_name="match_results")
    score = models.PositiveSmallIntegerField(verbose_name=_("Score de compatibilité"))
    details = models.JSONField(default=dict, blank=True, verbose_name=_("Détail du calcul"))
    computed_at = models.DateTimeField(auto_now=True, verbose_name=_("Calculé le"))

    class Meta:
        db_table = "resultat_matching"
        verbose_name = _("Résultat de matching")
        verbose_name_plural = _("Résultats de matching")
        ordering = ["-score"]
        constraints = [
            models.UniqueConstraint(fields=["candidate", "job"], name="unique_match_result"),
        ]
        indexes = [models.Index(fields=["job", "-score"])]

    def __str__(self):
        return f"{self.candidate} ↔ {self.job.titre} : {self.score}"
