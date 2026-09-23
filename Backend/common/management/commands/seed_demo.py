"""
Créer un jeu de données de démonstration.

    python manage.py seed_demo                  # mot de passe généré et affiché
    python manage.py seed_demo --password XXXX  # mot de passe choisi

Remplace les anciens scripts (create_superuser.py, create_test_user.py...)
qui contenaient des mots de passe en clair.
"""

import secrets
from datetime import date

from django.core.management.base import BaseCommand
from django.db import transaction

from ai.services import SkillService
from companies.models import Company
from jobs.models import ContractType, Job, JobStatus
from users.models import CandidateProfile, CandidateSkill, Education, SkillLevel, User, UserRole, WorkExperience

JOBS = [
    {
        "titre": "Développeur Backend Python / Django",
        "description": "Vous concevrez des API REST performantes pour nos applications de paiement mobile. "
                       "Vous travaillerez en méthode agile avec l'équipe produit.",
        "exigences": "Maîtrise de Python, Django et PostgreSQL. Docker et Git indispensables.",
        "competences": ["Python", "Django", "PostgreSQL", "API REST", "Docker", "Git"],
        "localisation": "Douala",
        "type_contrat": ContractType.CDI,
        "experience_requise": 3,
        "niveau_etude": "Bac+5",
        "salaire_min": 450000,
        "salaire_max": 750000,
    },
    {
        "titre": "Développeur Frontend React",
        "description": "Intégration d'interfaces web modernes et accessibles en React et TypeScript.",
        "exigences": "React, TypeScript, HTML/CSS. Une expérience avec Tailwind est un plus.",
        "competences": ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Git"],
        "localisation": "Yaoundé",
        "type_contrat": ContractType.CDD,
        "experience_requise": 2,
        "niveau_etude": "Bac+3",
        "salaire_min": 350000,
        "salaire_max": 550000,
    },
    {
        "titre": "Comptable confirmé(e)",
        "description": "Tenue de la comptabilité générale selon le référentiel OHADA, déclarations fiscales "
                       "et préparation des états financiers.",
        "exigences": "Maîtrise de Sage et d'Excel, connaissance de la fiscalité camerounaise.",
        "competences": ["Comptabilité", "Fiscalité", "Sage", "Microsoft Excel"],
        "localisation": "Douala",
        "type_contrat": ContractType.CDI,
        "experience_requise": 4,
        "niveau_etude": "Bac+3",
        "salaire_min": 300000,
        "salaire_max": 500000,
    },
    {
        "titre": "Data Analyst (télétravail)",
        "description": "Analyse des données clients, création de tableaux de bord Power BI et recommandations.",
        "exigences": "SQL, Power BI, Python apprécié.",
        "competences": ["SQL", "Power BI", "Data Analysis", "Python", "Microsoft Excel"],
        "localisation": "Télétravail",
        "type_contrat": ContractType.FREELANCE,
        "experience_requise": 1,
        "niveau_etude": "Bac+3",
        "salaire_min": 250000,
        "salaire_max": 450000,
    },
]


class Command(BaseCommand):
    help = "Crée des comptes et des offres de démonstration pour TafLocal IA."

    def add_arguments(self, parser):
        parser.add_argument("--password", help="Mot de passe commun des comptes de démonstration.")

    @transaction.atomic
    def handle(self, *args, **options):
        password = options.get("password") or secrets.token_urlsafe(10)

        admin = self._user("admin@taflocal.demo", "Admin", "TafLocal", UserRole.ADMIN, password,
                           is_staff=True, is_superuser=True)
        company_user = self._user("recrutement@taflocal.demo", "Ngono", "Carine", UserRole.COMPANY, password)
        company, _ = Company.objects.get_or_create(
            user=company_user,
            defaults={"nom_entreprise": "Tech Cameroun SARL", "secteur": "Technologies", "ville": "Douala",
                      "description": "Éditeur de solutions numériques pour l'Afrique centrale.", "verified": True},
        )

        for data in JOBS:
            data = dict(data)
            skills = data.pop("competences")
            job, created = Job.objects.get_or_create(
                entreprise=company, titre=data["titre"], defaults={**data, "statut": JobStatus.PUBLISHED}
            )
            if created:
                SkillService.set_job_skills(job, skills)

        candidate_user = self._user("candidat@taflocal.demo", "Mballa", "Jean", UserRole.CANDIDATE, password)
        candidate, _ = CandidateProfile.objects.get_or_create(user=candidate_user)
        candidate.ville = "Douala"
        candidate.biographie = "Développeur backend passionné par les API et l'automatisation."
        candidate.save()
        for name, level, years in [("Python", SkillLevel.AVANCE, 4), ("Django", SkillLevel.AVANCE, 3),
                                   ("PostgreSQL", SkillLevel.INTERMEDIAIRE, 3), ("Git", SkillLevel.AVANCE, 4),
                                   ("JavaScript", SkillLevel.INTERMEDIAIRE, 2)]:
            skill = SkillService.get_or_create(name)
            CandidateSkill.objects.get_or_create(candidate=candidate, skill=skill,
                                                 defaults={"niveau": level, "annees_experience": years})
        WorkExperience.objects.get_or_create(
            candidate=candidate, poste="Développeur backend", entreprise="MTN Cameroon",
            defaults={"date_debut": date(2021, 3, 1), "en_cours": True,
                      "description": "Développement d'API REST Django pour le paiement mobile."},
        )
        Education.objects.get_or_create(
            candidate=candidate, diplome="Master en génie logiciel", etablissement="Université de Douala",
            defaults={"date_debut": date(2018, 9, 1), "date_fin": date(2020, 7, 31)},
        )

        self.stdout.write(self.style.SUCCESS("Données de démonstration créées."))
        self.stdout.write(f"  Admin      : {admin.email}")
        self.stdout.write(f"  Entreprise : {company_user.email}")
        self.stdout.write(f"  Candidat   : {candidate_user.email}")
        self.stdout.write(f"  Mot de passe (tous les comptes) : {password}")

    def _user(self, email, nom, prenom, role, password, **extra):
        user = User.objects.filter(email=email).first()
        if user is None:
            user = User.objects.create_user(email=email, password=password, nom=nom, prenom=prenom,
                                            role=role, **extra)
        else:
            user.set_password(password)
            user.save(update_fields=["password"])
        return user
