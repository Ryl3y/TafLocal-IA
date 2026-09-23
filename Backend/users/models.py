"""
Modèles utilisateur pour TafLocal AI.
"""

import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class PasswordField(models.CharField):
    """Champ personnalisé pour mapper password Django vers mot_de_passe PostgreSQL."""
    def __init__(self, *args, **kwargs):
        kwargs['db_column'] = 'mot_de_passe'
        super().__init__(*args, **kwargs)


class UserManager(BaseUserManager):
    """Gestionnaire personnalisé pour le modèle User."""

    def create_user(self, email, password=None, **extra_fields):
        """Crée et sauvegarde un utilisateur avec l'email et le mot de passe donnés."""
        if not email:
            raise ValueError("L'email doit être défini")
        extra_fields.setdefault('username', email)
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Crée et sauvegarde un superutilisateur."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.ADMIN)
        extra_fields.setdefault('nom', 'Admin')
        extra_fields.setdefault('prenom', 'System')

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Le superutilisateur doit avoir is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Le superutilisateur doit avoir is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class UserRole(models.TextChoices):
    """Énumération des rôles utilisateur."""
    ADMIN = "ADMIN", _("Administrateur")
    CANDIDATE = "CANDIDATE", _("Candidat")
    COMPANY = "COMPANY", _("Entreprise")


class User(AbstractBaseUser, PermissionsMixin):
    """Modèle utilisateur personnalisé."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=100, verbose_name=_("Nom"))
    prenom = models.CharField(max_length=100, verbose_name=_("Prénom"))
    email = models.EmailField(unique=True, verbose_name=_("Email"))
    telephone = models.CharField(max_length=20, blank=True, null=True, verbose_name=_("Téléphone"))
    date_inscription = models.DateTimeField(default=timezone.now, verbose_name=_("Date d'inscription"))
    is_active = models.BooleanField(default=True, verbose_name=_("Actif"))
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CANDIDATE,
        verbose_name=_("Rôle")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Créé le"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Mis à jour le"))
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name=_('Groupes'),
        blank=True,
        related_name="utilisateur_set",
        related_query_name="utilisateur",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name=_('Permissions utilisateur'),
        blank=True,
        related_name="utilisateur_set",
        related_query_name="utilisateur",
    )
    # Champ username pour compatibilité avec SimpleJWT
    username = models.CharField(
        max_length=150,
        unique=True,
        blank=True,
        null=True,
        help_text=_("Username (optionnel)"),
        validators=[],
        error_messages={
            'unique': _("Ce username existe déjà."),
        },
        verbose_name=_("Username")
    )
    # Champs de compatibilité avec AbstractBaseUser
    is_staff = models.BooleanField(default=False, verbose_name=_("Membre du personnel"))
    date_joined = models.DateTimeField(default=timezone.now, verbose_name=_("Date d'inscription"))
    # Remplacer le champ password hérité avec le mapping correct
    password = PasswordField(max_length=128)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nom", "prenom"]
    objects = UserManager()

    class Meta:
        db_table = "utilisateur"
        verbose_name = _("Utilisateur")
        verbose_name_plural = _("Utilisateurs")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.email}"

    @property
    def is_admin(self):
        """Vérifie si l'utilisateur est un administrateur."""
        return self.role == UserRole.ADMIN

    @property
    def is_candidate(self):
        """Vérifie si l'utilisateur est un candidat."""
        return self.role == UserRole.CANDIDATE

    @property
    def is_company(self):
        """Vérifie si l'utilisateur est une entreprise."""
        return self.role == UserRole.COMPANY


class CandidateProfile(models.Model):
    """Profil pour les utilisateurs candidats."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="candidate_profile")
    date_naissance = models.DateField(blank=True, null=True, verbose_name=_("Date de naissance"))
    genre = models.CharField(max_length=20, blank=True, null=True, verbose_name=_("Genre"))
    adresse = models.TextField(blank=True, null=True, verbose_name=_("Adresse"))
    ville = models.CharField(max_length=100, blank=True, null=True, verbose_name=_("Ville"))
    photo = models.TextField(blank=True, null=True, verbose_name=_("Photo"))
    biographie = models.TextField(blank=True, null=True, verbose_name=_("Biographie"))
    linkedin = models.TextField(blank=True, null=True, verbose_name=_("LinkedIn"))
    github = models.TextField(blank=True, null=True, verbose_name=_("GitHub"))
    portfolio = models.TextField(blank=True, null=True, verbose_name=_("Portfolio"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Créé le"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Mis à jour le"))

    class Meta:
        db_table = "chercheur_emploi"
        verbose_name = _("Chercheur d'emploi")
        verbose_name_plural = _("Chercheurs d'emploi")
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user"], name="unique_candidate_user")
        ]

    def __str__(self):
        return f"{self.user.prenom} {self.user.nom}"

    @property
    def experience_annees(self):
        """Somme (en années) de la durée de toutes les expériences professionnelles.

        Sert de source fiable pour le moteur de matching natif (Phase 2), en
        remplacement du champ inexistant `candidate.experience_years` utilisé
        par l'ancien module ai/services.py (Gemini).
        """
        total_mois = sum(exp.duree_mois for exp in self.experiences.all())
        return round(total_mois / 12, 1)


def get_candidate_profile(user):
    """Retourner le profil candidat de l'utilisateur, en le créant au besoin."""
    try:
        return user.candidate_profile
    except CandidateProfile.DoesNotExist:
        profile, _ = CandidateProfile.objects.get_or_create(user=user)
        return profile


class Skill(models.Model):
    """Catalogue global des compétences (normalisé, partagé entre candidats et offres)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=100, unique=True, verbose_name=_("Nom"))
    categorie = models.CharField(max_length=50, blank=True, null=True, verbose_name=_("Catégorie"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Créé le"))

    class Meta:
        db_table = "competence_catalogue"
        verbose_name = _("Compétence")
        verbose_name_plural = _("Compétences")
        ordering = ["nom"]

    def __str__(self):
        return self.nom


class SkillLevel(models.TextChoices):
    """Niveaux de maîtrise d'une compétence."""
    DEBUTANT = "DEBUTANT", _("Débutant")
    INTERMEDIAIRE = "INTERMEDIAIRE", _("Intermédiaire")
    AVANCE = "AVANCE", _("Avancé")
    EXPERT = "EXPERT", _("Expert")


class CandidateSkill(models.Model):
    """Association candidat ↔ compétence, avec niveau et expérience."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(
        CandidateProfile, on_delete=models.CASCADE, related_name="competences"
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="candidats")
    niveau = models.CharField(
        max_length=20, choices=SkillLevel.choices, default=SkillLevel.INTERMEDIAIRE,
        verbose_name=_("Niveau")
    )
    annees_experience = models.IntegerField(blank=True, null=True, verbose_name=_("Années d'expérience"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Créé le"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Mis à jour le"))

    class Meta:
        db_table = "candidat_competence"
        verbose_name = _("Compétence du candidat")
        verbose_name_plural = _("Compétences du candidat")
        ordering = ["-annees_experience"]
        constraints = [
            models.UniqueConstraint(fields=["candidate", "skill"], name="unique_candidate_skill")
        ]

    def __str__(self):
        return f"{self.candidate} - {self.skill} ({self.niveau})"


class WorkExperience(models.Model):
    """Expérience professionnelle d'un candidat."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(
        CandidateProfile, on_delete=models.CASCADE, related_name="experiences"
    )
    poste = models.CharField(max_length=255, verbose_name=_("Poste"))
    entreprise = models.CharField(max_length=255, verbose_name=_("Entreprise"))
    description = models.TextField(blank=True, null=True, verbose_name=_("Description"))
    date_debut = models.DateField(verbose_name=_("Date de début"))
    date_fin = models.DateField(blank=True, null=True, verbose_name=_("Date de fin"))
    en_cours = models.BooleanField(default=False, verbose_name=_("Poste actuel"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Créé le"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Mis à jour le"))

    class Meta:
        db_table = "experience_professionnelle"
        verbose_name = _("Expérience professionnelle")
        verbose_name_plural = _("Expériences professionnelles")
        ordering = ["-date_debut"]

    def __str__(self):
        return f"{self.poste} chez {self.entreprise}"

    @property
    def duree_mois(self):
        """Durée de l'expérience en mois (jusqu'à aujourd'hui si en cours)."""
        fin = self.date_fin if (self.date_fin and not self.en_cours) else timezone.now().date()
        return max(0, (fin.year - self.date_debut.year) * 12 + (fin.month - self.date_debut.month))


class Education(models.Model):
    """Formation académique d'un candidat."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(
        CandidateProfile, on_delete=models.CASCADE, related_name="formations"
    )
    diplome = models.CharField(max_length=255, verbose_name=_("Diplôme"))
    etablissement = models.CharField(max_length=255, verbose_name=_("Établissement"))
    description = models.TextField(blank=True, null=True, verbose_name=_("Description"))
    date_debut = models.DateField(blank=True, null=True, verbose_name=_("Date de début"))
    date_fin = models.DateField(blank=True, null=True, verbose_name=_("Date de fin"))
    en_cours = models.BooleanField(default=False, verbose_name=_("Formation en cours"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Créé le"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Mis à jour le"))

    class Meta:
        db_table = "formation"
        verbose_name = _("Formation")
        verbose_name_plural = _("Formations")
        ordering = ["-date_fin"]

    def __str__(self):
        return f"{self.diplome} - {self.etablissement}"
