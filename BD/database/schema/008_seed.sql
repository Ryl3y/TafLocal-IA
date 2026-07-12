-- ============================================================================
-- TafLocal AI - Seed Data
-- ============================================================================
-- Description: Insert reference data for the database
-- Version: 1.0
-- Author: TafLocal AI Database Team
-- Date: 2026-06-28
-- ============================================================================

-- ============================================================================
-- SEED: Skill Levels
-- ============================================================================

-- Note: Skill levels are already defined as CHECK constraints in competence table
-- The valid values are: 'Débutant', 'Intermédiaire', 'Avancé', 'Expert'

-- ============================================================================
-- SEED: Job Sectors (for reference)
-- ============================================================================

-- Note: These are reference values commonly used in entreprise.secteur
-- They are not enforced by a foreign key but are useful for consistency

-- Common sectors in Cameroon:
-- Technologies de l'information
-- Finance et Banque
-- Santé
-- Éducation
-- Agriculture
-- Industrie
-- Commerce
-- Télécommunications
-- Énergie
-- Construction
-- Transport
-- Hôtellerie et Tourisme
-- Services publics
-- Médias et Communication
-- Juridique
-- Ressources Humaines
-- Marketing et Publicité
-- Logistique
-- Environnement
-- Arts et Culture

-- ============================================================================
-- SEED: Study Levels (for reference)
-- ============================================================================

-- Note: These are reference values commonly used in offre_emploi.niveau_etude
-- They are not enforced by a foreign key but are useful for consistency

-- Common study levels:
-- Sans diplôme
-- BEPC
-- Probatoire
-- Baccalauréat
-- BTS/DUT
-- Licence
-- Master 1
-- Master 2
-- Doctorat
-- Certification professionnelle
-- Formation technique

-- ============================================================================
-- SEED: Cities in Cameroon (for reference)
-- ============================================================================

-- Note: These are reference values commonly used in chercheur_emploi.ville
-- and entreprise.ville and offre_emploi.localisation
-- They are not enforced by a foreign key but are useful for consistency

-- Major cities in Cameroon:
-- Yaoundé
-- Douala
-- Bafoussam
-- Bamenda
-- Garoua
-- Maroua
-- Bertoua
-- Ngaoundéré
-- Édéa
-- Kribi
-- Limbé
-- Buea
-- Kousséri
-- Mbouda
-- Nkongsamba
-- Sangmélima
-- Ebolowa
-- Kumba
-- Tiko
-- Bamenda

-- ============================================================================
-- SEED: Default Admin User
-- ============================================================================

-- Create default admin user (password: Admin123!)
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'Admin',
    'System',
    'admin@taflocal.ai',
    encode(digest('Admin123!', 'sha256'), 'hex'),
    'ADMIN',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- Verification
-- ============================================================================

-- Verify admin user
SELECT id, nom, prenom, email, role, is_active FROM utilisateur WHERE role = 'ADMIN';
