-- ============================================================================
-- TafLocal AI - PostgreSQL Extensions
-- ============================================================================
-- Description: Enable required PostgreSQL extensions for UUID generation and
--              additional functionality
-- Version: 1.0
-- Author: TafLocal AI Database Team
-- Date: 2026-06-28
-- ============================================================================

-- Enable UUID extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for cryptographic functions (hashing, encryption)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable btree_gin for better indexing performance
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Enable btree_gist for GiST indexes
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Enable unaccent for text normalization (useful for search)
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Enable pg_trgm for trigram matching (fuzzy search)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- Verification
-- ============================================================================

-- List all enabled extensions
SELECT extname, extversion FROM pg_extension ORDER BY extname;

COMMENT ON EXTENSION "uuid-ossp" IS 'Generate universally unique identifiers (UUIDs)';
COMMENT ON EXTENSION "pgcrypto" IS 'Cryptographic functions for hashing and encryption';
COMMENT ON EXTENSION "btree_gin" IS 'B-tree operator classes implementing GiST';
COMMENT ON EXTENSION "btree_gist" IS 'GiST operator classes implementing B-tree';
COMMENT ON EXTENSION "unaccent" IS 'Text search dictionary that removes accents';
COMMENT ON EXTENSION "pg_trgm" IS 'Trigram matching for similarity and fuzzy search';
