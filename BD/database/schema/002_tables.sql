-- ============================================================================
-- TafLocal AI - Database Tables
-- ============================================================================
-- Description: Create all tables for TafLocal AI database
-- Version: 1.0
-- Author: TafLocal AI Database Team
-- Date: 2026-06-28
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM ('ADMIN', 'CANDIDATE', 'COMPANY');

-- Application status
CREATE TYPE application_status AS ENUM ('PENDING', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'HIRED', 'WITHDRAWN');

-- Job contract type
CREATE TYPE contract_type AS ENUM ('CDI', 'CDD', 'FREELANCE', 'INTERNSHIP', 'APPRENTICESHIP');

-- Job status
CREATE TYPE job_status AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED', 'EXPIRED');

-- CV analysis status
CREATE TYPE analysis_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'NO_OFFERS');

-- Interview type
CREATE TYPE interview_type AS ENUM ('TECHNICAL', 'BEHAVIORAL', 'MIXED', 'HR');

-- Interview status
CREATE TYPE interview_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED');

-- Question type
CREATE TYPE question_type AS ENUM ('OPEN', 'MULTIPLE_CHOICE', 'CODE', 'BEHAVIORAL');

-- Notification type
CREATE TYPE notification_type AS ENUM ('APPLICATION', 'INTERVIEW', 'JOB', 'SYSTEM', 'PROFILE');

-- ============================================================================
-- TABLE: utilisateur (User)
-- ============================================================================
CREATE TABLE utilisateur (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    date_inscription TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    nombre_connexions INTEGER NOT NULL DEFAULT 0 CHECK (nombre_connexions >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    role user_role NOT NULL DEFAULT 'CANDIDATE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(150) UNIQUE,
    is_staff BOOLEAN DEFAULT FALSE,
    date_joined TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE utilisateur IS 'Table des utilisateurs du système';
COMMENT ON COLUMN utilisateur.id IS 'Identifiant unique de l''utilisateur (UUID)';
COMMENT ON COLUMN utilisateur.nom IS 'Nom de famille de l''utilisateur';
COMMENT ON COLUMN utilisateur.prenom IS 'Prénom de l''utilisateur';
COMMENT ON COLUMN utilisateur.email IS 'Adresse email unique de l''utilisateur';
COMMENT ON COLUMN utilisateur.mot_de_passe IS 'Mot de passe hashé de l''utilisateur';
COMMENT ON COLUMN utilisateur.telephone IS 'Numéro de téléphone de l''utilisateur';
COMMENT ON COLUMN utilisateur.date_inscription IS 'Date d''inscription de l''utilisateur';
COMMENT ON COLUMN utilisateur.nombre_connexions IS 'Sessions ouvertes (inscription comprise) : 1 = première visite';
COMMENT ON COLUMN utilisateur.is_active IS 'Indicateur d''activation du compte';
COMMENT ON COLUMN utilisateur.role IS 'Rôle de l''utilisateur (ADMIN, CANDIDATE, COMPANY)';
COMMENT ON COLUMN utilisateur.created_at IS 'Date de création de l''enregistrement';
COMMENT ON COLUMN utilisateur.updated_at IS 'Date de dernière mise à jour de l''enregistrement';
COMMENT ON COLUMN utilisateur.username IS 'Username pour compatibilité Django';
COMMENT ON COLUMN utilisateur.is_staff IS 'Indicateur staff Django';
COMMENT ON COLUMN utilisateur.date_joined IS 'Date de jointure Django';

-- ============================================================================
-- TABLE: chercheur_emploi (Candidate)
-- ============================================================================
CREATE TABLE chercheur_emploi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date_naissance DATE,
    genre VARCHAR(20),
    adresse TEXT,
    ville VARCHAR(100),
    photo TEXT,
    biographie TEXT,
    linkedin TEXT,
    github TEXT,
    portfolio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_candidate_user UNIQUE (user_id)
);

COMMENT ON TABLE chercheur_emploi IS 'Table des profils de chercheurs d''emploi (candidats)';
COMMENT ON COLUMN chercheur_emploi.id IS 'Identifiant unique du candidat (UUID)';
COMMENT ON COLUMN chercheur_emploi.user_id IS 'Référence vers l''utilisateur associé';
COMMENT ON COLUMN chercheur_emploi.date_naissance IS 'Date de naissance du candidat';
COMMENT ON COLUMN chercheur_emploi.genre IS 'Genre du candidat';
COMMENT ON COLUMN chercheur_emploi.adresse IS 'Adresse postale du candidat';
COMMENT ON COLUMN chercheur_emploi.ville IS 'Ville de résidence du candidat';
COMMENT ON COLUMN chercheur_emploi.photo IS 'URL de la photo de profil du candidat';
COMMENT ON COLUMN chercheur_emploi.biographie IS 'Biographie du candidat';
COMMENT ON COLUMN chercheur_emploi.linkedin IS 'URL du profil LinkedIn du candidat';
COMMENT ON COLUMN chercheur_emploi.github IS 'URL du profil GitHub du candidat';
COMMENT ON COLUMN chercheur_emploi.portfolio IS 'URL du portfolio du candidat';

-- ============================================================================
-- TABLE: entreprise (Company)
-- ============================================================================
CREATE TABLE entreprise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    nom_entreprise VARCHAR(255) NOT NULL,
    secteur VARCHAR(100),
    description TEXT,
    site_web TEXT,
    adresse TEXT,
    ville VARCHAR(100),
    telephone VARCHAR(20),
    logo TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_company_user UNIQUE (user_id)
);

COMMENT ON TABLE entreprise IS 'Table des profils d''entreprises';
COMMENT ON COLUMN entreprise.id IS 'Identifiant unique de l''entreprise (UUID)';
COMMENT ON COLUMN entreprise.user_id IS 'Référence vers l''utilisateur associé';
COMMENT ON COLUMN entreprise.nom_entreprise IS 'Nom de l''entreprise';
COMMENT ON COLUMN entreprise.secteur IS 'Secteur d''activité de l''entreprise';
COMMENT ON COLUMN entreprise.description IS 'Description de l''entreprise';
COMMENT ON COLUMN entreprise.site_web IS 'Site web de l''entreprise';
COMMENT ON COLUMN entreprise.adresse IS 'Adresse postale de l''entreprise';
COMMENT ON COLUMN entreprise.ville IS 'Ville de l''entreprise';
COMMENT ON COLUMN entreprise.telephone IS 'Numéro de téléphone de l''entreprise';
COMMENT ON COLUMN entreprise.logo IS 'URL du logo de l''entreprise';
COMMENT ON COLUMN entreprise.verified IS 'Indicateur de vérification de l''entreprise';

-- ============================================================================
-- TABLE: cv
-- ============================================================================
CREATE TABLE cv (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES chercheur_emploi(id) ON DELETE CASCADE,
    titre VARCHAR(255) NOT NULL,
    fichier_pdf TEXT NOT NULL,
    date_import TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE cv IS 'Table des CV des candidats';
COMMENT ON COLUMN cv.id IS 'Identifiant unique du CV (UUID)';
COMMENT ON COLUMN cv.candidate_id IS 'Référence vers le candidat propriétaire';
COMMENT ON COLUMN cv.titre IS 'Titre du CV';
COMMENT ON COLUMN cv.fichier_pdf IS 'URL du fichier PDF du CV';
COMMENT ON COLUMN cv.date_import IS 'Date d''import du CV';
COMMENT ON COLUMN cv.version IS 'Version du CV';
COMMENT ON COLUMN cv.is_default IS 'Indicateur si c''est le CV par défaut';

-- ============================================================================
-- TABLE: experience_professionnelle (Work Experience)
-- ============================================================================
CREATE TABLE experience_professionnelle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cv_id UUID NOT NULL REFERENCES cv(id) ON DELETE CASCADE,
    poste VARCHAR(255) NOT NULL,
    entreprise VARCHAR(255) NOT NULL,
    description TEXT,
    date_debut DATE NOT NULL,
    date_fin DATE
);

COMMENT ON TABLE experience_professionnelle IS 'Table des expériences professionnelles';
COMMENT ON COLUMN experience_professionnelle.id IS 'Identifiant unique de l''expérience (UUID)';
COMMENT ON COLUMN experience_professionnelle.cv_id IS 'Référence vers le CV associé';
COMMENT ON COLUMN experience_professionnelle.poste IS 'Poste occupé';
COMMENT ON COLUMN experience_professionnelle.entreprise IS 'Nom de l''entreprise';
COMMENT ON COLUMN experience_professionnelle.description IS 'Description des responsabilités';
COMMENT ON COLUMN experience_professionnelle.date_debut IS 'Date de début de l''expérience';
COMMENT ON COLUMN experience_professionnelle.date_fin IS 'Date de fin de l''expérience (NULL si en cours)';

-- ============================================================================
-- TABLE: formation (Education)
-- ============================================================================
CREATE TABLE formation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cv_id UUID NOT NULL REFERENCES cv(id) ON DELETE CASCADE,
    diplome VARCHAR(255) NOT NULL,
    etablissement VARCHAR(255) NOT NULL,
    description TEXT,
    date_debut DATE NOT NULL,
    date_fin DATE
);

COMMENT ON TABLE formation IS 'Table des formations académiques';
COMMENT ON COLUMN formation.id IS 'Identifiant unique de la formation (UUID)';
COMMENT ON COLUMN formation.cv_id IS 'Référence vers le CV associé';
COMMENT ON COLUMN formation.diplome IS 'Nom du diplôme obtenu';
COMMENT ON COLUMN formation.etablissement IS 'Nom de l''établissement';
COMMENT ON COLUMN formation.description IS 'Description de la formation';
COMMENT ON COLUMN formation.date_debut IS 'Date de début de la formation';
COMMENT ON COLUMN formation.date_fin IS 'Date de fin de la formation';

-- ============================================================================
-- TABLE: competence (Skill)
-- ============================================================================
CREATE TABLE competence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cv_id UUID NOT NULL REFERENCES cv(id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    niveau VARCHAR(50) NOT NULL
);

COMMENT ON TABLE competence IS 'Table des compétences';
COMMENT ON COLUMN competence.id IS 'Identifiant unique de la compétence (UUID)';
COMMENT ON COLUMN competence.cv_id IS 'Référence vers le CV associé';
COMMENT ON COLUMN competence.nom IS 'Nom de la compétence';
COMMENT ON COLUMN competence.niveau IS 'Niveau de maîtrise (Débutant, Intermédiaire, Avancé, Expert)';

-- ============================================================================
-- TABLE: analyse_cv (CV Analysis)
-- ============================================================================
CREATE TABLE analyse_cv (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cv_id UUID NOT NULL REFERENCES cv(id) ON DELETE CASCADE,
    date_analyse TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    score_global DECIMAL(5,2) CHECK (score_global >= 0 AND score_global <= 100),
    resume TEXT,
    statut analysis_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE analyse_cv IS 'Table des analyses de CV par IA';
COMMENT ON COLUMN analyse_cv.id IS 'Identifiant unique de l''analyse (UUID)';
COMMENT ON COLUMN analyse_cv.cv_id IS 'Référence vers le CV analysé';
COMMENT ON COLUMN analyse_cv.date_analyse IS 'Date de l''analyse';
COMMENT ON COLUMN analyse_cv.score_global IS 'Score global de l''employabilité (0-100)';
COMMENT ON COLUMN analyse_cv.resume IS 'Résumé de l''analyse';
COMMENT ON COLUMN analyse_cv.statut IS 'Statut de l''analyse';

-- ============================================================================
-- TABLE: offre_emploi (Job Offer)
-- ============================================================================
CREATE TABLE offre_emploi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entreprise_id UUID NOT NULL REFERENCES entreprise(id) ON DELETE CASCADE,
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    localisation VARCHAR(255),
    type_contrat contract_type NOT NULL,
    salaire_min DECIMAL(10,2),
    salaire_max DECIMAL(10,2),
    devise VARCHAR(10) DEFAULT 'XAF',
    experience_requise INTEGER,
    niveau_etude VARCHAR(100),
    date_publication TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_expiration TIMESTAMP WITH TIME ZONE,
    statut job_status DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE offre_emploi IS 'Table des offres d''emploi';
COMMENT ON COLUMN offre_emploi.id IS 'Identifiant unique de l''offre (UUID)';
COMMENT ON COLUMN offre_emploi.entreprise_id IS 'Référence vers l''entreprise publiatrice';
COMMENT ON COLUMN offre_emploi.titre IS 'Titre du poste';
COMMENT ON COLUMN offre_emploi.description IS 'Description détaillée du poste';
COMMENT ON COLUMN offre_emploi.localisation IS 'Localisation du poste';
COMMENT ON COLUMN offre_emploi.type_contrat IS 'Type de contrat (CDI, CDD, FREELANCE, etc.)';
COMMENT ON COLUMN offre_emploi.salaire_min IS 'Salaire minimum proposé';
COMMENT ON COLUMN offre_emploi.salaire_max IS 'Salaire maximum proposé';
COMMENT ON COLUMN offre_emploi.devise IS 'Devise du salaire';
COMMENT ON COLUMN offre_emploi.experience_requise IS 'Années d''expérience requises';
COMMENT ON COLUMN offre_emploi.niveau_etude IS 'Niveau d''études requis';
COMMENT ON COLUMN offre_emploi.date_publication IS 'Date de publication de l''offre';
COMMENT ON COLUMN offre_emploi.date_expiration IS 'Date d''expiration de l''offre';
COMMENT ON COLUMN offre_emploi.statut IS 'Statut de l''offre';

-- ============================================================================
-- TABLE: recommandation_offre (Job Recommendation)
-- ============================================================================
CREATE TABLE recommandation_offre (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analyse_cv_id UUID NOT NULL REFERENCES analyse_cv(id) ON DELETE CASCADE,
    offre_id UUID NOT NULL REFERENCES offre_emploi(id) ON DELETE CASCADE,
    score_compatibilite DECIMAL(5,2) CHECK (score_compatibilite >= 0 AND score_compatibilite <= 100),
    explication TEXT,
    date_recommandation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_recommendation UNIQUE (analyse_cv_id, offre_id)
);

COMMENT ON TABLE recommandation_offre IS 'Table des recommandations d''emploi';
COMMENT ON COLUMN recommandation_offre.id IS 'Identifiant unique de la recommandation (UUID)';
COMMENT ON COLUMN recommandation_offre.analyse_cv_id IS 'Référence vers l''analyse de CV';
COMMENT ON COLUMN recommandation_offre.offre_id IS 'Référence vers l''offre recommandée';
COMMENT ON COLUMN recommandation_offre.score_compatibilite IS 'Score de compatibilité (0-100)';
COMMENT ON COLUMN recommandation_offre.explication IS 'Explication de la recommandation';
COMMENT ON COLUMN recommandation_offre.date_recommandation IS 'Date de la recommandation';

-- ============================================================================
-- TABLE: candidature (Application)
-- ============================================================================
CREATE TABLE candidature (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES chercheur_emploi(id) ON DELETE CASCADE,
    offre_id UUID NOT NULL REFERENCES offre_emploi(id) ON DELETE CASCADE,
    date_candidature TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    statut application_status DEFAULT 'PENDING',
    commentaire TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_application UNIQUE (candidate_id, offre_id)
);

COMMENT ON TABLE candidature IS 'Table des candidatures aux offres d''emploi';
COMMENT ON COLUMN candidature.id IS 'Identifiant unique de la candidature (UUID)';
COMMENT ON COLUMN candidature.candidate_id IS 'Référence vers le candidat';
COMMENT ON COLUMN candidature.offre_id IS 'Référence vers l''offre d''emploi';
COMMENT ON COLUMN candidature.date_candidature IS 'Date de la candidature';
COMMENT ON COLUMN candidature.statut IS 'Statut de la candidature';
COMMENT ON COLUMN candidature.commentaire IS 'Commentaire du candidat';

-- ============================================================================
-- TABLE: lettre_motivation (Cover Letter)
-- ============================================================================
CREATE TABLE lettre_motivation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidature_id UUID NOT NULL REFERENCES candidature(id) ON DELETE CASCADE,
    contenu TEXT NOT NULL,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    generated_by_ai BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_cover_letter UNIQUE (candidature_id)
);

COMMENT ON TABLE lettre_motivation IS 'Table des lettres de motivation';
COMMENT ON COLUMN lettre_motivation.id IS 'Identifiant unique de la lettre (UUID)';
COMMENT ON COLUMN lettre_motivation.candidature_id IS 'Référence vers la candidature';
COMMENT ON COLUMN lettre_motivation.contenu IS 'Contenu de la lettre de motivation';
COMMENT ON COLUMN lettre_motivation.date_creation IS 'Date de création de la lettre';
COMMENT ON COLUMN lettre_motivation.generated_by_ai IS 'Indicateur si générée par IA';

-- ============================================================================
-- TABLE: session_entretien (Interview Session)
-- ============================================================================
CREATE TABLE session_entretien (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES chercheur_emploi(id) ON DELETE CASCADE,
    offre_id UUID REFERENCES offre_emploi(id) ON DELETE SET NULL,
    date_session TIMESTAMP WITH TIME ZONE,
    type_entretien interview_type DEFAULT 'MIXED',
    duree INTEGER,
    score_global DECIMAL(5,2) CHECK (score_global >= 0 AND score_global <= 100),
    statut interview_status DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE session_entretien IS 'Table des sessions d''entretien';
COMMENT ON COLUMN session_entretien.id IS 'Identifiant unique de la session (UUID)';
COMMENT ON COLUMN session_entretien.candidate_id IS 'Référence vers le candidat';
COMMENT ON COLUMN session_entretien.offre_id IS 'Référence vers l''offre d''emploi (optionnel)';
COMMENT ON COLUMN session_entretien.date_session IS 'Date de la session';
COMMENT ON COLUMN session_entretien.type_entretien IS 'Type d''entretien';
COMMENT ON COLUMN session_entretien.duree IS 'Durée en minutes';
COMMENT ON COLUMN session_entretien.score_global IS 'Score global de la session';
COMMENT ON COLUMN session_entretien.statut IS 'Statut de la session';

-- ============================================================================
-- TABLE: question_entretien (Interview Question)
-- ============================================================================
CREATE TABLE question_entretien (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idx_question_session_entretien_id UUID NOT NULL REFERENCES session_entretien(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    type_question question_type DEFAULT 'OPEN',
    reponse TEXT,
    score DECIMAL(5,2) CHECK (score >= 0 AND score <= 100),
    ordre INTEGER NOT NULL
);

COMMENT ON TABLE question_entretien IS 'Table des questions d''entretien';
COMMENT ON COLUMN question_entretien.id IS 'Identifiant unique de la question (UUID)';
COMMENT ON COLUMN question_entretien.idx_question_session_entretien_id IS 'Référence vers la session d''entretien';
COMMENT ON COLUMN question_entretien.question IS 'Texte de la question';
COMMENT ON COLUMN question_entretien.type_question IS 'Type de question';
COMMENT ON COLUMN question_entretien.reponse IS 'Réponse du candidat';
COMMENT ON COLUMN question_entretien.score IS 'Score attribué à la réponse';
COMMENT ON COLUMN question_entretien.ordre IS 'Ordre de la question dans la session';

-- ============================================================================
-- TABLE: feedback_ia (AI Feedback)
-- ============================================================================
CREATE TABLE feedback_ia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idx_question_session_entretien_id UUID NOT NULL REFERENCES session_entretien(id) ON DELETE CASCADE,
    score_global DECIMAL(5,2) CHECK (score_global >= 0 AND score_global <= 100),
    points_forts TEXT[],
    points_faibles TEXT[],
    conseils TEXT[],
    date_feedback TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_feedback UNIQUE (idx_question_session_entretien_id)
);

COMMENT ON TABLE feedback_ia IS 'Table des feedbacks IA des entretiens';
COMMENT ON COLUMN feedback_ia.id IS 'Identifiant unique du feedback (UUID)';
COMMENT ON COLUMN feedback_ia.idx_question_session_entretien_id IS 'Référence vers la session d''entretien';
COMMENT ON COLUMN feedback_ia.score_global IS 'Score global du feedback';
COMMENT ON COLUMN feedback_ia.points_forts IS 'Liste des points forts';
COMMENT ON COLUMN feedback_ia.points_faibles IS 'Liste des points faibles';
COMMENT ON COLUMN feedback_ia.conseils IS 'Liste des conseils d''amélioration';
COMMENT ON COLUMN feedback_ia.date_feedback IS 'Date du feedback';

-- ============================================================================
-- TABLE: notification
-- ============================================================================
CREATE TABLE notification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'SYSTEM',
    lu BOOLEAN DEFAULT FALSE,
    date_envoi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE notification IS 'Table des notifications utilisateurs';
COMMENT ON COLUMN notification.id IS 'Identifiant unique de la notification (UUID)';
COMMENT ON COLUMN notification.user_id IS 'Référence vers l''utilisateur destinataire';
COMMENT ON COLUMN notification.titre IS 'Titre de la notification';
COMMENT ON COLUMN notification.message IS 'Message de la notification';
COMMENT ON COLUMN notification.type IS 'Type de notification';
COMMENT ON COLUMN notification.lu IS 'Indicateur de lecture';
COMMENT ON COLUMN notification.date_envoi IS 'Date d''envoi de la notification';

-- ============================================================================
-- TABLE: notifications (Django notifications table)
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    type VARCHAR(50),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE notifications IS 'Table des notifications Django';
COMMENT ON COLUMN notifications.id IS 'Identifiant unique de la notification (UUID)';
COMMENT ON COLUMN notifications.user_id IS 'Référence vers l''utilisateur destinataire';
COMMENT ON COLUMN notifications.type IS 'Type de notification';
COMMENT ON COLUMN notifications.message IS 'Message de la notification';
COMMENT ON COLUMN notifications.is_read IS 'Indicateur de lecture';
COMMENT ON COLUMN notifications.created_at IS 'Date de création';

-- ============================================================================
-- TABLE: users_groups (Django groups table)
-- ============================================================================
CREATE TABLE users_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    group_id UUID NOT NULL,
    UNIQUE (user_id, group_id)
);

COMMENT ON TABLE users_groups IS 'Table des groupes utilisateurs Django';
COMMENT ON COLUMN users_groups.id IS 'Identifiant unique';
COMMENT ON COLUMN users_groups.user_id IS 'Référence vers l''utilisateur';
COMMENT ON COLUMN users_groups.group_id IS 'Référence vers le groupe';

-- ============================================================================
-- TABLE: users_user_permissions (Django permissions table)
-- ============================================================================
CREATE TABLE users_user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL,
    UNIQUE (user_id, permission_id)
);

COMMENT ON TABLE users_user_permissions IS 'Table des permissions utilisateurs Django';
COMMENT ON COLUMN users_user_permissions.id IS 'Identifiant unique';
COMMENT ON COLUMN users_user_permissions.user_id IS 'Référence vers l''utilisateur';
COMMENT ON COLUMN users_user_permissions.permission_id IS 'Référence vers la permission';

-- ============================================================================
-- Verification
-- ============================================================================

-- List all tables
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
