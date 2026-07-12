# TafLocal AI - Entity Relationship Diagram (ERD)

## Overview

Ce document présente le diagramme entité-relation (ERD) de la base de données TafLocal IA, décrivant toutes les tables, leurs relations et leurs cardinalités.

## Diagramme ERD

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              utilisateur                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK id (UUID)                                                                │
│    nom (VARCHAR(100))                                                       │
│    prenom (VARCHAR(100))                                                    │
│    email (VARCHAR(255)) UNIQUE                                              │
│    mot_de_passe (VARCHAR(255))                                              │
│    telephone (VARCHAR(20))                                                  │
│    date_inscription (TIMESTAMP)                                             │
│    is_active (BOOLEAN)                                                      │
│    role (ENUM: ADMIN, CANDIDATE, COMPANY)                                  │
│    created_at (TIMESTAMP)                                                   │
│    updated_at (TIMESTAMP)                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    │ 1:1                           │ 1:N
                    │                               │
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│      chercheur_emploi         │   │        notification           │
├───────────────────────────────┤   ├───────────────────────────────┤
│ PK id (UUID)                 │   │ PK id (UUID)                 │
│ FK user_id → utilisateur     │   │ FK user_id → utilisateur     │
│    date_naissance (DATE)      │   │    titre (VARCHAR(255))       │
│    genre (VARCHAR(20))        │   │    message (TEXT)             │
│    adresse (TEXT)             │   │    type (ENUM)                │
│    ville (VARCHAR(100))       │   │    lu (BOOLEAN)               │
│    biographie (TEXT)          │   │    date_envoi (TIMESTAMP)     │
│    linkedin (TEXT)            │   └───────────────────────────────┘
│    github (TEXT)              │
│    portfolio (TEXT)           │
│    created_at (TIMESTAMP)     │
│    updated_at (TIMESTAMP)     │
└───────────────────────────────┘
            │
            │ 1:N
            │
            ├──────────────────────────────────────────────────────────────┐
            │                                                              │
            │ 1:N                                                          │ 1:N
            │                                                              │
            ▼                                                              ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│             cv                │   │        candidature            │
├───────────────────────────────┤   ├───────────────────────────────┤
│ PK id (UUID)                 │   │ PK id (UUID)                 │
│ FK candidate_id → chercheur   │   │ FK candidate_id → chercheur   │
│    titre (VARCHAR(255))       │   │ FK offre_id → offre_emploi   │
│    fichier_pdf (TEXT)         │   │    date_candidature (TIMESTAMP)│
│    date_import (TIMESTAMP)    │   │    statut (ENUM)              │
│    version (INTEGER)          │   │    commentaire (TEXT)         │
│    is_default (BOOLEAN)       │   │    created_at (TIMESTAMP)     │
│    created_at (TIMESTAMP)     │   │    updated_at (TIMESTAMP)     │
│    updated_at (TIMESTAMP)     │   └───────────────────────────────┘
└───────────────────────────────┘                  │
            │                                         │ 1:0..1
            │ 1:N                                     │
            ├─────────────────────────────────────────┘
            │
            ├──────────────────────────────────────────────────────────────┐
            │                                                              │
            │ 1:N                          1:N                             │ 1:N
            │                                                              │
            ▼                                                              ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│  experience_professionnelle   │   │         formation              │
├───────────────────────────────┤   ├───────────────────────────────┤
│ PK id (UUID)                 │   │ PK id (UUID)                 │
│ FK cv_id → cv                │   │ FK cv_id → cv                │
│    poste (VARCHAR(255))       │   │    diplome (VARCHAR(255))     │
│    entreprise (VARCHAR(255))   │   │    etablissement (VARCHAR(255))│
│    description (TEXT)         │   │    description (TEXT)         │
│    date_debut (DATE)          │   │    date_debut (DATE)          │
│    date_fin (DATE)            │   │    date_fin (DATE)            │
└───────────────────────────────┘   └───────────────────────────────┘
            │
            │ 1:N
            │
            ▼
┌───────────────────────────────┐
│        competence             │
├───────────────────────────────┤
│ PK id (UUID)                 │
│ FK cv_id → cv                │
│    nom (VARCHAR(100))         │
│    niveau (ENUM)              │
└───────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              entreprise                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK id (UUID)                                                                │
│ FK user_id → utilisateur                                                  │
│    nom_entreprise (VARCHAR(255))                                           │
│    secteur (VARCHAR(100))                                                  │
│    description (TEXT)                                                       │
│    site_web (TEXT)                                                         │
│    adresse (TEXT)                                                          │
│    ville (VARCHAR(100))                                                    │
│    telephone (VARCHAR(20))                                                 │
│    logo (TEXT)                                                             │
│    verified (BOOLEAN)                                                      │
│    created_at (TIMESTAMP)                                                   │
│    updated_at (TIMESTAMP)                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            offre_emploi                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK id (UUID)                                                                │
│ FK entreprise_id → entreprise                                              │
│    titre (VARCHAR(255))                                                     │
│    description (TEXT)                                                       │
│    localisation (VARCHAR(255))                                             │
│    type_contrat (ENUM)                                                     │
│    salaire_min (DECIMAL)                                                    │
│    salaire_max (DECIMAL)                                                    │
│    devise (VARCHAR(10))                                                     │
│    experience_requise (INTEGER)                                             │
│    niveau_etude (VARCHAR(100))                                              │
│    date_publication (TIMESTAMP)                                            │
│    date_expiration (TIMESTAMP)                                              │
│    statut (ENUM)                                                            │
│    created_at (TIMESTAMP)                                                   │
│    updated_at (TIMESTAMP)                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    │ 1:N                           │ 1:N
                    │                               │
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│      session_entretien        │   │    recommandation_offre       │
├───────────────────────────────┤   ├───────────────────────────────┤
│ PK id (UUID)                 │   │ PK id (UUID)                 │
│ FK candidate_id → chercheur   │   │ FK analyse_cv_id → analyse_cv  │
│ FK offre_id → offre_emploi    │   │ FK offre_id → offre_emploi    │
│    date_session (TIMESTAMP)    │   │    score_compatibilite (DECIMAL)│
│    type_entretien (ENUM)      │   │    explication (TEXT)         │
│    duree (INTEGER)            │   │    date_recommandation (TIMESTAMP)│
│    score_global (DECIMAL)     │   └───────────────────────────────┘
│    statut (ENUM)              │
│    created_at (TIMESTAMP)     │
└───────────────────────────────┘
            │
            │ 1:N
            │
            ├──────────────────────────────────────────────────────────────┐
            │                                                              │
            │ 1:N                          1:1                             │
            │                                                              │
            ▼                                                              ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│      question_entretien       │   │        feedback_ia             │
├───────────────────────────────┤   ├───────────────────────────────┤
│ PK id (UUID)                 │   │ PK id (UUID)                 │
│ FK session_id → session_entretien│ FK session_id → session_entretien│
│    question (TEXT)            │   │    score_global (DECIMAL)     │
│    type_question (ENUM)       │   │    points_forts (TEXT[])      │
│    reponse (TEXT)             │   │    points_faibles (TEXT[])    │
│    score (DECIMAL)            │   │    conseils (TEXT[])          │
│    ordre (INTEGER)            │   │    date_feedback (TIMESTAMP)   │
└───────────────────────────────┘   └───────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            analyse_cv                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK id (UUID)                                                                │
│ FK cv_id → cv                                                              │
│    date_analyse (TIMESTAMP)                                                 │
│    score_global (DECIMAL)                                                    │
│    resume (TEXT)                                                             │
│    statut (ENUM)                                                            │
│    created_at (TIMESTAMP)                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      recommandation_offre (déjà représenté ci-dessus)         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        lettre_motivation                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK id (UUID)                                                                │
│ FK candidature_id → candidature                                            │
│    contenu (TEXT)                                                           │
│    date_creation (TIMESTAMP)                                                │
│    generated_by_ai (BOOLEAN)                                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           audit_log                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK id (UUID)                                                                │
│ FK changed_by → utilisateur                                                │
│    table_name (VARCHAR(100))                                                │
│    record_id (UUID)                                                         │
│    action (VARCHAR(20))                                                     │
│    old_data (JSONB)                                                         │
│    new_data (JSONB)                                                         │
│    changed_at (TIMESTAMP)                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Légende

- **PK**: Primary Key (Clé Primaire)
- **FK**: Foreign Key (Clé Étrangère)
- **1:1**: One-to-One (Un-à-Un)
- **1:N**: One-to-Many (Un-à-Plusieurs)
- **1:0..1**: One-to-Zero-or-One (Un-à-Zéro-ou-Un)
- **ENUM**: Type énuméré avec valeurs prédéfinies

## Relations Principales

### Relations 1:1
- utilisateur ↔ chercheur_emploi
- utilisateur ↔ entreprise
- session_entretien ↔ feedback_ia

### Relations 1:N
- utilisateur ↔ notification
- chercheur_emploi ↔ cv
- chercheur_emploi ↔ candidature
- chercheur_emploi ↔ session_entretien
- entreprise ↔ offre_emploi
- cv ↔ experience_professionnelle
- cv ↔ formation
- cv ↔ competence
- cv ↔ analyse_cv
- analyse_cv ↔ recommandation_offre
- offre_emploi ↔ candidature
- offre_emploi ↔ recommandation_offre
- offre_emploi ↔ session_entretien
- session_entretien ↔ question_entretien
- audit_log ↔ utilisateur

### Relations 1:0..1
- candidature ↔ lettre_motivation

## Types ENUM

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

## Notes d'Architecture

- **UUID**: Toutes les clés primaires utilisent des UUID pour la distributivité.
- **Cascade Delete**: La plupart des relations utilisent CASCADE DELETE pour maintenir l'intégrité.
- **SET NULL**: Les relations historiques utilisent SET NULL pour préserver les données.
- **Timestamps**: Tous les timestamps sont en UTC avec timezone.
- **Audit**: Les modifications critiques sont journalisées dans audit_log.
- **Normalisation**: La base de données est normalisée à 3NF.
- **Performance**: Les indexes sont créés sur les colonnes fréquemment recherchées.
