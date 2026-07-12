# TafLocal AI - Database Functions

## Overview

Ce document décrit toutes les fonctions PostgreSQL de la base de données TafLocal AI. Les fonctions sont utilisées pour encapsuler la logique métier, simplifier les requêtes et automatiser les tâches.

## Fonctions

### 1. calculate_recommendation_score

**Description**: Calcule le score de compatibilité entre un CV et une offre d'emploi.

**Paramètres**:
- p_cv_id (UUID): Identifiant du CV
- p_offre_id (UUID): Identifiant de l'offre d'emploi

**Retour**: DECIMAL(5,2) - Score de compatibilité (0-100)

**Logique**:
- Score de base: 50
- Bonus localisation: +15 si la ville du candidat correspond à la localisation de l'offre
- Bonus compétences: +2 par compétence (max +25)
- Score final: Limité entre 0 et 100

**Exemple d'utilisation**:
```sql
SELECT calculate_recommendation_score(
    '60000000-0000-0000-0000-000000000001'::UUID,
    '70000000-0000-0000-0000-000000000001'::UUID
);
```

**Utilisation**: Génération automatique des scores de recommandation.

---

### 2. archive_expired_jobs

**Description**: Archive automatiquement les offres d'emploi expirées.

**Paramètres**: Aucun

**Retour**: INTEGER - Nombre d'offres archivées

**Logique**:
- Met à jour le statut à 'ARCHIVED' pour les offres PUBLISHED avec date_expiration < CURRENT_TIMESTAMP
- Met à jour updated_at à CURRENT_TIMESTAMP

**Exemple d'utilisation**:
```sql
SELECT archive_expired_jobs();
```

**Utilisation**: Maintenance automatique des offres expirées.

---

### 3. generate_dashboard_statistics

**Description**: Génère les statistiques du tableau de bord pour un utilisateur.

**Paramètres**:
- p_user_id (UUID): Identifiant de l'utilisateur

**Retour**: TABLE avec les colonnes:
- total_cvs (INTEGER)
- total_applications (INTEGER)
- pending_applications (INTEGER)
- shortlisted_applications (INTEGER)
- hired_applications (INTEGER)
- total_interviews (INTEGER)
- completed_interviews (INTEGER)
- unread_notifications (INTEGER)
- average_cv_score (DECIMAL(5,2))

**Exemple d'utilisation**:
```sql
SELECT * FROM generate_dashboard_statistics('40000000-0000-0000-0000-000000000001'::UUID);
```

**Utilisation**: Tableau de bord utilisateur, statistiques personnelles.

---

### 4. update_updated_at

**Description**: Met à jour automatiquement le champ updated_at.

**Paramètres**: Aucun (fonction trigger)

**Retour**: TRIGGER

**Logique**: Définit NEW.updated_at = CURRENT_TIMESTAMP

**Utilisation**: Trigger pour mettre à jour automatiquement updated_at sur UPDATE.

---

### 5. create_application_notification

**Description**: Crée une notification lors du changement de statut d'une candidature.

**Paramètres**:
- p_candidature_id (UUID): Identifiant de la candidature
- p_statut (VARCHAR(50)): Nouveau statut

**Retour**: UUID - Identifiant de la notification créée

**Logique**:
- Récupère le candidat et le titre de l'offre
- Crée une notification avec titre et message formatés
- Type: APPLICATION
- lu: FALSE

**Exemple d'utilisation**:
```sql
SELECT create_application_notification(
    '80000000-0000-0000-0000-000000000001'::UUID,
    'SHORTLISTED'
);
```

**Utilisation**: Notification automatique des changements de statut.

---

### 6. count_applications

**Description**: Compte les candidatures selon les filtres spécifiés.

**Paramètres**:
- p_offre_id (UUID, optionnel): Identifiant de l'offre
- p_candidate_id (UUID, optionnel): Identifiant du candidat
- p_statut (VARCHAR, optionnel): Statut de la candidature

**Retour**: INTEGER - Nombre de candidatures

**Exemple d'utilisation**:
```sql
-- Compter toutes les candidatures
SELECT count_applications();

-- Compter les candidatures pour une offre
SELECT count_applications('70000000-0000-0000-0000-000000000001'::UUID, NULL, NULL);

-- Compter les candidatures pending d'un candidat
SELECT count_applications(NULL, '50000000-0000-0000-0000-000000000001'::UUID, 'PENDING');
```

**Utilisation**: Statistiques de candidatures, rapports.

---

### 7. get_candidate_skills

**Description**: Récupère les compétences d'un candidat.

**Paramètres**:
- p_candidate_id (UUID): Identifiant du candidat

**Retour**: TABLE avec les colonnes:
- skill_id (UUID)
- skill_name (VARCHAR(100))
- skill_level (VARCHAR(50))

**Exemple d'utilisation**:
```sql
SELECT * FROM get_candidate_skills('50000000-0000-0000-0000-000000000001'::UUID);
```

**Utilisation**: Profil de compétences, matching.

---

### 8. get_job_applications_summary

**Description**: Résumé des candidatures pour une offre d'emploi.

**Paramètres**:
- p_offre_id (UUID): Identifiant de l'offre

**Retour**: TABLE avec les colonnes:
- total (INTEGER)
- pending (INTEGER)
- under_review (INTEGER)
- shortlisted (INTEGER)
- rejected (INTEGER)
- hired (INTEGER)
- withdrawn (INTEGER)

**Exemple d'utilisation**:
```sql
SELECT * FROM get_job_applications_summary('70000000-0000-0000-0000-000000000001'::UUID);
```

**Utilisation**: Statistiques de recrutement par offre.

---

### 9. mark_notifications_read

**Description**: Marque les notifications comme lues.

**Paramètres**:
- p_user_id (UUID): Identifiant de l'utilisateur
- p_notification_type (VARCHAR, optionnel): Type de notification

**Retour**: INTEGER - Nombre de notifications marquées comme lues

**Exemple d'utilisation**:
```sql
-- Marquer toutes les notifications comme lues
SELECT mark_notifications_read('40000000-0000-0000-0000-000000000001'::UUID);

-- Marquer uniquement les notifications de type APPLICATION
SELECT mark_notifications_read('40000000-0000-0000-0000-000000000001'::UUID, 'APPLICATION');
```

**Utilisation**: Gestion des notifications, centre de notifications.

---

### 10. get_candidate_analyses

**Description**: Récupère les analyses de CV d'un candidat.

**Paramètres**:
- p_candidate_id (UUID): Identifiant du candidat
- p_limit (INTEGER, optionnel): Nombre maximum de résultats (défaut: 10)

**Retour**: TABLE avec les colonnes:
- analysis_id (UUID)
- cv_id (UUID)
- cv_titre (VARCHAR(255))
- date_analyse (TIMESTAMP WITH TIME ZONE)
- score_global (DECIMAL(5,2))
- statut (VARCHAR(50))

**Exemple d'utilisation**:
```sql
SELECT * FROM get_candidate_analyses('50000000-0000-0000-0000-000000000001'::UUID, 5);
```

**Utilisation**: Historique des analyses de CV, monitoring IA.

---

### 11. get_top_recommendations

**Description**: Récupère les meilleures recommandations d'emploi pour un candidat.

**Paramètres**:
- p_candidate_id (UUID): Identifiant du candidat
- p_limit (INTEGER, optionnel): Nombre maximum de résultats (défaut: 10)

**Retour**: TABLE avec les colonnes:
- recommendation_id (UUID)
- job_id (UUID)
- job_titre (VARCHAR(255))
- company_name (VARCHAR(255))
- score_compatibilite (DECIMAL(5,2))
- explication (TEXT)

**Exemple d'utilisation**:
```sql
SELECT * FROM get_top_recommendations('50000000-0000-0000-0000-000000000001'::UUID, 5);
```

**Utilisation**: Recommandations d'emploi, matching candidat-offre.

---

### 12. hash_password

**Description**: Hash un mot de passe avec SHA256.

**Paramètres**:
- p_password (TEXT): Mot de passe en clair

**Retour**: TEXT - Mot de passe hashé

**Exemple d'utilisation**:
```sql
SELECT hash_password('MonMotDePasse123!');
```

**Utilisation**: Hashage des mots de passe, sécurité.

---

### 13. verify_password

**Description**: Vérifie si un mot de passe correspond au hash.

**Paramètres**:
- p_password (TEXT): Mot de passe en clair
- p_hash (TEXT): Hash du mot de passe

**Retour**: BOOLEAN - TRUE si correspond, FALSE sinon

**Exemple d'utilisation**:
```sql
SELECT verify_password('MonMotDePasse123!', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8');
```

**Utilisation**: Vérification des mots de passe, authentification.

---

## Fonctions Trigger

### trg_create_application_notification_func

**Description**: Fonction trigger pour créer une notification lors du changement de statut de candidature.

**Paramètres**: Aucun (utilise OLD et NEW)

**Retour**: TRIGGER

**Logique**: Compare OLD.statut et NEW.statut, crée une notification si différent.

**Utilisation**: Trigger trg_create_application_notification.

---

### trg_archive_expired_jobs_func

**Description**: Fonction trigger pour archiver automatiquement les offres expirées.

**Paramètres**: Aucun (utilise NEW)

**Retour**: TRIGGER

**Logique**: Vérifie date_expiration, met statut à 'EXPIRED' si expiré.

**Utilisation**: Trigger trg_archive_expired_jobs.

---

### trg_audit_log_func

**Description**: Fonction trigger pour journaliser les modifications.

**Paramètres**: Aucun (utilise TG_OP, OLD, NEW)

**Retour**: TRIGGER

**Logique**: Insère dans audit_log selon l'opération (INSERT, UPDATE, DELETE).

**Utilisation**: Triggers d'audit.

---

### trg_ensure_single_default_cv_func

**Description**: Fonction trigger pour assurer qu'un seul CV est par défaut.

**Paramètres**: Aucun (utilise NEW)

**Retour**: TRIGGER

**Logique**: Si is_default = TRUE, met is_default = FALSE pour les autres CVs du candidat.

**Utilisation**: Trigger trg_ensure_single_default_cv.

---

### trg_set_default_cv_func

**Description**: Fonction trigger pour définir automatiquement le premier CV comme par défaut.

**Paramètres**: Aucun (utilise NEW)

**Retour**: TRIGGER

**Logique**: Si aucun CV par défaut existe, définit is_default = TRUE.

**Utilisation**: Trigger trg_set_default_cv.

---

### trg_prevent_duplicate_application_func

**Description**: Fonction trigger pour empêcher les candidatures en double.

**Paramètres**: Aucun (utilise NEW)

**Retour**: TRIGGER

**Logique**: Vérifie si une candidature existe déjà, lève une exception si oui.

**Utilisation**: Trigger trg_prevent_duplicate_application.

---

### trg_auto_increment_cv_version_func

**Description**: Fonction trigger pour incrémenter automatiquement la version du CV.

**Paramètres**: Aucun (utilise NEW)

**Retour**: TRIGGER

**Logique**: Incrémente la version basée sur la version maximale existante.

**Utilisation**: Trigger trg_auto_increment_cv_version.

---

### trg_validate_interview_dates_func

**Description**: Fonction trigger pour valider les dates de session d'entretien.

**Paramètres**: Aucun (utilise NEW)

**Retour**: TRIGGER

**Logique**: Vérifie que date_session est dans le futur pour les sessions SCHEDULED.

**Utilisation**: Trigger trg_validate_interview_dates.

---

### trg_prevent_feedback_modification_func

**Description**: Fonction trigger pour empêcher la modification du feedback après 24 heures.

**Paramètres**: Aucun (utilise OLD)

**Retour**: TRIGGER

**Logique**: Vérifie si date_feedback < 24h, lève une exception si oui.

**Utilisation**: Trigger trg_prevent_feedback_modification.

---

## Résumé des Fonctions

| Fonction | Type | Retour | Utilisation |
|----------|------|--------|-------------|
| calculate_recommendation_score | SCALAR | DECIMAL(5,2) | Score de compatibilité |
| archive_expired_jobs | SCALAR | INTEGER | Maintenance offres |
| generate_dashboard_statistics | TABLE | TABLE | Statistiques dashboard |
| update_updated_at | TRIGGER | TRIGGER | Auto updated_at |
| create_application_notification | SCALAR | UUID | Notification statut |
| count_applications | SCALAR | INTEGER | Comptage candidatures |
| get_candidate_skills | TABLE | TABLE | Compétences candidat |
| get_job_applications_summary | TABLE | TABLE | Résumé candidatures |
| mark_notifications_read | SCALAR | INTEGER | Marquer lues |
| get_candidate_analyses | TABLE | TABLE | Analyses CV |
| get_top_recommendations | TABLE | TABLE | Recommandations |
| hash_password | SCALAR | TEXT | Hash mot de passe |
| verify_password | SCALAR | BOOLEAN | Vérifier mot de passe |

## Notes d'Architecture

- **Encapsulation**: Les fonctions encapsulent la logique métier complexe.
- **Réutilisabilité**: Les fonctions peuvent être réutilisées dans plusieurs requêtes.
- **Performance**: Les fonctions sont optimisées avec des indexes appropriés.
- **Sécurité**: Les fonctions de hashage utilisent pgcrypto pour la sécurité.
- **Maintenance**: Les fonctions centralisent la logique pour faciliter la maintenance.
- **Triggers**: Les fonctions trigger automatisent les tâches de maintenance.
