# TafLocal AI - Tables Documentation

## Overview

Ce document décrit toutes les tables de la base de données TafLocal AI, leur structure, leur but et leurs relations.

## Tables Principales

### 1. utilisateur

**Description**: Table centrale des utilisateurs du système. Chaque utilisateur peut être un administrateur, un candidat ou une entreprise.

**Clé Primaire**: id (UUID)

**Colonnes Principales**:
- id: Identifiant unique UUID
- nom, prenom: Informations personnelles
- email: Email unique (login)
- mot_de_passe: Mot de passe hashé
- role: Rôle (ADMIN, CANDIDATE, COMPANY)
- is_active: Statut d'activation du compte

**Relations**:
- 1:1 avec chercheur_emploi (si role = CANDIDATE)
- 1:1 avec entreprise (si role = COMPANY)
- 1:N avec notification

**Utilisation**: Authentification et gestion des comptes utilisateurs.

---

### 2. chercheur_emploi

**Description**: Profil des chercheurs d'emploi (candidats). Chaque candidat est lié à un utilisateur.

**Clé Primaire**: id (UUID)

**Clé Étrangère**: user_id → utilisateur(id)

**Colonnes Principales**:
- id: Identifiant unique UUID
- user_id: Référence vers l'utilisateur
- date_naissance, genre: Informations démographiques
- adresse, ville: Localisation
- biographie: Description du profil
- linkedin, github, portfolio: Liens vers les profils professionnels

**Relations**:
- N:1 avec utilisateur
- 1:N avec cv
- 1:N avec candidature
- 1:N avec session_entretien

**Utilisation**: Gestion des profils de candidats.

---

### 3. entreprise

**Description**: Profil des entreprises recruteuses. Chaque entreprise est liée à un utilisateur.

**Clé Primaire**: id (UUID)

**Clé Étrangère**: user_id → utilisateur(id)

**Colonnes Principales**:
- id: Identifiant unique UUID
- user_id: Référence vers l'utilisateur
- nom_entreprise: Nom de l'entreprise
- secteur: Secteur d'activité
- description: Description de l'entreprise
- site_web, logo: Informations web
- verified: Indicateur de vérification

**Relations**:
- N:1 avec utilisateur
- 1:N avec offre_emploi

**Utilisation**: Gestion des profils d'entreprises.

---

### 4. cv

**Description**: CVs des candidats. Un candidat peut avoir plusieurs CVs.

**Clé Primaire**: id (UUID)

**Clé Étrangère**: candidate_id → chercheur_emploi(id)

**Colonnes Principales**:
- id: Identifiant unique UUID
- candidate_id: Référence vers le candidat
- titre: Titre du CV
- fichier_pdf: URL du fichier PDF
- version: Numéro de version
- is_default: CV par défaut

**Relations**:
- N:1 avec chercheur_emploi
- 1:N avec experience_professionnelle
- 1:N avec formation
- 1:N avec competence
- 1:N avec analyse_cv

**Utilisation**: Stockage et gestion des CVs.

---

### 5. experience_professionnelle

**Description**: Expériences professionnelles incluses dans un CV.

**Clé Primaire**: id (UUID)

**Clé Étrangère**: cv_id → cv(id)

**Colonnes Principales**:
- id: Identifiant unique UUID
- cv_id: Référence vers le CV
- poste: Titre du poste
- entreprise: Nom de l'entreprise
- description: Description des responsabilités
- date_debut, date_fin: Période de l'expérience

**Relations**:
- N:1 avec cv

**Utilisation**: Historique professionnel des candidats.

---

### 6. formation

**Description**: Formations académiques incluses dans un CV.

**Clé Primaire**: id (UUID)

**Clé Étrangère**: cv_id → cv(id)

**Colonnes Principales**:
- id: Identifiant unique UUID
- cv_id: Référence vers le CV
- diplome: Nom du diplôme
- etablissement: Nom de l'établissement
- description: Description de la formation
- date_debut, date_fin: Période de la formation

**Relations**:
- N:1 avec cv

**Utilisation**: Historique éducatif des candidats.

---

### 7. competence

**Description**: Compétences et niveaux de maîtrise inclus dans un CV.

**Clé Primaire**: id (UUID)

**Clé Étrangère**: cv_id → cv(id)

**Colonnes Principales**:
- id: Identifiant unique UUID
- cv_id: Référence vers le CV
- nom: Nom de la compétence
- niveau: Niveau (Débutant, Intermédiaire, Avancé, Expert)

**Relations**:
- N:1 avec cv

**Utilisation**: Inventaire des compétences des candidats.

---

### 8. analyse_cv

**Description**: Analyses de CV effectuées par l'IA.

**Clé Primaire**: id (UUID)

**Clé Étrangère**: cv_id → cv(id)

**Colonnes Principales**:
- id: Identifiant unique UUID
- cv_id: Référence vers le CV analysé
- date_analyse: Date de l'analyse
- score_global: Score d'employabilité (0-100)
- resume: Résumé de l'analyse
- statut: Statut de l'analyse

**Relations**:
- N:1 avec cv
- 1:N avec recommandation_offre

**Utilisation**: Stockage des analyses IA de CV.

---

### 9. offre_emploi

**Description**: Offres d'emploi publiées par les entreprises.

**Clé Primaire**: id (UUID)

**Clé Étrangère**: entreprise_id → entreprise(id)

**Colonnes Principales**:
- id: Identifiant unique UUID
- entreprise_id: Référence vers l'entreprise
- titre: Titre du poste
- description: Description du poste
- localisation: Lieu de travail
- type_contrat: Type de contrat
- salaire_min, salaire_max: Fourchette salariale
- experience_requise: Années d'expérience requises
- niveau_etude: Niveau d'études requis
- date_publication, date_expiration: Dates de validité
- statut: Statut de l'offre

**Relations**:
- N:1 avec entreprise
- 1:N avec candidature
- 1:N avec recommandation_offre
- 1:N avec session_entretien

**Utilisation**: Gestion des offres d'emploi.

---

### 10. recommandation_offre

**Description**: Recommandations d'emploi générées par l'IA basées sur les analyses de CV.

**Clé Primaire**: id (UUID)

**Clés Étrangères**:
- analyse_cv_id → analyse_cv(id)
- offre_id → offre_emploi(id)

**Colonnes Principales**:
- id: Identifiant unique UUID
- analyse_cv_id: Référence vers l'analyse de CV
- offre_id: Référence vers l'offre recommandée
- score_compatibilite: Score de compatibilité (0-100)
- explication: Explication de la recommandation
- date_recommandation: Date de la recommandation

**Relations**:
- N:1 avec analyse_cv
- N:1 avec offre_emploi

**Utilisation**: Stockage des recommandations IA.

---

### 11. candidature

**Description**: Candidatures des candidats aux offres d'emploi.

**Clé Primaire**: id (UUID)

**Clés Étrangères**:
- candidate_id → chercheur_emploi(id)
- offre_id → offre_emploi(id)

**Colonnes Principales**:
- id: Identifiant unique UUID
- candidate_id: Référence vers le candidat
- offre_id: Référence vers l'offre
- date_candidature: Date de la candidature
- statut: Statut de la candidature
- commentaire: Commentaire du candidat

**Relations**:
- N:1 avec chercheur_emploi
- N:1 avec offre_emploi
- 1:1 avec lettre_motivation

**Utilisation**: Suivi des candidatures.

---

### 12. lettre_motivation

**Description**: Lettres de motivation associées aux candidatures.

**Clé Primaire**: id (UUID)

**Clé Étrangère**: candidature_id → candidature(id)

**Colonnes Principales**:
- id: Identifiant unique UUID
- candidature_id: Référence vers la candidature
- contenu: Contenu de la lettre
- date_creation: Date de création
- generated_by_ai: Indicateur de génération par IA

**Relations**:
- N:1 avec candidature

**Utilisation**: Stockage des lettres de motivation.

---

### 13. session_entretien

**Description**: Sessions d'entretien simulé par IA.

**Clé Primaire**: id (UUID)

**Clés Étrangères**:
- candidate_id → chercheur_emploi(id)
- offre_id → offre_emploi(id)

**Colonnes Principales**:
- id: Identifiant unique UUID
- candidate_id: Référence vers le candidat
- offre_id: Référence vers l'offre (optionnel)
- date_session: Date de la session
- type_entretien: Type d'entretien
- duree: Durée en minutes
- score_global: Score global de la session
- statut: Statut de la session

**Relations**:
- N:1 avec chercheur_emploi
- N:1 avec offre_emploi
- 1:N avec question_entretien
- 1:1 avec feedback_ia

**Utilisation**: Gestion des sessions d'entretien.

---

### 14. question_entretien

**Description**: Questions posées lors des sessions d'entretien.

**Clé Primaire**: id (UUID)

**Clé Étrangère**: session_id → session_entretien(id)

**Colonnes Principales**:
- id: Identifiant unique UUID
- session_id: Référence vers la session
- question: Texte de la question
- type_question: Type de question
- reponse: Réponse du candidat
- score: Score attribué
- ordre: Ordre dans la session

**Relations**:
- N:1 avec session_entretien

**Utilisation**: Stockage des questions et réponses d'entretien.

---

### 15. feedback_ia

**Description**: Feedback IA généré après une session d'entretien.

**Clé Primaire**: id (UUID)

**Clé Étrangère**: session_id → session_entretien(id)

**Colonnes Principales**:
- id: Identifiant unique UUID
- session_id: Référence vers la session
- score_global: Score global du feedback
- points_forts: Liste des points forts
- points_faibles: Liste des points faibles
- conseils: Liste des conseils
- date_feedback: Date du feedback

**Relations**:
- N:1 avec session_entretien

**Utilisation**: Stockage des feedbacks IA.

---

### 16. notification

**Description**: Notifications envoyées aux utilisateurs.

**Clé Primaire**: id (UUID)

**Clé Étrangère**: user_id → utilisateur(id)

**Colonnes Principales**:
- id: Identifiant unique UUID
- user_id: Référence vers l'utilisateur
- titre: Titre de la notification
- message: Message de la notification
- type: Type de notification
- lu: Indicateur de lecture
- date_envoi: Date d'envoi

**Relations**:
- N:1 avec utilisateur

**Utilisation**: Gestion des notifications utilisateurs.

---

### 17. audit_log

**Description**: Journal d'audit pour les modifications critiques.

**Clé Primaire**: id (UUID)

**Clé Étrangère**: changed_by → utilisateur(id)

**Colonnes Principales**:
- id: Identifiant unique UUID
- table_name: Nom de la table modifiée
- record_id: Identifiant de l'enregistrement
- action: Action (INSERT, UPDATE, DELETE)
- old_data: Données avant modification
- new_data: Données après modification
- changed_by: Utilisateur ayant effectué la modification
- changed_at: Date de la modification

**Relations**:
- N:1 avec utilisateur

**Utilisation**: Audit et traçabilité des modifications.

---

## Résumé des Tables

| Table | Enregistrements | Description |
|-------|----------------|-------------|
| utilisateur | 75 | Utilisateurs du système |
| chercheur_emploi | 50 | Profils de candidats |
| entreprise | 20 | Profils d'entreprises |
| cv | 80 | CVs des candidats |
| experience_professionnelle | - | Expériences professionnelles |
| formation | - | Formations académiques |
| competence | - | Compétences |
| analyse_cv | 80 | Analyses de CV par IA |
| offre_emploi | 120 | Offres d'emploi |
| recommandation_offre | 250 | Recommandations IA |
| candidature | 250 | Candidatures |
| lettre_motivation | - | Lettres de motivation |
| session_entretien | 40 | Sessions d'entretien |
| question_entretien | 200 | Questions d'entretien |
| feedback_ia | 40 | Feedbacks IA |
| notification | 300 | Notifications |
| audit_log | - | Journal d'audit |

## Notes d'Architecture

- **Normalisation**: La base de données est normalisée à 3NF pour éviter la redondance.
- **UUID**: Tous les identifiants utilisent des UUID pour la distributivité.
- **Timestamps**: Tous les timestamps sont en UTC avec timezone.
- **Soft Delete**: Les enregistrements critiques utilisent des flags (is_active, statut) au lieu de suppression physique.
- **Audit**: Les modifications critiques sont journalisées dans audit_log.
