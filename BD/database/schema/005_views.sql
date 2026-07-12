-- ============================================================================
-- TafLocal AI - Database Views
-- ============================================================================
-- Description: Create views for dashboard and reporting
-- Version: 1.0
-- Author: TafLocal AI Database Team
-- Date: 2026-06-28
-- ============================================================================

-- ============================================================================
-- VIEW: v_candidate_dashboard
-- ============================================================================
CREATE OR REPLACE VIEW v_candidate_dashboard AS
SELECT 
    u.id AS user_id,
    u.nom,
    u.prenom,
    u.email,
    ce.id AS candidate_id,
    ce.ville,
    ce.photo,
    ce.linkedin,
    COUNT(DISTINCT cv.id) AS total_cvs,
    COUNT(DISTINCT CASE WHEN cv.is_default = TRUE THEN cv.id END) AS default_cv_count,
    COUNT(DISTINCT c.id) AS total_applications,
    COUNT(DISTINCT CASE WHEN c.statut = 'PENDING' THEN c.id END) AS pending_applications,
    COUNT(DISTINCT CASE WHEN c.statut = 'SHORTLISTED' THEN c.id END) AS shortlisted_applications,
    COUNT(DISTINCT CASE WHEN c.statut = 'HIRED' THEN c.id END) AS hired_applications,
    COUNT(DISTINCT se.id) AS total_interviews,
    COUNT(DISTINCT CASE WHEN se.statut = 'COMPLETED' THEN se.id END) AS completed_interviews,
    COUNT(DISTINCT n.id) FILTER (WHERE n.lu = FALSE) AS unread_notifications,
    COALESCE(AVG(ac.score_global), 0) AS average_cv_score
FROM utilisateur u
LEFT JOIN chercheur_emploi ce ON u.id = ce.user_id
LEFT JOIN cv cv ON ce.id = cv.candidate_id
LEFT JOIN candidature c ON ce.id = c.candidate_id
LEFT JOIN session_entretien se ON ce.id = se.candidate_id
LEFT JOIN notification n ON u.id = n.user_id
LEFT JOIN analyse_cv ac ON cv.id = ac.cv_id AND ac.statut = 'COMPLETED'
WHERE u.role = 'CANDIDATE' AND u.is_active = TRUE
GROUP BY u.id, u.nom, u.prenom, u.email, ce.id, ce.ville, ce.photo, ce.linkedin;

COMMENT ON VIEW v_candidate_dashboard IS 'Vue du tableau de bord des candidats';

-- ============================================================================
-- VIEW: v_company_dashboard
-- ============================================================================
CREATE OR REPLACE VIEW v_company_dashboard AS
SELECT 
    u.id AS user_id,
    u.nom,
    u.prenom,
    u.email,
    e.id AS company_id,
    e.nom_entreprise,
    e.secteur,
    e.ville,
    e.logo,
    e.verified,
    COUNT(DISTINCT o.id) AS total_job_offers,
    COUNT(DISTINCT CASE WHEN o.statut = 'PUBLISHED' THEN o.id END) AS active_job_offers,
    COUNT(DISTINCT CASE WHEN o.statut = 'CLOSED' THEN o.id END) AS closed_job_offers,
    COUNT(DISTINCT CASE WHEN o.statut = 'EXPIRED' THEN o.id END) AS expired_job_offers,
    COUNT(DISTINCT c.id) AS total_applications,
    COUNT(DISTINCT CASE WHEN c.statut = 'PENDING' THEN c.id END) AS pending_applications,
    COUNT(DISTINCT CASE WHEN c.statut = 'SHORTLISTED' THEN c.id END) AS shortlisted_applications,
    COUNT(DISTINCT CASE WHEN c.statut = 'HIRED' THEN c.id END) AS hired_applications,
    COUNT(DISTINCT n.id) FILTER (WHERE n.lu = FALSE) AS unread_notifications
FROM utilisateur u
LEFT JOIN entreprise e ON u.id = e.user_id
LEFT JOIN offre_emploi o ON e.id = o.entreprise_id
LEFT JOIN candidature c ON o.id = c.offre_id
LEFT JOIN notification n ON u.id = n.user_id
WHERE u.role = 'COMPANY' AND u.is_active = TRUE
GROUP BY u.id, u.nom, u.prenom, u.email, e.id, e.nom_entreprise, e.secteur, e.ville, e.logo, e.verified;

COMMENT ON VIEW v_company_dashboard IS 'Vue du tableau de bord des entreprises';

-- ============================================================================
-- VIEW: v_admin_dashboard
-- ============================================================================
CREATE OR REPLACE VIEW v_admin_dashboard AS
SELECT 
    u.id AS user_id,
    u.nom,
    u.prenom,
    u.email,
    COUNT(DISTINCT CASE WHEN u.role = 'CANDIDATE' THEN u.id END) AS total_candidates,
    COUNT(DISTINCT CASE WHEN u.role = 'COMPANY' THEN u.id END) AS total_companies,
    COUNT(DISTINCT CASE WHEN u.role = 'ADMIN' THEN u.id END) AS total_admins,
    COUNT(DISTINCT o.id) AS total_job_offers,
    COUNT(DISTINCT CASE WHEN o.statut = 'PUBLISHED' THEN o.id END) AS active_job_offers,
    COUNT(DISTINCT c.id) AS total_applications,
    COUNT(DISTINCT cv.id) AS total_cvs,
    COUNT(DISTINCT ac.id) AS total_cv_analyses,
    COUNT(DISTINCT se.id) AS total_interviews,
    COUNT(DISTINCT n.id) FILTER (WHERE n.lu = FALSE) AS unread_notifications
FROM utilisateur u
CROSS JOIN offre_emploi o
CROSS JOIN candidature c
CROSS JOIN cv
CROSS JOIN analyse_cv ac
CROSS JOIN session_entretien se
CROSS JOIN notification n
WHERE u.role = 'ADMIN' AND u.is_active = TRUE
GROUP BY u.id, u.nom, u.prenom, u.email;

COMMENT ON VIEW v_admin_dashboard IS 'Vue du tableau de bord des administrateurs';

-- ============================================================================
-- VIEW: v_unread_notifications
-- ============================================================================
CREATE OR REPLACE VIEW v_unread_notifications AS
SELECT 
    n.id,
    n.user_id,
    u.nom AS user_nom,
    u.prenom AS user_prenom,
    u.email AS user_email,
    n.titre,
    n.message,
    n.type,
    n.date_envoi
FROM notification n
JOIN utilisateur u ON n.user_id = u.id
WHERE n.lu = FALSE
ORDER BY n.date_envoi DESC;

COMMENT ON VIEW v_unread_notifications IS 'Vue des notifications non lues';

-- ============================================================================
-- VIEW: v_recent_analyses
-- ============================================================================
CREATE OR REPLACE VIEW v_recent_analyses AS
SELECT 
    ac.id AS analysis_id,
    ac.cv_id,
    cv.titre AS cv_titre,
    cv.candidate_id,
    ce.user_id,
    u.nom AS candidate_nom,
    u.prenom AS candidate_prenom,
    ac.date_analyse,
    ac.score_global,
    ac.statut,
    ac.resume
FROM analyse_cv ac
JOIN cv cv ON ac.cv_id = cv.id
JOIN chercheur_emploi ce ON cv.candidate_id = ce.id
JOIN utilisateur u ON ce.user_id = u.id
ORDER BY ac.date_analyse DESC;

COMMENT ON VIEW v_recent_analyses IS 'Vue des analyses de CV récentes';

-- ============================================================================
-- VIEW: v_interview_statistics
-- ============================================================================
CREATE OR REPLACE VIEW v_interview_statistics AS
SELECT 
    se.id AS session_id,
    se.candidate_id,
    ce.user_id,
    u.nom AS candidate_nom,
    u.prenom AS candidate_prenom,
    se.offre_id,
    o.titre AS job_titre,
    e.nom_entreprise AS company_name,
    se.date_session,
    se.type_entretien,
    se.duree,
    se.statut,
    se.score_global,
    COUNT(q.id) AS total_questions,
    COALESCE(AVG(q.score), 0) AS average_question_score,
    f.id AS feedback_id,
    f.points_forts,
    f.points_faibles,
    f.conseils
FROM session_entretien se
JOIN chercheur_emploi ce ON se.candidate_id = ce.id
JOIN utilisateur u ON ce.user_id = u.id
LEFT JOIN offre_emploi o ON se.offre_id = o.id
LEFT JOIN entreprise e ON o.entreprise_id = e.id
LEFT JOIN question_entretien q ON se.id = q.idx_question_session_entretien_id
LEFT JOIN feedback_ia f ON se.id = f.idx_question_session_entretien_id
GROUP BY se.id, ce.id, u.id, o.id, e.id, f.id
ORDER BY se.date_session DESC;

COMMENT ON VIEW v_interview_statistics IS 'Vue des statistiques d''entretien';

-- ============================================================================
-- VIEW: v_top_recommended_jobs
-- ============================================================================
CREATE OR REPLACE VIEW v_top_recommended_jobs AS
SELECT 
    ro.id AS recommendation_id,
    ro.analyse_cv_id,
    ac.cv_id,
    cv.titre AS cv_titre,
    cv.candidate_id,
    ce.user_id,
    u.nom AS candidate_nom,
    u.prenom AS candidate_prenom,
    ro.offre_id,
    o.titre AS job_titre,
    o.description AS job_description,
    o.localisation,
    o.type_contrat,
    o.salaire_min,
    o.salaire_max,
    o.devise,
    e.nom_entreprise AS company_name,
    e.secteur,
    ro.score_compatibilite,
    ro.explication,
    ro.date_recommandation
FROM recommandation_offre ro
JOIN analyse_cv ac ON ro.analyse_cv_id = ac.id
JOIN cv cv ON ac.cv_id = cv.id
JOIN chercheur_emploi ce ON cv.candidate_id = ce.id
JOIN utilisateur u ON ce.user_id = u.id
JOIN offre_emploi o ON ro.offre_id = o.id
JOIN entreprise e ON o.entreprise_id = e.id
WHERE o.statut = 'PUBLISHED'
ORDER BY ro.score_compatibilite DESC, ro.date_recommandation DESC;

COMMENT ON VIEW v_top_recommended_jobs IS 'Vue des emplois les plus recommandés';

-- ============================================================================
-- VIEW: v_applications_statistics
-- ============================================================================
CREATE OR REPLACE VIEW v_applications_statistics AS
SELECT 
    c.id AS application_id,
    c.candidate_id,
    ce.user_id AS candidate_user_id,
    u.nom AS candidate_nom,
    u.prenom AS candidate_prenom,
    u.email AS candidate_email,
    c.offre_id,
    o.titre AS job_titre,
    o.description AS job_description,
    o.localisation,
    o.type_contrat,
    o.salaire_min,
    o.salaire_max,
    e.nom_entreprise AS company_name,
    e.secteur,
    c.date_candidature,
    c.statut,
    c.commentaire,
    lm.id AS cover_letter_id,
    lm.generated_by_ai,
    CURRENT_DATE - c.date_candidature::date AS days_since_application
FROM candidature c
JOIN chercheur_emploi ce ON c.candidate_id = ce.id
JOIN utilisateur u ON ce.user_id = u.id
JOIN offre_emploi o ON c.offre_id = o.id
JOIN entreprise e ON o.entreprise_id = e.id
LEFT JOIN lettre_motivation lm ON c.id = lm.candidature_id
ORDER BY c.date_candidature DESC;

COMMENT ON VIEW v_applications_statistics IS 'Vue des statistiques de candidatures';

-- ============================================================================
-- VIEW: v_active_job_offers
-- ============================================================================
CREATE OR REPLACE VIEW v_active_job_offers AS
SELECT 
    o.id AS job_id,
    o.titre,
    o.description,
    o.localisation,
    o.type_contrat,
    o.salaire_min,
    o.salaire_max,
    o.devise,
    o.experience_requise,
    o.niveau_etude,
    o.date_publication,
    o.date_expiration,
    e.id AS company_id,
    e.nom_entreprise,
    e.secteur,
    e.ville,
    e.logo,
    e.verified,
    COUNT(DISTINCT c.id) AS application_count,
    COUNT(DISTINCT CASE WHEN c.statut = 'PENDING' THEN c.id END) AS pending_count,
    COUNT(DISTINCT CASE WHEN c.statut = 'SHORTLISTED' THEN c.id END) AS shortlisted_count,
    COUNT(DISTINCT CASE WHEN c.statut = 'HIRED' THEN c.id END) AS hired_count
FROM offre_emploi o
JOIN entreprise e ON o.entreprise_id = e.id
LEFT JOIN candidature c ON o.id = c.offre_id
WHERE o.statut = 'PUBLISHED' 
    AND (o.date_expiration IS NULL OR o.date_expiration > CURRENT_TIMESTAMP)
GROUP BY o.id, o.titre, o.description, o.localisation, o.type_contrat, 
         o.salaire_min, o.salaire_max, o.devise, o.experience_requise, 
         o.niveau_etude, o.date_publication, o.date_expiration, 
         e.id, e.nom_entreprise, e.secteur, e.ville, e.logo, e.verified
ORDER BY o.date_publication DESC;

COMMENT ON VIEW v_active_job_offers IS 'Vue des offres d''emploi actives';

-- ============================================================================
-- VIEW: v_candidate_profile_complete
-- ============================================================================
CREATE OR REPLACE VIEW v_candidate_profile_complete AS
SELECT 
    ce.id AS candidate_id,
    ce.user_id,
    u.nom,
    u.prenom,
    u.email,
    u.telephone,
    ce.date_naissance,
    ce.genre,
    ce.adresse,
    ce.ville,
    ce.photo,
    ce.biographie,
    ce.linkedin,
    ce.github,
    ce.portfolio,
    COUNT(DISTINCT cv.id) AS cv_count,
    COUNT(DISTINCT exp.id) AS experience_count,
    COUNT(DISTINCT form.id) AS education_count,
    COUNT(DISTINCT comp.id) AS skill_count,
    COUNT(DISTINCT ac.id) AS analysis_count,
    CASE 
        WHEN COUNT(DISTINCT cv.id) > 0 
            AND COUNT(DISTINCT exp.id) > 0 
            AND COUNT(DISTINCT form.id) > 0 
            AND COUNT(DISTINCT comp.id) > 0 
            AND ce.biographie IS NOT NULL 
            AND TRIM(ce.biographie) != ''
        THEN TRUE
        ELSE FALSE
    END AS profile_complete
FROM chercheur_emploi ce
JOIN utilisateur u ON ce.user_id = u.id
LEFT JOIN cv cv ON ce.id = cv.candidate_id
LEFT JOIN experience_professionnelle exp ON cv.id = exp.cv_id
LEFT JOIN formation form ON cv.id = form.cv_id
LEFT JOIN competence comp ON cv.id = comp.cv_id
LEFT JOIN analyse_cv ac ON cv.id = ac.cv_id
GROUP BY ce.id, ce.user_id, u.nom, u.prenom, u.email, u.telephone, 
         ce.date_naissance, ce.genre, ce.adresse, ce.ville, ce.photo, 
         ce.biographie, ce.linkedin, ce.github, ce.portfolio;

COMMENT ON VIEW v_candidate_profile_complete IS 'Vue des profils candidats complets avec indicateur de complétude';

-- ============================================================================
-- Verification
-- ============================================================================

-- List all views
SELECT 
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;
