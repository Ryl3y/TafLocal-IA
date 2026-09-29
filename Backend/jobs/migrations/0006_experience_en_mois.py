"""Expérience requise exprimée en mois (à partir de 3 mois) au lieu d'années entières."""

from django.db import migrations, models


def annees_vers_mois(apps, schema_editor):
    Job = apps.get_model("jobs", "Job")
    for job in Job.objects.exclude(experience_requise__isnull=True).only("pk", "experience_requise"):
        Job.objects.filter(pk=job.pk).update(experience_requise_mois=max(0, job.experience_requise) * 12)


def mois_vers_annees(apps, schema_editor):
    Job = apps.get_model("jobs", "Job")
    for job in Job.objects.exclude(experience_requise_mois__isnull=True).only("pk", "experience_requise_mois"):
        # Retour arrière : arrondi à l'année supérieure (3 mois -> 1 an).
        Job.objects.filter(pk=job.pk).update(experience_requise=-(-job.experience_requise_mois // 12))


class Migration(migrations.Migration):

    dependencies = [
        ("jobs", "0005_type_offre_stage"),
    ]

    operations = [
        migrations.AddField(
            model_name="job",
            name="experience_requise_mois",
            field=models.PositiveSmallIntegerField(blank=True, null=True, verbose_name="Expérience requise (mois)"),
        ),
        migrations.RunPython(annees_vers_mois, mois_vers_annees),
        migrations.RemoveField(model_name="job", name="experience_requise"),
    ]
