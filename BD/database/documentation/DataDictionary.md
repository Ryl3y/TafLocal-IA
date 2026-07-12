# TafLocal AI - Data Dictionary

## Overview

Ce document fournit une description détaillée de toutes les tables, colonnes et types de données de la base de données TafLocal AI.

## Tables

### utilisateur

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique de l'utilisateur | NO | uuid_generate_v4() |
| nom | VARCHAR(100) | Nom de famille de l'utilisateur | NO | - |
| prenom | VARCHAR(100) | Prénom de l'utilisateur | NO | - |
| email | VARCHAR(255) | Adresse email unique de l'utilisateur | NO | - |
| mot_de_passe | VARCHAR(255) | Mot de passe hashé de l'utilisateur | NO | - |
| telephone | VARCHAR(20) | Numéro de téléphone de l'utilisateur | YES | - |
| date_inscription | TIMESTAMP WITH TIME ZONE | Date d'inscription de l'utilisateur | NO | CURRENT_TIMESTAMP |
| is_active | BOOLEAN | Indicateur d'activation du compte | NO | TRUE |
| role | user_role | Rôle de l'utilisateur (ADMIN, CANDIDATE, COMPANY) | NO | CANDIDATE |
| created_at | TIMESTAMP WITH TIME ZONE | Date de création de l'enregistrement | NO | CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP WITH TIME ZONE | Date de dernière mise à jour | NO | CURRENT_TIMESTAMP |

**Contraintes:**
- PRIMARY KEY: id
- UNIQUE: email
- CHECK: email format valide
- CHECK: mot_de_passe >= 8 caractères
- CHECK: telephone format valide
- CHECK: date_inscription <= CURRENT_TIMESTAMP

### chercheur_emploi

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique du candidat | NO | uuid_generate_v4() |
| user_id | UUID | Référence vers l'utilisateur associé | NO | - |
| date_naissance | DATE | Date de naissance du candidat | YES | - |
| genre | VARCHAR(20) | Genre du candidat | YES | - |
| adresse | TEXT | Adresse postale du candidat | YES | - |
| ville | VARCHAR(100) | Ville de résidence du candidat | YES | - |
| photo | TEXT | URL de la photo de profil du candidat | YES | - |
| biographie | TEXT | Biographie du candidat | YES | - |
| linkedin | TEXT | URL du profil LinkedIn du candidat | YES | - |
| github | TEXT | URL du profil GitHub du candidat | YES | - |
| portfolio | TEXT | URL du portfolio du candidat | YES | - |
| created_at | TIMESTAMP WITH TIME ZONE | Date de création | NO | CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP WITH TIME ZONE | Date de dernière mise à jour | NO | CURRENT_TIMESTAMP |

**Contraintes:**
- PRIMARY KEY: id
- FOREIGN KEY: user_id → utilisateur(id) ON DELETE CASCADE
- UNIQUE: user_id
- CHECK: date_naissance <= CURRENT_DATE
- CHECK: date_naissance <= (CURRENT_DATE - INTERVAL '16 years')
- CHECK: genre IN ('H', 'F', 'Autre', 'Non spécifié')

### entreprise

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique de l'entreprise | NO | uuid_generate_v4() |
| user_id | UUID | Référence vers l'utilisateur associé | NO | - |
| nom_entreprise | VARCHAR(255) | Nom de l'entreprise | NO | - |
| secteur | VARCHAR(100) | Secteur d'activité de l'entreprise | YES | - |
| description | TEXT | Description de l'entreprise | YES | - |
| site_web | TEXT | Site web de l'entreprise | YES | - |
| adresse | TEXT | Adresse postale de l'entreprise | YES | - |
| ville | VARCHAR(100) | Ville de l'entreprise | YES | - |
| telephone | VARCHAR(20) | Numéro de téléphone de l'entreprise | YES | - |
| logo | TEXT | URL du logo de l'entreprise | YES | - |
| verified | BOOLEAN | Indicateur de vérification de l'entreprise | NO | FALSE |
| created_at | TIMESTAMP WITH TIME ZONE | Date de création | NO | CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP WITH TIME ZONE | Date de dernière mise à jour | NO | CURRENT_TIMESTAMP |

**Contraintes:**
- PRIMARY KEY: id
- FOREIGN KEY: user_id → utilisateur(id) ON DELETE CASCADE
- UNIQUE: user_id
- CHECK: TRIM(nom_entreprise) != ''
- CHECK: site_web format valide

### cv

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique du CV | NO | uuid_generate_v4() |
| candidate_id | UUID | Référence vers le candidat propriétaire | NO | - |
| titre | VARCHAR(255) | Titre du CV | NO | - |
| fichier_pdf | TEXT | URL du fichier PDF du CV | NO | - |
| date_import | TIMESTAMP WITH TIME ZONE | Date d'import du CV | NO | CURRENT_TIMESTAMP |
| version | INTEGER | Version du CV | NO | 1 |
| is_default | BOOLEAN | Indicateur si c'est le CV par défaut | NO | FALSE |
| created_at | TIMESTAMP WITH TIME ZONE | Date de création | NO | CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP WITH TIME ZONE | Date de dernière mise à jour | NO | CURRENT_TIMESTAMP |

**Contraintes:**
- PRIMARY KEY: id
- FOREIGN KEY: candidate_id → chercheur_emploi(id) ON DELETE CASCADE
- CHECK: TRIM(titre) != ''
- CHECK: version >= 1
- CHECK: TRIM(fichier_pdf) != ''

### experience_professionnelle

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique de l'expérience | NO | uuid_generate_v4() |
| cv_id | UUID | Référence vers le CV associé | NO | - |
| poste | VARCHAR(255) | Poste occupé | NO | - |
| entreprise | VARCHAR(255) | Nom de l'entreprise | NO | - |
| description | TEXT | Description des responsabilités | YES | - |
| date_debut | DATE | Date de début de l'expérience | NO | - |
| date_fin | DATE | Date de fin de l'expérience | YES | - |

**Contraintes:**
- PRIMARY KEY: id
- FOREIGN KEY: cv_id → cv(id) ON DELETE CASCADE
- CHECK: date_fin >= date_debut OR date_fin IS NULL
- CHECK: TRIM(poste) != ''
- CHECK: TRIM(entreprise) != ''

### formation

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique de la formation | NO | uuid_generate_v4() |
| cv_id | UUID | Référence vers le CV associé | NO | - |
| diplome | VARCHAR(255) | Nom du diplôme obtenu | NO | - |
| etablissement | VARCHAR(255) | Nom de l'établissement | NO | - |
| description | TEXT | Description de la formation | YES | - |
| date_debut | DATE | Date de début de la formation | NO | - |
| date_fin | DATE | Date de fin de la formation | YES | - |

**Contraintes:**
- PRIMARY KEY: id
- FOREIGN KEY: cv_id → cv(id) ON DELETE CASCADE
- CHECK: date_fin >= date_debut OR date_fin IS NULL
- CHECK: TRIM(diplome) != ''
- CHECK: TRIM(etablissement) != ''

### competence

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique de la compétence | NO | uuid_generate_v4() |
| cv_id | UUID | Référence vers le CV associé | NO | - |
| nom | VARCHAR(100) | Nom de la compétence | NO | - |
| niveau | VARCHAR(50) | Niveau de maîtrise | NO | - |

**Contraintes:**
- PRIMARY KEY: id
- FOREIGN KEY: cv_id → cv(id) ON DELETE CASCADE
- CHECK: TRIM(nom) != ''
- CHECK: niveau IN ('Débutant', 'Intermédiaire', 'Avancé', 'Expert')

### analyse_cv

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique de l'analyse | NO | uuid_generate_v4() |
| cv_id | UUID | Référence vers le CV analysé | NO | - |
| date_analyse | TIMESTAMP WITH TIME ZONE | Date de l'analyse | NO | CURRENT_TIMESTAMP |
| score_global | DECIMAL(5,2) | Score global de l'employabilité (0-100) | YES | - |
| resume | TEXT | Résumé de l'analyse | YES | - |
| statut | analysis_status | Statut de l'analyse | NO | PENDING |
| created_at | TIMESTAMP WITH TIME ZONE | Date de création | NO | CURRENT_TIMESTAMP |

**Contraintes:**
- PRIMARY KEY: id
- FOREIGN KEY: cv_id → cv(id) ON DELETE CASCADE
- CHECK: score_global >= 0 AND score_global <= 100

### offre_emploi

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique de l'offre | NO | uuid_generate_v4() |
| entreprise_id | UUID | Référence vers l'entreprise publiatrice | NO | - |
| titre | VARCHAR(255) | Titre du poste | NO | - |
| description | TEXT | Description détaillée du poste | NO | - |
| localisation | VARCHAR(255) | Localisation du poste | YES | - |
| type_contrat | contract_type | Type de contrat | NO | - |
| salaire_min | DECIMAL(10,2) | Salaire minimum proposé | YES | - |
| salaire_max | DECIMAL(10,2) | Salaire maximum proposé | YES | - |
| devise | VARCHAR(10) | Devise du salaire | NO | XAF |
| experience_requise | INTEGER | Années d'expérience requises | YES | - |
| niveau_etude | VARCHAR(100) | Niveau d'études requis | YES | - |
| date_publication | TIMESTAMP WITH TIME ZONE | Date de publication de l'offre | NO | CURRENT_TIMESTAMP |
| date_expiration | TIMESTAMP WITH TIME ZONE | Date d'expiration de l'offre | YES | - |
| statut | job_status | Statut de l'offre | NO | DRAFT |
| created_at | TIMESTAMP WITH TIME ZONE | Date de création | NO | CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP WITH TIME ZONE | Date de dernière mise à jour | NO | CURRENT_TIMESTAMP |

**Contraintes:**
- PRIMARY KEY: id
- FOREIGN KEY: entreprise_id → entreprise(id) ON DELETE CASCADE
- CHECK: TRIM(titre) != ''
- CHECK: TRIM(description) != ''
- CHECK: salaire_max >= salaire_min OR salaire_max IS NULL OR salaire_min IS NULL
- CHECK: experience_requise >= 0 OR experience_requise IS NULL
- CHECK: date_expiration > date_publication OR date_expiration IS NULL
- CHECK: date_publication <= CURRENT_TIMESTAMP

### recommandation_offre

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique de la recommandation | NO | uuid_generate_v4() |
| analyse_cv_id | UUID | Référence vers l'analyse de CV | NO | - |
| offre_id | UUID | Référence vers l'offre recommandée | NO | - |
| score_compatibilite | DECIMAL(5,2) | Score de compatibilité (0-100) | NO | - |
| explication | TEXT | Explication de la recommandation | YES | - |
| date_recommandation | TIMESTAMP WITH TIME ZONE | Date de la recommandation | NO | CURRENT_TIMESTAMP |

**Contraintes:**
- PRIMARY KEY: id
- FOREIGN KEY: analyse_cv_id → analyse_cv(id) ON DELETE CASCADE
- FOREIGN KEY: offre_id → offre_emploi(id) ON DELETE CASCADE
- UNIQUE: (analyse_cv_id, offre_id)
- CHECK: score_compatibilite >= 0 AND score_compatibilite <= 100

### candidature

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique de la candidature | NO | uuid_generate_v4() |
| candidate_id | UUID | Référence vers le candidat | NO | - |
| offre_id | UUID | Référence vers l'offre d'emploi | NO | - |
| date_candidature | TIMESTAMP WITH TIME ZONE | Date de la candidature | NO | CURRENT_TIMESTAMP |
| statut | application_status | Statut de la candidature | NO | PENDING |
| commentaire | TEXT | Commentaire du candidat | YES | - |
| created_at | TIMESTAMP WITH TIME ZONE | Date de création | NO | CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP WITH TIME ZONE | Date de dernière mise à jour | NO | CURRENT_TIMESTAMP |

**Contraintes:**
- PRIMARY KEY: id
- FOREIGN KEY: candidate_id → chercheur_emploi(id) ON DELETE CASCADE
- FOREIGN KEY: offre_id → offre_emploi(id) ON DELETE CASCADE
- UNIQUE: (candidate_id, offre_id)
- CHECK: date_candidature <= CURRENT_TIMESTAMP

### lettre_motivation

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique de la lettre | NO | uuid_generate_v4() |
| candidature_id | UUID | Référence vers la candidature | NO | - |
| contenu | TEXT | Contenu de la lettre de motivation | NO | - |
| date_creation | TIMESTAMP WITH TIME ZONE | Date de création de la lettre | NO | CURRENT_TIMESTAMP |
| generated_by_ai | BOOLEAN | Indicateur si générée par IA | NO | FALSE |

**Contraintes:**
- PRIMARY KEY: id
- FOREIGN KEY: candidature_id → candidature(id) ON DELETE CASCADE
- UNIQUE: candidature_id
- CHECK: TRIM(contenu) != ''

### session_entretien

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique de la session | NO | uuid_generate_v4() |
| candidate_id | UUID | Référence vers le candidat | NO | - |
| offre_id | UUID | Référence vers l'offre d'emploi | YES | - |
| date_session | TIMESTAMP WITH TIME ZONE | Date de la session | YES | - |
| type_entretien | interview_type | Type d'entretien | NO | MIXED |
| duree | INTEGER | Durée en minutes | YES | - |
| score_global | DECIMAL(5,2) | Score global de la session | YES | - |
| statut | interview_status | Statut de la session | NO | SCHEDULED |
| created_at | TIMESTAMP WITH TIME ZONE | Date de création | NO | CURRENT_TIMESTAMP |

**Contraintes:**
- PRIMARY KEY: id
- FOREIGN KEY: candidate_id → chercheur_emploi(id) ON DELETE CASCADE
- FOREIGN KEY: offre_id → offre_emploi(id) ON DELETE SET NULL
- CHECK: duree > 0 OR duree IS NULL
- CHECK: date_session >= CURRENT_TIMESTAMP WHEN statut = 'SCHEDULED'
- CHECK: score_global >= 0 AND score_global <= 100

### question_entretien

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique de la question | NO | uuid_generate_v4() |
| session_id | UUID | Référence vers la session d'entretien | NO | - |
| question | TEXT | Texte de la question | NO | - |
| type_question | question_type | Type de question | NO | OPEN |
| reponse | TEXT | Réponse du candidat | YES | - |
| score | DECIMAL(5,2) | Score attribué à la réponse | YES | - |
| ordre | INTEGER | Ordre de la question dans la session | NO | - |

**Contraintes:**
- PRIMARY KEY: id
- FOREIGN KEY: session_id → session_entretien(id) ON DELETE CASCADE
- CHECK: TRIM(question) != ''
- CHECK: ordre >= 1
- CHECK: score >= 0 AND score <= 100 OR score IS NULL

### feedback_ia

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique du feedback | NO | uuid_generate_v4() |
| session_id | UUID | Référence vers la session d'entretien | NO | - |
| score_global | DECIMAL(5,2) | Score global du feedback | YES | - |
| points_forts | TEXT[] | Liste des points forts | YES | - |
| points_faibles | TEXT[] | Liste des points faibles | YES | - |
| conseils | TEXT[] | Liste des conseils d'amélioration | YES | - |
| date_feedback | TIMESTAMP WITH TIME ZONE | Date du feedback | NO | CURRENT_TIMESTAMP |

**Contraintes:**
- PRIMARY KEY: id
- FOREIGN KEY: session_id → session_entretien(id) ON DELETE CASCADE
- UNIQUE: session_id
- CHECK: score_global >= 0 AND score_global <= 100

### notification

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique de la notification | NO | uuid_generate_v4() |
| user_id | UUID | Référence vers l'utilisateur destinataire | NO | - |
| titre | VARCHAR(255) | Titre de la notification | NO | - |
| message | TEXT | Message de la notification | NO | - |
| type | notification_type | Type de notification | NO | SYSTEM |
| lu | BOOLEAN | Indicateur de lecture | NO | FALSE |
| date_envoi | TIMESTAMP WITH TIME ZONE | Date d'envoi de la notification | NO | CURRENT_TIMESTAMP |

**Contraintes:**
- PRIMARY KEY: id
- FOREIGN KEY: user_id → utilisateur(id) ON DELETE CASCADE
- CHECK: TRIM(titre) != ''
- CHECK: TRIM(message) != ''
- CHECK: date_envoi <= CURRENT_TIMESTAMP

### audit_log

| Colonne | Type | Description | Nullable | Default |
|---------|------|-------------|---------|---------|
| id | UUID | Identifiant unique du log | NO | uuid_generate_v4() |
| table_name | VARCHAR(100) | Nom de la table modifiée | NO | - |
| record_id | UUID | Identifiant de l'enregistrement | NO | - |
| action | VARCHAR(20) | Action effectuée (INSERT, UPDATE, DELETE) | NO | - |
| old_data | JSONB | Données avant modification | YES | - |
| new_data | JSONB | Données après modification | YES | - |
| changed_by | UUID | Utilisateur ayant effectué la modification | YES | - |
| changed_at | TIMESTAMP WITH TIME ZONE | Date de la modification | NO | CURRENT_TIMESTAMP |

**Contraintes:**
- PRIMARY KEY: id
- FOREIGN KEY: changed_by → utilisateur(id)

## Types Enum

### user_role
- ADMIN
- CANDIDATE
- COMPANY

### application_status
- PENDING
- UNDER_REVIEW
- SHORTLISTED
- REJECTED
- HIRED
- WITHDRAWN

### contract_type
- CDI
- CDD
- FREELANCE
- INTERNSHIP
- APPRENTICESHIP

### job_status
- DRAFT
- PUBLISHED
- CLOSED
- ARCHIVED
- EXPIRED

### analysis_status
- PENDING
- PROCESSING
- COMPLETED
- FAILED

### interview_type
- TECHNICAL
- BEHAVIORAL
- MIXED
- HR

### interview_status
- SCHEDULED
- IN_PROGRESS
- COMPLETED
- CANCELLED
- FAILED

### question_type
- OPEN
- MULTIPLE_CHOICE
- CODE
- BEHAVIORAL

### notification_type
- APPLICATION
- INTERVIEW
- JOB
- SYSTEM
- PROFILE
