-- ============================================================================
-- TafLocal AI - Database Indexes
-- ============================================================================
-- Description: Create indexes for performance optimization
-- Version: 1.0
-- Author: TafLocal AI Database Team
-- Date: 2026-06-28
-- ============================================================================

-- ============================================================================
-- TABLE: utilisateur (User)
-- ============================================================================

-- Index on email for login queries
CREATE INDEX idx_utilisateur_email ON utilisateur(email);

-- Index on role for filtering by user type
CREATE INDEX idx_utilisateur_role ON utilisateur(role);

-- Index on is_active for active user queries
CREATE INDEX idx_utilisateur_is_active ON utilisateur(is_active);

-- Index on date_inscription for user statistics
CREATE INDEX idx_utilisateur_date_inscription ON utilisateur(date_inscription);

-- Composite index for admin user queries
CREATE INDEX idx_utilisateur_role_active ON utilisateur(role, is_active);

-- Index on username for Django compatibility
CREATE INDEX idx_utilisateur_username ON utilisateur(username);

-- Pattern matching index for email (Django)
CREATE INDEX utilisateur_email_like ON utilisateur USING btree(email varchar_pattern_ops);

-- Pattern matching index for username (Django)
CREATE INDEX utilisateur_username_like ON utilisateur USING btree(username varchar_pattern_ops);

-- ============================================================================
-- TABLE: chercheur_emploi (Candidate)
-- ============================================================================

-- Index on user_id for profile lookups
CREATE INDEX idx_chercheur_emploi_user_id ON chercheur_emploi(user_id);

-- Index on ville for location-based searches
CREATE INDEX idx_chercheur_emploi_ville ON chercheur_emploi(ville);

-- ============================================================================
-- TABLE: entreprise (Company)
-- ============================================================================

-- Index on user_id for profile lookups
CREATE INDEX idx_entreprise_user_id ON entreprise(user_id);

-- Index on secteur for industry filtering
CREATE INDEX idx_entreprise_secteur ON entreprise(secteur);

-- Index on ville for location-based searches
CREATE INDEX idx_entreprise_ville ON entreprise(ville);

-- Index on verified for verified company queries
CREATE INDEX idx_entreprise_verified ON entreprise(verified);

-- ============================================================================
-- TABLE: cv
-- ============================================================================

-- Index on candidate_id for CV lookups
CREATE INDEX idx_cv_candidate_id ON cv(candidate_id);

-- Index on is_default for default CV queries
CREATE INDEX idx_cv_is_default ON cv(is_default);

-- Index on date_import for recent CV queries
CREATE INDEX idx_cv_date_import ON cv(date_import);

-- Composite index for candidate's default CV
CREATE INDEX idx_cv_candidate_default ON cv(candidate_id, is_default);

-- ============================================================================
-- TABLE: experience_professionnelle (Work Experience)
-- ============================================================================

-- Index on cv_id for experience lookups
CREATE INDEX idx_experience_cv_id ON experience_professionnelle(cv_id);

-- Index on date_debut for timeline queries
CREATE INDEX idx_experience_date_debut ON experience_professionnelle(date_debut);

-- Index on entreprise for company experience searches
CREATE INDEX idx_experience_entreprise ON experience_professionnelle(entreprise);

-- ============================================================================
-- TABLE: formation (Education)
-- ============================================================================

-- Index on cv_id for education lookups
CREATE INDEX idx_formation_cv_id ON formation(cv_id);

-- Index on etablissement for institution searches
CREATE INDEX idx_formation_etablissement ON formation(etablissement);

-- ============================================================================
-- TABLE: competence (Skill)
-- ============================================================================

-- Index on cv_id for skill lookups
CREATE INDEX idx_competence_cv_id ON competence(cv_id);

-- Index on nom for skill searches (GIN for trigram matching)
CREATE INDEX idx_competence_nom_trgm ON competence USING gin(nom gin_trgm_ops);

-- Index on niveau for skill level filtering
CREATE INDEX idx_competence_niveau ON competence(niveau);

-- ============================================================================
-- TABLE: analyse_cv (CV Analysis)
-- ============================================================================

-- Index on cv_id for analysis lookups
CREATE INDEX idx_analyse_cv_id ON analyse_cv(cv_id);

-- Index on statut for filtering by analysis status
CREATE INDEX idx_analyse_statut ON analyse_cv(statut);

-- Index on score_global for ranking analyses
CREATE INDEX idx_analyse_score_global ON analyse_cv(score_global);

-- Index on date_analyse for recent analyses
CREATE INDEX idx_analyse_date_analyse ON analyse_cv(date_analyse);

-- Composite index for completed analyses
CREATE INDEX idx_analyse_cv_statut ON analyse_cv(cv_id, statut);

-- ============================================================================
-- TABLE: offre_emploi (Job Offer)
-- ============================================================================

-- Index on entreprise_id for company job lookups
CREATE INDEX idx_offre_entreprise_id ON offre_emploi(entreprise_id);

-- Index on statut for filtering by job status
CREATE INDEX idx_offre_statut ON offre_emploi(statut);

-- Index on type_contrat for contract type filtering
CREATE INDEX idx_offre_type_contrat ON offre_emploi(type_contrat);

-- Index on localisation for location-based searches
CREATE INDEX idx_offre_localisation ON offre_emploi(localisation);

-- Index on date_publication for recent jobs
CREATE INDEX idx_offre_date_publication ON offre_emploi(date_publication);

-- Index on date_expiration for expiring jobs
CREATE INDEX idx_offre_date_expiration ON offre_emploi(date_expiration);

-- GIN index on titre for full-text search
CREATE INDEX idx_offre_titre_trgm ON offre_emploi USING gin(titre gin_trgm_ops);

-- GIN index on description for full-text search
CREATE INDEX idx_offre_description_trgm ON offre_emploi USING gin(description gin_trgm_ops);

-- Composite index for active jobs
CREATE INDEX idx_offre_statut_publication ON offre_emploi(statut, date_publication);

-- ============================================================================
-- TABLE: recommandation_offre (Job Recommendation)
-- ============================================================================

-- Index on analyse_cv_id for recommendation lookups
CREATE INDEX idx_recommandation_analyse_cv_id ON recommandation_offre(analyse_cv_id);

-- Index on offre_id for job recommendation lookups
CREATE INDEX idx_recommandation_offre_id ON recommandation_offre(offre_id);

-- Index on score_compatibilite for ranking recommendations
CREATE INDEX idx_recommandation_score_compatibilite ON recommandation_offre(score_compatibilite);

-- ============================================================================
-- TABLE: candidature (Application)
-- ============================================================================

-- Index on candidate_id for candidate application lookups
CREATE INDEX idx_candidature_candidate_id ON candidature(candidate_id);

-- Index on offre_id for job application lookups
CREATE INDEX idx_candidature_offre_id ON candidature(offre_id);

-- Index on statut for filtering by application status
CREATE INDEX idx_candidature_statut ON candidature(statut);

-- Index on date_candidature for recent applications
CREATE INDEX idx_candidature_date_candidature ON candidature(date_candidature);

-- Composite index for candidate's applications
CREATE INDEX idx_candidature_candidate_statut ON candidature(candidate_id, statut);

-- Composite index for job's applications
CREATE INDEX idx_candidature_offre_statut ON candidature(offre_id, statut);

-- ============================================================================
-- TABLE: lettre_motivation (Cover Letter)
-- ============================================================================

-- Index on candidature_id for cover letter lookups
CREATE INDEX idx_lettre_candidature_id ON lettre_motivation(candidature_id);

-- ============================================================================
-- TABLE: session_entretien (Interview Session)
-- ============================================================================

-- Index on candidate_id for candidate interview lookups
CREATE INDEX idx_session_candidate_id ON session_entretien(candidate_id);

-- Index on offre_id for job interview lookups
CREATE INDEX idx_session_offre_id ON session_entretien(offre_id);

-- Index on statut for filtering by interview status
CREATE INDEX idx_session_statut ON session_entretien(statut);

-- Index on date_session for scheduled interviews
CREATE INDEX idx_session_date_session ON session_entretien(date_session);

-- Index on type_entretien for interview type filtering
CREATE INDEX idx_session_type_entretien ON session_entretien(type_entretien);

-- Composite index for candidate's interviews
CREATE INDEX idx_session_candidate_statut ON session_entretien(candidate_id, statut);

-- ============================================================================
-- TABLE: question_entretien (Interview Question)
-- ============================================================================

-- Index on idx_question_session_entretien_id for question lookups
CREATE INDEX idx_question_session_id ON question_entretien(idx_question_session_entretien_id);

-- Index on ordre for ordering questions
CREATE INDEX idx_question_ordre ON question_entretien(ordre);

-- Composite index for session questions in order
CREATE INDEX idx_question_session_ordre ON question_entretien(idx_question_session_entretien_id, ordre);

-- ============================================================================
-- TABLE: feedback_ia (AI Feedback)
-- ============================================================================

-- Index on idx_question_session_entretien_id for feedback lookups
CREATE INDEX idx_feedback_session_id ON feedback_ia(idx_question_session_entretien_id);

-- ============================================================================
-- TABLE: notification
-- ============================================================================

-- Index on user_id for user notification lookups
CREATE INDEX idx_notification_user_id ON notification(user_id);

-- Index on lu for unread notification queries
CREATE INDEX idx_notification_lu ON notification(lu);

-- Index on type for notification type filtering
CREATE INDEX idx_notification_type ON notification(type);

-- Index on date_envoi for recent notifications
CREATE INDEX idx_notification_date_envoi ON notification(date_envoi);

-- Composite index for user's unread notifications
CREATE INDEX idx_notification_user_lu ON notification(user_id, lu);

-- Composite index for user's notifications by type
CREATE INDEX idx_notification_user_type ON notification(user_id, type);

-- ============================================================================
-- TABLE: notifications (Django notifications table)
-- ============================================================================

-- Index on user_id for user notification lookups
CREATE INDEX notifications_user_id ON notifications(user_id);

-- Index on is_read for unread notification queries
CREATE INDEX notifications_is_read ON notifications(is_read);

-- Index on type for notification type filtering
CREATE INDEX notifications_type ON notifications(type);

-- Index on created_at for recent notifications
CREATE INDEX notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- TABLE: users_groups (Django groups table)
-- ============================================================================

-- Index on user_id for user group lookups
CREATE INDEX users_groups_user_id ON users_groups(user_id);

-- Index on group_id for group member lookups
CREATE INDEX users_groups_group_id ON users_groups(group_id);

-- ============================================================================
-- TABLE: users_user_permissions (Django permissions table)
-- ============================================================================

-- Index on user_id for user permission lookups
CREATE INDEX users_user_permissions_user_id ON users_user_permissions(user_id);

-- Index on permission_id for permission holder lookups
CREATE INDEX users_user_permissions_permission_id ON users_user_permissions(permission_id);

-- ============================================================================
-- Verification
-- ============================================================================

-- List all indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
