# Generated manually for Phase 1 (structure ORM — prérequis moteur IA natif)

import django.db.models.deletion
from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_alter_user_password"),
    ]

    operations = [
        migrations.CreateModel(
            name="Skill",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, editable=False, primary_key=True, serialize=False
                    ),
                ),
                ("nom", models.CharField(max_length=100, unique=True, verbose_name="Nom")),
                (
                    "categorie",
                    models.CharField(
                        blank=True, max_length=50, null=True, verbose_name="Catégorie"
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Créé le")),
            ],
            options={
                "verbose_name": "Compétence",
                "verbose_name_plural": "Compétences",
                "db_table": "competence_catalogue",
                "ordering": ["nom"],
            },
        ),
        migrations.CreateModel(
            name="WorkExperience",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, editable=False, primary_key=True, serialize=False
                    ),
                ),
                ("poste", models.CharField(max_length=255, verbose_name="Poste")),
                ("entreprise", models.CharField(max_length=255, verbose_name="Entreprise")),
                ("description", models.TextField(blank=True, null=True, verbose_name="Description")),
                ("date_debut", models.DateField(verbose_name="Date de début")),
                ("date_fin", models.DateField(blank=True, null=True, verbose_name="Date de fin")),
                ("en_cours", models.BooleanField(default=False, verbose_name="Poste actuel")),
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Créé le")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Mis à jour le")),
                (
                    "candidate",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="experiences",
                        to="users.candidateprofile",
                    ),
                ),
            ],
            options={
                "verbose_name": "Expérience professionnelle",
                "verbose_name_plural": "Expériences professionnelles",
                "db_table": "experience_professionnelle",
                "ordering": ["-date_debut"],
            },
        ),
        migrations.CreateModel(
            name="Education",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, editable=False, primary_key=True, serialize=False
                    ),
                ),
                ("diplome", models.CharField(max_length=255, verbose_name="Diplôme")),
                ("etablissement", models.CharField(max_length=255, verbose_name="Établissement")),
                ("description", models.TextField(blank=True, null=True, verbose_name="Description")),
                ("date_debut", models.DateField(blank=True, null=True, verbose_name="Date de début")),
                ("date_fin", models.DateField(blank=True, null=True, verbose_name="Date de fin")),
                ("en_cours", models.BooleanField(default=False, verbose_name="Formation en cours")),
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Créé le")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Mis à jour le")),
                (
                    "candidate",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="formations",
                        to="users.candidateprofile",
                    ),
                ),
            ],
            options={
                "verbose_name": "Formation",
                "verbose_name_plural": "Formations",
                "db_table": "formation",
                "ordering": ["-date_fin"],
            },
        ),
        migrations.CreateModel(
            name="CandidateSkill",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, editable=False, primary_key=True, serialize=False
                    ),
                ),
                (
                    "niveau",
                    models.CharField(
                        choices=[
                            ("DEBUTANT", "Débutant"),
                            ("INTERMEDIAIRE", "Intermédiaire"),
                            ("AVANCE", "Avancé"),
                            ("EXPERT", "Expert"),
                        ],
                        default="INTERMEDIAIRE",
                        max_length=20,
                        verbose_name="Niveau",
                    ),
                ),
                (
                    "annees_experience",
                    models.IntegerField(blank=True, null=True, verbose_name="Années d'expérience"),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Créé le")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Mis à jour le")),
                (
                    "candidate",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="competences",
                        to="users.candidateprofile",
                    ),
                ),
                (
                    "skill",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="candidats",
                        to="users.skill",
                    ),
                ),
            ],
            options={
                "verbose_name": "Compétence du candidat",
                "verbose_name_plural": "Compétences du candidat",
                "db_table": "candidat_competence",
                "ordering": ["-annees_experience"],
            },
        ),
        migrations.AddConstraint(
            model_name="candidateskill",
            constraint=models.UniqueConstraint(
                fields=("candidate", "skill"), name="unique_candidate_skill"
            ),
        ),
    ]
