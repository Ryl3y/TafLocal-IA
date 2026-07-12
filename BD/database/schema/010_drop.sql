-- ============================================================================
-- TafLocal AI - Drop Database Objects
-- ============================================================================
-- Description: Drop all database objects in reverse order of creation
-- Version: 1.0
-- Author: TafLocal AI Database Team
-- Date: 2026-06-28
-- ============================================================================

-- ============================================================================
-- WARNING: This script will delete all data and database objects!
-- Use with caution in production environments.
-- ============================================================================

-- ============================================================================
-- DROP TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS trg_utilisateur_updated_at ON utilisateur;
DROP TRIGGER IF EXISTS trg_chercheur_emploi_updated_at ON chercheur_emploi;
DROP TRIGGER IF EXISTS trg_entreprise_updated_at ON entreprise;
DROP TRIGGER IF EXISTS trg_cv_updated_at ON cv;
DROP TRIGGER IF EXISTS trg_offre_emploi_updated_at ON offre_emploi;
DROP TRIGGER IF EXISTS trg_candidature_updated_at ON candidature;
DROP TRIGGER IF EXISTS trg_create_application_notification ON candidature;
DROP TRIGGER IF EXISTS trg_archive_expired_jobs ON offre_emploi;
DROP TRIGGER IF EXISTS trg_audit_log_utilisateur ON utilisateur;
DROP TRIGGER IF EXISTS trg_audit_log_entreprise ON entreprise;
DROP TRIGGER IF EXISTS trg_audit_log_offre_emploi ON offre_emploi;
DROP TRIGGER IF EXISTS trg_audit_log_candidature ON candidature;
DROP TRIGGER IF EXISTS trg_ensure_single_default_cv ON cv;
DROP TRIGGER IF EXISTS trg_set_default_cv ON cv;
DROP TRIGGER IF EXISTS trg_prevent_duplicate_application ON candidature;
DROP TRIGGER IF EXISTS trg_auto_increment_cv_version ON cv;
DROP TRIGGER IF EXISTS trg_validate_interview_dates ON session_entretien;
DROP TRIGGER IF EXISTS trg_prevent_feedback_modification ON feedback_ia;

-- ============================================================================
-- DROP VIEWS
-- ============================================================================

DROP VIEW IF EXISTS v_candidate_dashboard;
DROP VIEW IF EXISTS v_company_dashboard;
DROP VIEW IF EXISTS v_admin_dashboard;
DROP VIEW IF EXISTS v_unread_notifications;
DROP VIEW IF EXISTS v_recent_analyses;
DROP VIEW IF EXISTS v_interview_statistics;
DROP VIEW IF EXISTS v_top_recommended_jobs;
DROP VIEW IF EXISTS v_applications_statistics;
DROP VIEW IF EXISTS v_active_job_offers;
DROP VIEW IF EXISTS v_candidate_profile_complete;

-- ============================================================================
-- DROP FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS calculate_recommendation_score(UUID, UUID);
DROP FUNCTION IF EXISTS archive_expired_jobs();
DROP FUNCTION IF EXISTS generate_dashboard_statistics(UUID);
DROP FUNCTION IF EXISTS update_updated_at();
DROP FUNCTION IF EXISTS create_application_notification(UUID, VARCHAR);
DROP FUNCTION IF EXISTS count_applications(UUID, UUID, VARCHAR);
DROP FUNCTION IF EXISTS get_candidate_skills(UUID);
DROP FUNCTION IF EXISTS get_job_applications_summary(UUID);
DROP FUNCTION IF EXISTS mark_notifications_read(UUID, VARCHAR);
DROP FUNCTION IF EXISTS get_candidate_analyses(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_top_recommendations(UUID, INTEGER);
DROP FUNCTION IF EXISTS hash_password(TEXT);
DROP FUNCTION IF EXISTS verify_password(TEXT, TEXT);
DROP FUNCTION IF EXISTS trg_create_application_notification_func();
DROP FUNCTION IF EXISTS trg_archive_expired_jobs_func();
DROP FUNCTION IF EXISTS trg_audit_log_func();
DROP FUNCTION IF EXISTS trg_ensure_single_default_cv_func();
DROP FUNCTION IF EXISTS trg_set_default_cv_func();
DROP FUNCTION IF EXISTS trg_prevent_duplicate_application_func();
DROP FUNCTION IF EXISTS trg_auto_increment_cv_version_func();
DROP FUNCTION IF EXISTS trg_validate_interview_dates_func();
DROP FUNCTION IF EXISTS trg_prevent_feedback_modification_func();

-- ============================================================================
-- DROP TABLES (in reverse order of creation)
-- ============================================================================

DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS users_user_permissions;
DROP TABLE IF EXISTS users_groups;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS feedback_ia;
DROP TABLE IF EXISTS question_entretien;
DROP TABLE IF EXISTS session_entretien;
DROP TABLE IF EXISTS lettre_motivation;
DROP TABLE IF EXISTS candidature;
DROP TABLE IF EXISTS recommandation_offre;
DROP TABLE IF EXISTS offre_emploi;
DROP TABLE IF EXISTS analyse_cv;
DROP TABLE IF EXISTS competence;
DROP TABLE IF EXISTS formation;
DROP TABLE IF EXISTS experience_professionnelle;
DROP TABLE IF EXISTS cv;
DROP TABLE IF EXISTS entreprise;
DROP TABLE IF EXISTS chercheur_emploi;
DROP TABLE IF EXISTS utilisateur;

-- ============================================================================
-- DROP ENUM TYPES
-- ============================================================================

DROP TYPE IF EXISTS notification_type;
DROP TYPE IF EXISTS question_type;
DROP TYPE IF EXISTS interview_status;
DROP TYPE IF EXISTS interview_type;
DROP TYPE IF EXISTS job_status;
DROP TYPE IF EXISTS contract_type;
DROP TYPE IF EXISTS analysis_status;
DROP TYPE IF EXISTS user_role;

-- ============================================================================
-- DROP EXTENSIONS
-- ============================================================================

DROP EXTENSION IF EXISTS "pg_trgm";
DROP EXTENSION IF EXISTS "unaccent";
DROP EXTENSION IF EXISTS "btree_gist";
DROP EXTENSION IF EXISTS "btree_gin";
DROP EXTENSION IF EXISTS "pgcrypto";
DROP EXTENSION IF EXISTS "uuid-ossp";

-- ============================================================================
-- Verification
-- ============================================================================

-- Verify all objects are dropped
SELECT 
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
