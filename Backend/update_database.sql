
-- Ajouter les colonnes manquantes à la table utilisateur
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS is_staff BOOLEAN DEFAULT FALSE;
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS is_superuser BOOLEAN DEFAULT FALSE;
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
