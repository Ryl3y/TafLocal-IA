-- ============================================================================
-- TafLocal AI - Database Functions
-- ============================================================================
-- Description: Create utility functions for database operations
-- Version: 1.0
-- Author: TafLocal AI Database Team
-- Date: 2026-06-28
-- ============================================================================

-- ============================================================================
-- FUNCTION: calculate_recommendation_score
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_recommendation_score(
    p_cv_id UUID,
    p_offre_id UUID
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    v_score DECIMAL(5,2) := 0;
    v_skill_match INTEGER := 0;
    v_total_skills INTEGER := 0;
    v_experience_match DECIMAL(5,2) := 0;
    v_location_match BOOLEAN := FALSE;
    v_cv_ville VARCHAR(100);
    v_offre_localisation VARCHAR(255);
BEGIN
    -- Get CV location
    SELECT ce.ville INTO v_cv_ville
    FROM cv cv
    JOIN chercheur_emploi ce ON cv.candidate_id = ce.id
    WHERE cv.id = p_cv_id;
    
    -- Get job location
    SELECT localisation INTO v_offre_localisation
    FROM offre_emploi
    WHERE id = p_offre_id;
    
    -- Check location match (simple check if city is mentioned in location)
    IF v_cv_ville IS NOT NULL AND v_offre_localisation IS NOT NULL THEN
        v_location_match := v_offre_localisation ILIKE '%' || v_cv_ville || '%';
    END IF;
    
    -- Count matching skills (simplified logic)
    SELECT COUNT(*) INTO v_total_skills
    FROM competence c
    JOIN cv ON c.cv_id = cv.id
    WHERE cv.id = p_cv_id;
    
    -- Base score calculation
    v_score := 50.0; -- Base score
    
    -- Add location bonus
    IF v_location_match THEN
        v_score := v_score + 15.0;
    END IF;
    
    -- Add skill bonus (simplified)
    IF v_total_skills > 0 THEN
        v_score := v_score + LEAST(v_total_skills * 2.0, 25.0);
    END IF;
    
    -- Ensure score is between 0 and 100
    v_score := LEAST(GREATEST(v_score, 0), 100);
    
    RETURN v_score;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_recommendation_score IS 'Calcule le score de compatibilité entre un CV et une offre d''emploi';

-- ============================================================================
-- FUNCTION: archive_expired_jobs
-- ============================================================================
CREATE OR REPLACE FUNCTION archive_expired_jobs()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    -- Update expired jobs to ARCHIVED status
    UPDATE offre_emploi
    SET statut = 'ARCHIVED',
        updated_at = CURRENT_TIMESTAMP
    WHERE statut = 'PUBLISHED'
        AND date_expiration IS NOT NULL
        AND date_expiration < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION archive_expired_jobs IS 'Archive les offres d''emploi expirées';

-- ============================================================================
-- FUNCTION: generate_dashboard_statistics
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_dashboard_statistics(
    p_user_id UUID
)
RETURNS TABLE(
    total_cvs INTEGER,
    total_applications INTEGER,
    pending_applications INTEGER,
    shortlisted_applications INTEGER,
    hired_applications INTEGER,
    total_interviews INTEGER,
    completed_interviews INTEGER,
    unread_notifications INTEGER,
    average_cv_score DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT cv.id),
        COUNT(DISTINCT c.id),
        COUNT(DISTINCT CASE WHEN c.statut = 'PENDING' THEN c.id END),
        COUNT(DISTINCT CASE WHEN c.statut = 'SHORTLISTED' THEN c.id END),
        COUNT(DISTINCT CASE WHEN c.statut = 'HIRED' THEN c.id END),
        COUNT(DISTINCT se.id),
        COUNT(DISTINCT CASE WHEN se.statut = 'COMPLETED' THEN se.id END),
        COUNT(DISTINCT n.id) FILTER (WHERE n.lu = FALSE),
        COALESCE(AVG(ac.score_global), 0)
    FROM utilisateur u
    LEFT JOIN chercheur_emploi ce ON u.id = ce.user_id
    LEFT JOIN cv cv ON ce.id = cv.candidate_id
    LEFT JOIN candidature c ON ce.id = c.candidate_id
    LEFT JOIN session_entretien se ON ce.id = se.candidate_id
    LEFT JOIN notification n ON u.id = n.user_id
    LEFT JOIN analyse_cv ac ON cv.id = ac.cv_id AND ac.statut = 'COMPLETED'
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_dashboard_statistics IS 'Génère les statistiques du tableau de bord pour un utilisateur';

-- ============================================================================
-- FUNCTION: update_updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at IS 'Met à jour automatiquement le champ updated_at';

-- ============================================================================
-- FUNCTION: create_application_notification
-- ============================================================================
CREATE OR REPLACE FUNCTION create_application_notification(
    p_candidature_id UUID,
    p_statut VARCHAR(50)
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
    v_user_id UUID;
    v_titre VARCHAR(255);
    v_message TEXT;
    v_offre_titre VARCHAR(255);
BEGIN
    -- Get candidate user_id and job title
    SELECT c.candidate_id, o.titre INTO v_user_id, v_offre_titre
    FROM candidature c
    JOIN offre_emploi o ON c.offre_id = o.id
    WHERE c.id = p_candidature_id;
    
    -- Create notification title and message
    v_titre := 'Statut de candidature mis à jour';
    v_message := 'Votre candidature pour ' || v_offre_titre || ' est maintenant ' || p_statut;
    
    -- Insert notification
    INSERT INTO notification (user_id, titre, message, type, lu, date_envoi)
    VALUES (v_user_id, v_titre, v_message, 'APPLICATION', FALSE, CURRENT_TIMESTAMP)
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_application_notification IS 'Crée une notification lors du changement de statut d''une candidature';

-- ============================================================================
-- FUNCTION: count_applications
-- ============================================================================
CREATE OR REPLACE FUNCTION count_applications(
    p_offre_id UUID DEFAULT NULL,
    p_candidate_id UUID DEFAULT NULL,
    p_statut VARCHAR(50) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM candidature
    WHERE (p_offre_id IS NULL OR offre_id = p_offre_id)
        AND (p_candidate_id IS NULL OR candidate_id = p_candidate_id)
        AND (p_statut IS NULL OR statut = p_statut);
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION count_applications IS 'Compte les candidatures selon les filtres spécifiés';

-- ============================================================================
-- FUNCTION: get_candidate_skills
-- ============================================================================
CREATE OR REPLACE FUNCTION get_candidate_skills(
    p_candidate_id UUID
)
RETURNS TABLE(
    skill_id UUID,
    skill_name VARCHAR(100),
    skill_level VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.nom,
        c.niveau
    FROM competence c
    JOIN cv cv ON c.cv_id = cv.id
    WHERE cv.candidate_id = p_candidate_id
    ORDER BY c.niveau DESC, c.nom;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_candidate_skills IS 'Récupère les compétences d''un candidat';

-- ============================================================================
-- FUNCTION: get_job_applications_summary
-- ============================================================================
CREATE OR REPLACE FUNCTION get_job_applications_summary(
    p_offre_id UUID
)
RETURNS TABLE(
    total INTEGER,
    pending INTEGER,
    under_review INTEGER,
    shortlisted INTEGER,
    rejected INTEGER,
    hired INTEGER,
    withdrawn INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE statut = 'PENDING'),
        COUNT(*) FILTER (WHERE statut = 'UNDER_REVIEW'),
        COUNT(*) FILTER (WHERE statut = 'SHORTLISTED'),
        COUNT(*) FILTER (WHERE statut = 'REJECTED'),
        COUNT(*) FILTER (WHERE statut = 'HIRED'),
        COUNT(*) FILTER (WHERE statut = 'WITHDRAWN')
    FROM candidature
    WHERE offre_id = p_offre_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_job_applications_summary IS 'Résumé des candidatures pour une offre d''emploi';

-- ============================================================================
-- FUNCTION: mark_notifications_read
-- ============================================================================
CREATE OR REPLACE FUNCTION mark_notifications_read(
    p_user_id UUID,
    p_notification_type VARCHAR(50) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    UPDATE notification
    SET lu = TRUE
    WHERE user_id = p_user_id
        AND lu = FALSE
        AND (p_notification_type IS NULL OR type = p_notification_type);
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_notifications_read IS 'Marque les notifications comme lues';

-- ============================================================================
-- FUNCTION: get_candidate_analyses
-- ============================================================================
CREATE OR REPLACE FUNCTION get_candidate_analyses(
    p_candidate_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    analysis_id UUID,
    cv_id UUID,
    cv_titre VARCHAR(255),
    date_analyse TIMESTAMP WITH TIME ZONE,
    score_global DECIMAL(5,2),
    statut VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.id,
        ac.cv_id,
        cv.titre,
        ac.date_analyse,
        ac.score_global,
        ac.statut
    FROM analyse_cv ac
    JOIN cv cv ON ac.cv_id = cv.id
    WHERE cv.candidate_id = p_candidate_id
    ORDER BY ac.date_analyse DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_candidate_analyses IS 'Récupère les analyses de CV d''un candidat';

-- ============================================================================
-- FUNCTION: get_top_recommendations
-- ============================================================================
CREATE OR REPLACE FUNCTION get_top_recommendations(
    p_candidate_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    recommendation_id UUID,
    job_id UUID,
    job_titre VARCHAR(255),
    company_name VARCHAR(255),
    score_compatibilite DECIMAL(5,2),
    explication TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ro.id,
        ro.offre_id,
        o.titre,
        e.nom_entreprise,
        ro.score_compatibilite,
        ro.explication
    FROM recommandation_offre ro
    JOIN analyse_cv ac ON ro.analyse_cv_id = ac.id
    JOIN cv cv ON ac.cv_id = cv.id
    JOIN offre_emploi o ON ro.offre_id = o.id
    JOIN entreprise e ON o.entreprise_id = e.id
    WHERE cv.candidate_id = p_candidate_id
        AND o.statut = 'PUBLISHED'
    ORDER BY ro.score_compatibilite DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_top_recommendations IS 'Récupère les meilleures recommandations d''emploi pour un candidat';

-- ============================================================================
-- FUNCTION: hash_password
-- ============================================================================
CREATE OR REPLACE FUNCTION hash_password(
    p_password TEXT
)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(p_password, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION hash_password IS 'Hash un mot de passe avec SHA256';

-- ============================================================================
-- FUNCTION: verify_password
-- ============================================================================
CREATE OR REPLACE FUNCTION verify_password(
    p_password TEXT,
    p_hash TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN encode(digest(p_password, 'sha256'), 'hex') = p_hash;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION verify_password IS 'Vérifie si un mot de passe correspond au hash';

-- ============================================================================
-- Verification
-- ============================================================================

-- List all functions
SELECT 
    routine_name,
    routine_type,
    data_type,
    external_language
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
ORDER BY routine_name;
