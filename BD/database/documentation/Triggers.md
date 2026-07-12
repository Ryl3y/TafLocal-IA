# TafLocal AI - Database Triggers

## Overview

Ce document décrit tous les triggers de la base de données TafLocal AI. Les triggers automatisent les tâches de maintenance, garantissent l'intégrité des données et fournissent des fonctionnalités d'audit.

## Triggers

### 1. trg_utilisateur_updated_at

**Table**: utilisateur

**Événement**: BEFORE UPDATE

**Description**: Met à jour automatiquement le champ updated_at lors de toute modification de l'utilisateur.

**Fonction**: update_updated_at()

**Logique**:
```sql
NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
```

**Utilisation**: Suivi automatique des modifications d'utilisateurs.

---

### 2. trg_chercheur_emploi_updated_at

**Table**: chercheur_emploi

**Événement**: BEFORE UPDATE

**Description**: Met à jour automatiquement le champ updated_at lors de toute modification du profil candidat.

**Fonction**: update_updated_at()

**Utilisation**: Suivi automatique des modifications de profils candidats.

---

### 3. trg_entreprise_updated_at

**Table**: entreprise

**Événement**: BEFORE UPDATE

**Description**: Met à jour automatiquement le champ updated_at lors de toute modification du profil entreprise.

**Fonction**: update_updated_at()

**Utilisation**: Suivi automatique des modifications de profils entreprises.

---

### 4. trg_cv_updated_at

**Table**: cv

**Événement**: BEFORE UPDATE

**Description**: Met à jour automatiquement le champ updated_at lors de toute modification du CV.

**Fonction**: update_updated_at()

**Utilisation**: Suivi automatique des modifications de CVs.

---

### 5. trg_offre_emploi_updated_at

**Table**: offre_emploi

**Événement**: BEFORE UPDATE

**Description**: Met à jour automatiquement le champ updated_at lors de toute modification de l'offre d'emploi.

**Fonction**: update_updated_at()

**Utilisation**: Suivi automatique des modifications d'offres d'emploi.

---

### 6. trg_candidature_updated_at

**Table**: candidature

**Événement**: BEFORE UPDATE

**Description**: Met à jour automatiquement le champ updated_at lors de toute modification de la candidature.

**Fonction**: update_updated_at()

**Utilisation**: Suivi automatique des modifications de candidatures.

---

### 7. trg_create_application_notification

**Table**: candidature

**Événement**: AFTER UPDATE OF statut

**Description**: Crée automatiquement une notification lorsque le statut d'une candidature change.

**Fonction**: trg_create_application_notification_func()

**Logique**:
```sql
IF OLD.statut != NEW.statut THEN
    PERFORM create_application_notification(NEW.id, NEW.statut);
END IF;
RETURN NEW;
```

**Utilisation**: Notification automatique des changements de statut de candidature.

---

### 8. trg_archive_expired_jobs

**Table**: offre_emploi

**Événement**: BEFORE INSERT OR UPDATE

**Description**: Archive automatiquement les offres d'emploi expirées.

**Fonction**: trg_archive_expired_jobs_func()

**Logique**:
```sql
IF NEW.date_expiration IS NOT NULL AND NEW.date_expiration < CURRENT_TIMESTAMP THEN
    NEW.statut = 'EXPIRED';
END IF;
RETURN NEW;
```

**Utilisation**: Maintenance automatique des offres expirées.

---

### 9. trg_audit_log_utilisateur

**Table**: utilisateur

**Événement**: AFTER INSERT OR UPDATE OR DELETE

**Description**: Journalise toutes les modifications sur la table utilisateur.

**Fonction**: trg_audit_log_func()

**Logique**:
- INSERT: Enregistre les nouvelles données
- UPDATE: Enregistre les anciennes et nouvelles données
- DELETE: Enregistre les anciennes données

**Utilisation**: Audit des modifications d'utilisateurs.

---

### 10. trg_audit_log_entreprise

**Table**: entreprise

**Événement**: AFTER INSERT OR UPDATE OR DELETE

**Description**: Journalise toutes les modifications sur la table entreprise.

**Fonction**: trg_audit_log_func()

**Utilisation**: Audit des modifications d'entreprises.

---

### 11. trg_audit_log_offre_emploi

**Table**: offre_emploi

**Événement**: AFTER INSERT OR UPDATE OR DELETE

**Description**: Journalise toutes les modifications sur la table offre_emploi.

**Fonction**: trg_audit_log_func()

**Utilisation**: Audit des modifications d'offres d'emploi.

---

### 12. trg_audit_log_candidature

**Table**: candidature

**Événement**: AFTER INSERT OR UPDATE OR DELETE

**Description**: Journalise toutes les modifications sur la table candidature.

**Fonction**: trg_audit_log_func()

**Utilisation**: Audit des modifications de candidatures.

---

### 13. trg_ensure_single_default_cv

**Table**: cv

**Événement**: BEFORE INSERT OR UPDATE OF is_default

**Condition**: WHEN (NEW.is_default = TRUE)

**Description**: Assure qu'un seul CV est marqué comme par défaut par candidat.

**Fonction**: trg_ensure_single_default_cv_func()

**Logique**:
```sql
IF NEW.is_default = TRUE THEN
    UPDATE cv
    SET is_default = FALSE
    WHERE candidate_id = NEW.candidate_id
        AND id != NEW.id
        AND is_default = TRUE;
END IF;
RETURN NEW;
```

**Utilisation**: Garantit l'unicité du CV par défaut par candidat.

---

### 14. trg_set_default_cv

**Table**: cv

**Événement**: BEFORE INSERT

**Description**: Définit automatiquement le premier CV comme par défaut si aucun n'existe.

**Fonction**: trg_set_default_cv_func()

**Logique**:
```sql
SELECT EXISTS(
    SELECT 1 FROM cv 
    WHERE candidate_id = NEW.candidate_id AND is_default = TRUE
) INTO v_default_exists;

IF NOT v_default_exists THEN
    NEW.is_default = TRUE;
END IF;
RETURN NEW;
```

**Utilisation**: Définit automatiquement le CV par défaut pour les nouveaux candidats.

---

### 15. trg_prevent_duplicate_application

**Table**: candidature

**Événement**: BEFORE INSERT OR UPDATE

**Description**: Empêche les candidatures en double pour le même candidat et la même offre.

**Fonction**: trg_prevent_duplicate_application_func()

**Logique**:
```sql
IF EXISTS(
    SELECT 1 FROM candidature 
    WHERE candidate_id = NEW.candidate_id 
        AND offre_id = NEW.offre_id 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
) THEN
    RAISE EXCEPTION 'Une candidature existe déjà pour ce candidat et cette offre';
END IF;
RETURN NEW;
```

**Utilisation**: Prévention des doublons de candidatures.

---

### 16. trg_auto_increment_cv_version

**Table**: cv

**Événement**: BEFORE INSERT

**Description**: Incrémente automatiquement la version du CV basée sur la version maximale existante.

**Fonction**: trg_auto_increment_cv_version_func()

**Logique**:
```sql
IF TG_OP = 'INSERT' THEN
    SELECT COALESCE(MAX(version), 0) + 1 INTO NEW.version
    FROM cv
    WHERE candidate_id = NEW.candidate_id;
END IF;
RETURN NEW;
```

**Utilisation**: Gestion automatique des versions de CV.

---

### 17. trg_validate_interview_dates

**Table**: session_entretien

**Événement**: BEFORE INSERT OR UPDATE

**Description**: Valide que les dates de session d'entretien sont dans le futur pour les sessions planifiées.

**Fonction**: trg_validate_interview_dates_func()

**Logique**:
```sql
IF NEW.date_session IS NOT NULL AND NEW.statut = 'SCHEDULED' THEN
    IF NEW.date_session < CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'La date de session doit être dans le futur pour une session planifiée';
    END IF;
END IF;
RETURN NEW;
```

**Utilisation**: Validation des dates d'entretien.

---

### 18. trg_prevent_feedback_modification

**Table**: feedback_ia

**Événement**: BEFORE UPDATE

**Description**: Empêche la modification du feedback après 24 heures.

**Fonction**: trg_prevent_feedback_modification_func()

**Logique**:
```sql
IF TG_OP = 'UPDATE' THEN
    IF OLD.date_feedback < (CURRENT_TIMESTAMP - INTERVAL '1 day') THEN
        RAISE EXCEPTION 'Le feedback ne peut plus être modifié après 24 heures';
    END IF;
END IF;
RETURN NEW;
```

**Utilisation**: Protection des feedbacks IA contre les modifications tardives.

---

## Résumé des Triggers

| Trigger | Table | Événement | But |
|---------|-------|-----------|-----|
| trg_utilisateur_updated_at | utilisateur | BEFORE UPDATE | Auto updated_at |
| trg_chercheur_emploi_updated_at | chercheur_emploi | BEFORE UPDATE | Auto updated_at |
| trg_entreprise_updated_at | entreprise | BEFORE UPDATE | Auto updated_at |
| trg_cv_updated_at | cv | BEFORE UPDATE | Auto updated_at |
| trg_offre_emploi_updated_at | offre_emploi | BEFORE UPDATE | Auto updated_at |
| trg_candidature_updated_at | candidature | BEFORE UPDATE | Auto updated_at |
| trg_create_application_notification | candidature | AFTER UPDATE OF statut | Notification statut |
| trg_archive_expired_jobs | offre_emploi | BEFORE INSERT OR UPDATE | Archive expirées |
| trg_audit_log_utilisateur | utilisateur | AFTER INSERT OR UPDATE OR DELETE | Audit utilisateur |
| trg_audit_log_entreprise | entreprise | AFTER INSERT OR UPDATE OR DELETE | Audit entreprise |
| trg_audit_log_offre_emploi | offre_emploi | AFTER INSERT OR UPDATE OR DELETE | Audit offre |
| trg_audit_log_candidature | candidature | AFTER INSERT OR UPDATE OR DELETE | Audit candidature |
| trg_ensure_single_default_cv | cv | BEFORE INSERT OR UPDATE OF is_default | CV unique par défaut |
| trg_set_default_cv | cv | BEFORE INSERT | Auto CV par défaut |
| trg_prevent_duplicate_application | candidature | BEFORE INSERT OR UPDATE | Anti-doublon |
| trg_auto_increment_cv_version | cv | BEFORE INSERT | Auto version CV |
| trg_validate_interview_dates | session_entretien | BEFORE INSERT OR UPDATE | Validation dates |
| trg_prevent_feedback_modification | feedback_ia | BEFORE UPDATE | Protection feedback |

## Notes d'Architecture

- **Automatisation**: Les triggers automatisent les tâches répétitives et de maintenance.
- **Intégrité**: Les triggers garantissent l'intégrité des données (unicité, validation).
- **Audit**: Les triggers d'audit journalisent toutes les modifications critiques.
- **Performance**: Les triggers sont optimisés pour minimiser l'impact sur les performances.
- **Sécurité**: Les triggers empêchent les opérations invalides (doublons, dates invalides).
- **Maintenance**: Les triggers centralisent la logique métier pour faciliter la maintenance.
- **Timestamps**: Les triggers updated_at garantissent que les timestamps sont toujours à jour.
- **Notifications**: Les triggers de notification assurent que les utilisateurs sont informés des changements importants.
