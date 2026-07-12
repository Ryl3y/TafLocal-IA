-- ============================================================================
-- TafLocal AI - Database Triggers
-- ============================================================================
-- Description: Create triggers for automatic data management
-- Version: 1.0
-- Author: TafLocal AI Database Team
-- Date: 2026-06-28
-- ============================================================================

-- ============================================================================
-- TRIGGER: Automatic updated_at for utilisateur
-- ============================================================================
CREATE TRIGGER trg_utilisateur_updated_at
BEFORE UPDATE ON utilisateur
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

COMMENT ON TRIGGER trg_utilisateur_updated_at ON utilisateur IS 'Met à jour automatiquement updated_at pour utilisateur';

-- ============================================================================
-- TRIGGER: Automatic updated_at for chercheur_emploi
-- ============================================================================
CREATE TRIGGER trg_chercheur_emploi_updated_at
BEFORE UPDATE ON chercheur_emploi
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

COMMENT ON TRIGGER trg_chercheur_emploi_updated_at ON chercheur_emploi IS 'Met à jour automatiquement updated_at pour chercheur_emploi';

-- ============================================================================
-- TRIGGER: Automatic updated_at for entreprise
-- ============================================================================
CREATE TRIGGER trg_entreprise_updated_at
BEFORE UPDATE ON entreprise
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

COMMENT ON TRIGGER trg_entreprise_updated_at ON entreprise IS 'Met à jour automatiquement updated_at pour entreprise';

-- ============================================================================
-- TRIGGER: Automatic updated_at for cv
-- ============================================================================
CREATE TRIGGER trg_cv_updated_at
BEFORE UPDATE ON cv
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

COMMENT ON TRIGGER trg_cv_updated_at ON cv IS 'Met à jour automatiquement updated_at pour cv';

-- ============================================================================
-- TRIGGER: Automatic updated_at for offre_emploi
-- ============================================================================
CREATE TRIGGER trg_offre_emploi_updated_at
BEFORE UPDATE ON offre_emploi
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

COMMENT ON TRIGGER trg_offre_emploi_updated_at ON offre_emploi IS 'Met à jour automatiquement updated_at pour offre_emploi';

-- ============================================================================
-- TRIGGER: Automatic updated_at for candidature
-- ============================================================================
CREATE TRIGGER trg_candidature_updated_at
BEFORE UPDATE ON candidature
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

COMMENT ON TRIGGER trg_candidature_updated_at ON candidature IS 'Met à jour automatiquement updated_at pour candidature';

-- ============================================================================
-- TRIGGER: Create notification after application status change
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_create_application_notification_func()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.statut != NEW.statut THEN
        PERFORM create_application_notification(NEW.id, NEW.statut);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_application_notification
AFTER UPDATE OF statut ON candidature
FOR EACH ROW
EXECUTE FUNCTION trg_create_application_notification_func();

COMMENT ON TRIGGER trg_create_application_notification ON candidature IS 'Crée une notification lors du changement de statut de candidature';

-- ============================================================================
-- TRIGGER: Archive expired jobs
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_archive_expired_jobs_func()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.date_expiration IS NOT NULL AND NEW.date_expiration < CURRENT_TIMESTAMP THEN
        NEW.statut = 'EXPIRED';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_archive_expired_jobs
BEFORE INSERT OR UPDATE ON offre_emploi
FOR EACH ROW
EXECUTE FUNCTION trg_archive_expired_jobs_func();

COMMENT ON TRIGGER trg_archive_expired_jobs ON offre_emploi IS 'Archive automatiquement les offres expirées';

-- ============================================================================
-- TRIGGER: Audit log for utilisateur
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES utilisateur(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE audit_log IS 'Table de journalisation des modifications';

CREATE OR REPLACE FUNCTION trg_audit_log_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD));
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_log_utilisateur
AFTER INSERT OR UPDATE OR DELETE ON utilisateur
FOR EACH ROW
EXECUTE FUNCTION trg_audit_log_func();

COMMENT ON TRIGGER trg_audit_log_utilisateur ON utilisateur IS 'Journalise les modifications sur utilisateur';

CREATE TRIGGER trg_audit_log_entreprise
AFTER INSERT OR UPDATE OR DELETE ON entreprise
FOR EACH ROW
EXECUTE FUNCTION trg_audit_log_func();

COMMENT ON TRIGGER trg_audit_log_entreprise ON entreprise IS 'Journalise les modifications sur entreprise';

CREATE TRIGGER trg_audit_log_offre_emploi
AFTER INSERT OR UPDATE OR DELETE ON offre_emploi
FOR EACH ROW
EXECUTE FUNCTION trg_audit_log_func();

COMMENT ON TRIGGER trg_audit_log_offre_emploi ON offre_emploi IS 'Journalise les modifications sur offre_emploi';

CREATE TRIGGER trg_audit_log_candidature
AFTER INSERT OR UPDATE OR DELETE ON candidature
FOR EACH ROW
EXECUTE FUNCTION trg_audit_log_func();

COMMENT ON TRIGGER trg_audit_log_candidature ON candidature IS 'Journalise les modifications sur candidature';

-- ============================================================================
-- TRIGGER: Ensure only one default CV per candidate
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_ensure_single_default_cv_func()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE cv
        SET is_default = FALSE
        WHERE candidate_id = NEW.candidate_id
            AND id != NEW.id
            AND is_default = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ensure_single_default_cv
BEFORE INSERT OR UPDATE OF is_default ON cv
FOR EACH ROW
WHEN (NEW.is_default = TRUE)
EXECUTE FUNCTION trg_ensure_single_default_cv_func();

COMMENT ON TRIGGER trg_ensure_single_default_cv ON cv IS 'Assure qu''un seul CV est marqué comme par défaut par candidat';

-- ============================================================================
-- TRIGGER: Set default CV when no default exists
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_set_default_cv_func()
RETURNS TRIGGER AS $$
DECLARE
    v_default_exists BOOLEAN;
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT EXISTS(
            SELECT 1 FROM cv 
            WHERE candidate_id = NEW.candidate_id AND is_default = TRUE
        ) INTO v_default_exists;
        
        IF NOT v_default_exists THEN
            NEW.is_default = TRUE;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_default_cv
BEFORE INSERT ON cv
FOR EACH ROW
EXECUTE FUNCTION trg_set_default_cv_func();

COMMENT ON TRIGGER trg_set_default_cv ON cv IS 'Définit automatiquement le premier CV comme par défaut';

-- ============================================================================
-- TRIGGER: Prevent duplicate applications
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_prevent_duplicate_application_func()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS(
        SELECT 1 FROM candidature 
        WHERE candidate_id = NEW.candidate_id 
            AND offre_id = NEW.offre_id 
            AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    ) THEN
        RAISE EXCEPTION 'Une candidature existe déjà pour ce candidat et cette offre';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_duplicate_application
BEFORE INSERT OR UPDATE ON candidature
FOR EACH ROW
EXECUTE FUNCTION trg_prevent_duplicate_application_func();

COMMENT ON TRIGGER trg_prevent_duplicate_application ON candidature IS 'Empêche les candidatures en double';

-- ============================================================================
-- TRIGGER: Auto-increment CV version
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_auto_increment_cv_version_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT COALESCE(MAX(version), 0) + 1 INTO NEW.version
        FROM cv
        WHERE candidate_id = NEW.candidate_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_increment_cv_version
BEFORE INSERT ON cv
FOR EACH ROW
EXECUTE FUNCTION trg_auto_increment_cv_version_func();

COMMENT ON TRIGGER trg_auto_increment_cv_version ON cv IS 'Incrémente automatiquement la version du CV';

-- ============================================================================
-- TRIGGER: Validate interview session dates
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_validate_interview_dates_func()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.date_session IS NOT NULL AND NEW.statut = 'SCHEDULED' THEN
        IF NEW.date_session < CURRENT_TIMESTAMP THEN
            RAISE EXCEPTION 'La date de session doit être dans le futur pour une session planifiée';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_interview_dates
BEFORE INSERT OR UPDATE ON session_entretien
FOR EACH ROW
EXECUTE FUNCTION trg_validate_interview_dates_func();

COMMENT ON TRIGGER trg_validate_interview_dates ON session_entretien IS 'Valide les dates de session d''entretien';

-- ============================================================================
-- TRIGGER: Prevent feedback modification after completion
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_prevent_feedback_modification_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF OLD.date_feedback < (CURRENT_TIMESTAMP - INTERVAL '1 day') THEN
            RAISE EXCEPTION 'Le feedback ne peut plus être modifié après 24 heures';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_feedback_modification
BEFORE UPDATE ON feedback_ia
FOR EACH ROW
EXECUTE FUNCTION trg_prevent_feedback_modification_func();

COMMENT ON TRIGGER trg_prevent_feedback_modification ON feedback_ia IS 'Empêche la modification du feedback après 24 heures';

-- ============================================================================
-- Verification
-- ============================================================================

-- List all triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
