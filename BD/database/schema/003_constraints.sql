-- ============================================================================
-- TafLocal AI - Additional Constraints
-- ============================================================================
-- Description: Add additional CHECK constraints for data integrity
-- Version: 1.0
-- Author: TafLocal AI Database Team
-- Date: 2026-06-28
-- ============================================================================

-- ============================================================================
-- TABLE: utilisateur (User)
-- ============================================================================

-- Ensure email format is valid
ALTER TABLE utilisateur 
ADD CONSTRAINT check_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure password is at least 8 characters
ALTER TABLE utilisateur 
ADD CONSTRAINT check_password_length 
CHECK (LENGTH(mot_de_passe) >= 8);

-- Ensure phone number format if provided
ALTER TABLE utilisateur 
ADD CONSTRAINT check_phone_format 
CHECK (telephone IS NULL OR telephone ~ '^\+?[0-9\s\-\(\)]{10,20}$');

-- Ensure date_inscription is not in the future
ALTER TABLE utilisateur 
ADD CONSTRAINT check_date_inscription_past 
CHECK (date_inscription <= CURRENT_TIMESTAMP);

-- ============================================================================
-- TABLE: chercheur_emploi (Candidate)
-- ============================================================================

-- Ensure date_naissance is not in the future
ALTER TABLE chercheur_emploi 
ADD CONSTRAINT check_date_naissance_past 
CHECK (date_naissance IS NULL OR date_naissance <= CURRENT_DATE);

-- Ensure candidate is at least 16 years old
ALTER TABLE chercheur_emploi 
ADD CONSTRAINT check_minimum_age 
CHECK (date_naissance IS NULL OR date_naissance <= (CURRENT_DATE - INTERVAL '16 years'));

-- Ensure genre is valid if provided
ALTER TABLE chercheur_emploi 
ADD CONSTRAINT check_genre_valid 
CHECK (genre IS NULL OR genre IN ('H', 'F', 'Autre', 'Non spécifié'));

-- ============================================================================
-- TABLE: entreprise (Company)
-- ============================================================================

-- Ensure company name is not empty
ALTER TABLE entreprise 
ADD CONSTRAINT check_company_name_not_empty 
CHECK (TRIM(nom_entreprise) != '');

-- Ensure website URL format if provided
ALTER TABLE entreprise 
ADD CONSTRAINT check_website_format 
CHECK (site_web IS NULL OR site_web ~* '^https?://[^\s/$.?#].[^\s]*$');

-- ============================================================================
-- TABLE: cv
-- ============================================================================

-- Ensure CV title is not empty
ALTER TABLE cv 
ADD CONSTRAINT check_cv_title_not_empty 
CHECK (TRIM(titre) != '');

-- Ensure version is positive
ALTER TABLE cv 
ADD CONSTRAINT check_cv_version_positive 
CHECK (version >= 1);

-- Ensure file URL is not empty
ALTER TABLE cv 
ADD CONSTRAINT check_cv_file_not_empty 
CHECK (TRIM(fichier_pdf) != '');

-- ============================================================================
-- TABLE: experience_professionnelle (Work Experience)
-- ============================================================================

-- Ensure date_fin is after date_debut if provided
ALTER TABLE experience_professionnelle 
ADD CONSTRAINT check_experience_dates 
CHECK (date_fin IS NULL OR date_fin >= date_debut);

-- Ensure job title is not empty
ALTER TABLE experience_professionnelle 
ADD CONSTRAINT check_poste_not_empty 
CHECK (TRIM(poste) != '');

-- Ensure company name is not empty
ALTER TABLE experience_professionnelle 
ADD CONSTRAINT check_entreprise_not_empty 
CHECK (TRIM(entreprise) != '');

-- ============================================================================
-- TABLE: formation (Education)
-- ============================================================================

-- Ensure date_fin is after date_debut if provided
ALTER TABLE formation 
ADD CONSTRAINT check_formation_dates 
CHECK (date_fin IS NULL OR date_fin >= date_debut);

-- Ensure diploma is not empty
ALTER TABLE formation 
ADD CONSTRAINT check_diplome_not_empty 
CHECK (TRIM(diplome) != '');

-- Ensure establishment is not empty
ALTER TABLE formation 
ADD CONSTRAINT check_etablissement_not_empty 
CHECK (TRIM(etablissement) != '');

-- ============================================================================
-- TABLE: competence (Skill)
-- ============================================================================

-- Ensure skill name is not empty
ALTER TABLE competence 
ADD CONSTRAINT check_competence_name_not_empty 
CHECK (TRIM(nom) != '');

-- Ensure skill level is valid
ALTER TABLE competence 
ADD CONSTRAINT check_competence_level_valid 
CHECK (niveau IN ('Débutant', 'Intermédiaire', 'Avancé', 'Expert'));

-- ============================================================================
-- TABLE: offre_emploi (Job Offer)
-- ============================================================================

-- Ensure job title is not empty
ALTER TABLE offre_emploi 
ADD CONSTRAINT check_job_title_not_empty 
CHECK (TRIM(titre) != '');

-- Ensure description is not empty
ALTER TABLE offre_emploi 
ADD CONSTRAINT check_job_description_not_empty 
CHECK (TRIM(description) != '');

-- Ensure salary_max is greater than or equal to salary_min
ALTER TABLE offre_emploi 
ADD CONSTRAINT check_salary_range 
CHECK (salaire_min IS NULL OR salaire_max IS NULL OR salaire_max >= salaire_min);

-- Ensure experience_requised is non-negative
ALTER TABLE offre_emploi 
ADD CONSTRAINT check_experience_non_negative 
CHECK (experience_requise IS NULL OR experience_requise >= 0);

-- Ensure date_expiration is after date_publication
ALTER TABLE offre_emploi 
ADD CONSTRAINT check_job_dates 
CHECK (date_expiration IS NULL OR date_expiration > date_publication);

-- Ensure date_publication is not in the future
ALTER TABLE offre_emploi 
ADD CONSTRAINT check_publication_date_past 
CHECK (date_publication <= CURRENT_TIMESTAMP);

-- ============================================================================
-- TABLE: recommandation_offre (Job Recommendation)
-- ============================================================================

-- Ensure score_compatibilite is between 0 and 100 (already in table, but double-check)
ALTER TABLE recommandation_offre 
DROP CONSTRAINT IF EXISTS recommandation_offre_score_compatibilite_check;

ALTER TABLE recommandation_offre 
ADD CONSTRAINT recommandation_offre_score_compatibilite_check 
CHECK (score_compatibilite >= 0 AND score_compatibilite <= 100);

-- ============================================================================
-- TABLE: candidature (Application)
-- ============================================================================

-- Ensure date_candidature is not in the future
ALTER TABLE candidature 
ADD CONSTRAINT check_application_date_past 
CHECK (date_candidature <= CURRENT_TIMESTAMP);

-- ============================================================================
-- TABLE: lettre_motivation (Cover Letter)
-- ============================================================================

-- Ensure content is not empty
ALTER TABLE lettre_motivation 
ADD CONSTRAINT check_cover_letter_content_not_empty 
CHECK (TRIM(contenu) != '');

-- ============================================================================
-- TABLE: session_entretien (Interview Session)
-- ============================================================================

-- Ensure duree is positive if provided
ALTER TABLE session_entretien 
ADD CONSTRAINT check_interview_duration_positive 
CHECK (duree IS NULL OR duree > 0);

-- Ensure date_session is not in the past for scheduled interviews
ALTER TABLE session_entretien 
ADD CONSTRAINT check_interview_date_future 
CHECK (statut != 'SCHEDULED' OR date_session IS NULL OR date_session >= CURRENT_TIMESTAMP);

-- ============================================================================
-- TABLE: question_entretien (Interview Question)
-- ============================================================================

-- Ensure question is not empty
ALTER TABLE question_entretien 
ADD CONSTRAINT check_question_not_empty 
CHECK (TRIM(question) != '');

-- Ensure ordre is positive
ALTER TABLE question_entretien 
ADD CONSTRAINT check_question_order_positive 
CHECK (ordre >= 1);

-- Ensure score is between 0 and 100 if provided (already in table)
ALTER TABLE question_entretien 
DROP CONSTRAINT IF EXISTS question_entretien_score_check;

ALTER TABLE question_entretien 
ADD CONSTRAINT question_entretien_score_check 
CHECK (score IS NULL OR (score >= 0 AND score <= 100));

-- ============================================================================
-- TABLE: feedback_ia (AI Feedback)
-- ============================================================================

-- Ensure score_global is between 0 and 100 (already in table)
ALTER TABLE feedback_ia 
DROP CONSTRAINT IF EXISTS feedback_ia_score_global_check;

ALTER TABLE feedback_ia 
ADD CONSTRAINT feedback_ia_score_global_check 
CHECK (score_global >= 0 AND score_global <= 100);

-- ============================================================================
-- TABLE: notification
-- ============================================================================

-- Ensure title is not empty
ALTER TABLE notification 
ADD CONSTRAINT check_notification_title_not_empty 
CHECK (TRIM(titre) != '');

-- Ensure message is not empty
ALTER TABLE notification 
ADD CONSTRAINT check_notification_message_not_empty 
CHECK (TRIM(message) != '');

-- Ensure date_envoi is not in the future
ALTER TABLE notification 
ADD CONSTRAINT check_notification_date_past 
CHECK (date_envoi <= CURRENT_TIMESTAMP);

-- ============================================================================
-- TABLE: notifications (Django notifications table)
-- ============================================================================

-- Ensure type is valid if provided
ALTER TABLE notifications 
ADD CONSTRAINT check_notifications_type_valid 
CHECK (type IS NULL OR type IN ('APPLICATION', 'INTERVIEW', 'JOB', 'SYSTEM', 'PROFILE'));

-- ============================================================================
-- TABLE: users_groups (Django groups table)
-- ============================================================================

-- No additional constraints needed (UNIQUE already defined in table)

-- ============================================================================
-- TABLE: users_user_permissions (Django permissions table)
-- ============================================================================

-- No additional constraints needed (UNIQUE already defined in table)

-- ============================================================================
-- Verification
-- ============================================================================

-- List all constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name, tc.constraint_name;
