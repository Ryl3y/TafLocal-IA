# TafLocal AI - Database Constraints

## Overview

Ce document décrit toutes les contraintes appliquées à la base de données TafLocal AI pour garantir l'intégrité et la cohérence des données.

## Types de Contraintes

### 1. PRIMARY KEY (Clé Primaire)

Toutes les tables utilisent des UUID comme clés primaires pour garantir l'unicité et la distributivité.

**Tables concernées**: Toutes les tables

**Exemple**:
```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
```

---

### 2. FOREIGN KEY (Clé Étrangère)

Les clés étrangères garantissent l'intégrité référentielle entre les tables.

#### utilisateur → chercheur_emploi
```sql
FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE
```

#### utilisateur → entreprise
```sql
FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE
```

#### utilisateur → notification
```sql
FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE
```

#### chercheur_emploi → cv
```sql
FOREIGN KEY (candidate_id) REFERENCES chercheur_emploi(id) ON DELETE CASCADE
```

#### cv → experience_professionnelle
```sql
FOREIGN KEY (cv_id) REFERENCES cv(id) ON DELETE CASCADE
```

#### cv → formation
```sql
FOREIGN KEY (cv_id) REFERENCES cv(id) ON DELETE CASCADE
```

#### cv → competence
```sql
FOREIGN KEY (cv_id) REFERENCES cv(id) ON DELETE CASCADE
```

#### cv → analyse_cv
```sql
FOREIGN KEY (cv_id) REFERENCES cv(id) ON DELETE CASCADE
```

#### analyse_cv → recommandation_offre
```sql
FOREIGN KEY (analyse_cv_id) REFERENCES analyse_cv(id) ON DELETE CASCADE
```

#### entreprise → offre_emploi
```sql
FOREIGN KEY (entreprise_id) REFERENCES entreprise(id) ON DELETE CASCADE
```

#### offre_emploi → candidature
```sql
FOREIGN KEY (offre_id) REFERENCES offre_emploi(id) ON DELETE CASCADE
```

#### offre_emploi → recommandation_offre
```sql
FOREIGN KEY (offre_id) REFERENCES offre_emploi(id) ON DELETE CASCADE
```

#### offre_emploi → session_entretien
```sql
FOREIGN KEY (offre_id) REFERENCES offre_emploi(id) ON DELETE SET NULL
```

#### chercheur_emploi → candidature
```sql
FOREIGN KEY (candidate_id) REFERENCES chercheur_emploi(id) ON DELETE CASCADE
```

#### candidature → lettre_motivation
```sql
FOREIGN KEY (candidature_id) REFERENCES candidature(id) ON DELETE CASCADE
```

#### chercheur_emploi → session_entretien
```sql
FOREIGN KEY (candidate_id) REFERENCES chercheur_emploi(id) ON DELETE CASCADE
```

#### session_entretien → question_entretien
```sql
FOREIGN KEY (session_id) REFERENCES session_entretien(id) ON DELETE CASCADE
```

#### session_entretien → feedback_ia
```sql
FOREIGN KEY (session_id) REFERENCES session_entretien(id) ON DELETE CASCADE
```

#### audit_log → utilisateur
```sql
FOREIGN KEY (changed_by) REFERENCES utilisateur(id) ON DELETE SET NULL
```

---

### 3. UNIQUE (Unicité)

Les contraintes UNIQUE garantissent l'unicité des valeurs dans une ou plusieurs colonnes.

#### utilisateur.email
```sql
UNIQUE (email)
```
**But**: Garantir que chaque email est unique pour l'authentification.

#### chercheur_emploi.user_id
```sql
CONSTRAINT unique_candidate_user UNIQUE (user_id)
```
**But**: Un utilisateur ne peut avoir qu'un seul profil candidat.

#### entreprise.user_id
```sql
CONSTRAINT unique_company_user UNIQUE (user_id)
```
**But**: Un utilisateur ne peut avoir qu'un seul profil entreprise.

#### candidature (candidate_id, offre_id)
```sql
CONSTRAINT unique_application UNIQUE (candidate_id, offre_id)
```
**But**: Un candidat ne peut postuler qu'une fois à une offre.

#### lettre_motivation.candidature_id
```sql
CONSTRAINT unique_cover_letter UNIQUE (candidature_id)
```
**But**: Une candidature ne peut avoir qu'une seule lettre de motivation.

#### recommandation_offre (analyse_cv_id, offre_id)
```sql
CONSTRAINT unique_recommendation UNIQUE (analyse_cv_id, offre_id)
```
**But**: Une analyse ne peut recommander qu'une fois une offre.

#### feedback_ia.session_id
```sql
CONSTRAINT unique_feedback UNIQUE (session_id)
```
**But**: Une session d'entretien ne peut avoir qu'un seul feedback.

---

### 4. CHECK (Validation)

Les contraintes CHECK valident les données avant insertion ou mise à jour.

#### utilisateur.check_email_format
```sql
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
```
**But**: Valider le format de l'email.

#### utilisateur.check_password_length
```sql
CHECK (LENGTH(mot_de_passe) >= 8)
```
**But**: Le mot de passe doit avoir au moins 8 caractères.

#### utilisateur.check_phone_format
```sql
CHECK (telephone IS NULL OR telephone ~ '^\+?[0-9\s\-\(\)]{10,20}$')
```
**But**: Valider le format du numéro de téléphone.

#### utilisateur.check_date_inscription_past
```sql
CHECK (date_inscription <= CURRENT_TIMESTAMP)
```
**But**: La date d'inscription ne peut pas être dans le futur.

#### chercheur_emploi.check_date_naissance_past
```sql
CHECK (date_naissance IS NULL OR date_naissance <= CURRENT_DATE)
```
**But**: La date de naissance ne peut pas être dans le futur.

#### chercheur_emploi.check_minimum_age
```sql
CHECK (date_naissance IS NULL OR date_naissance <= (CURRENT_DATE - INTERVAL '16 years'))
```
**But**: Le candidat doit avoir au moins 16 ans.

#### chercheur_emploi.check_genre_valid
```sql
CHECK (genre IS NULL OR genre IN ('H', 'F', 'Autre', 'Non spécifié'))
```
**But**: Le genre doit être une valeur valide.

#### entreprise.check_company_name_not_empty
```sql
CHECK (TRIM(nom_entreprise) != '')
```
**But**: Le nom de l'entreprise ne peut pas être vide.

#### entreprise.check_website_format
```sql
CHECK (site_web IS NULL OR site_web ~* '^https?://[^\s/$.?#].[^\s]*$')
```
**But**: Valider le format du site web.

#### cv.check_cv_title_not_empty
```sql
CHECK (TRIM(titre) != '')
```
**But**: Le titre du CV ne peut pas être vide.

#### cv.check_cv_version_positive
```sql
CHECK (version >= 1)
```
**But**: La version du CV doit être positive.

#### cv.check_cv_file_not_empty
```sql
CHECK (TRIM(fichier_pdf) != '')
```
**But**: Le fichier du CV ne peut pas être vide.

#### experience_professionnelle.check_experience_dates
```sql
CHECK (date_fin IS NULL OR date_fin >= date_debut)
```
**But**: La date de fin doit être après la date de début.

#### experience_professionnelle.check_poste_not_empty
```sql
CHECK (TRIM(poste) != '')
```
**But**: Le poste ne peut pas être vide.

#### experience_professionnelle.check_entreprise_not_empty
```sql
CHECK (TRIM(entreprise) != '')
```
**But**: L'entreprise ne peut pas être vide.

#### formation.check_formation_dates
```sql
CHECK (date_fin IS NULL OR date_fin >= date_debut)
```
**But**: La date de fin doit être après la date de début.

#### formation.check_diplome_not_empty
```sql
CHECK (TRIM(diplome) != '')
```
**But**: Le diplôme ne peut pas être vide.

#### formation.check_etablissement_not_empty
```sql
CHECK (TRIM(etablissement) != '')
```
**But**: L'établissement ne peut pas être vide.

#### competence.check_competence_name_not_empty
```sql
CHECK (TRIM(nom) != '')
```
**But**: Le nom de la compétence ne peut pas être vide.

#### competence.check_competence_level_valid
```sql
CHECK (niveau IN ('Débutant', 'Intermédiaire', 'Avancé', 'Expert'))
```
**But**: Le niveau doit être une valeur valide.

#### analyse_cv.check_score_global
```sql
CHECK (score_global >= 0 AND score_global <= 100)
```
**But**: Le score global doit être entre 0 et 100.

#### offre_emploi.check_job_title_not_empty
```sql
CHECK (TRIM(titre) != '')
```
**But**: Le titre du poste ne peut pas être vide.

#### offre_emploi.check_job_description_not_empty
```sql
CHECK (TRIM(description) != '')
```
**But**: La description ne peut pas être vide.

#### offre_emploi.check_salary_range
```sql
CHECK (salaire_min IS NULL OR salaire_max IS NULL OR salaire_max >= salaire_min)
```
**But**: Le salaire maximum doit être supérieur ou égal au minimum.

#### offre_emploi.check_experience_non_negative
```sql
CHECK (experience_requise IS NULL OR experience_requise >= 0)
```
**But**: L'expérience requise ne peut pas être négative.

#### offre_emploi.check_job_dates
```sql
CHECK (date_expiration IS NULL OR date_expiration > date_publication)
```
**But**: La date d'expiration doit être après la date de publication.

#### offre_emploi.check_publication_date_past
```sql
CHECK (date_publication <= CURRENT_TIMESTAMP)
```
**But**: La date de publication ne peut pas être dans le futur.

#### recommandation_offre.check_score_compatibilite
```sql
CHECK (score_compatibilite >= 0 AND score_compatibilite <= 100)
```
**But**: Le score de compatibilité doit être entre 0 et 100.

#### candidature.check_application_date_past
```sql
CHECK (date_candidature <= CURRENT_TIMESTAMP)
```
**But**: La date de candidature ne peut pas être dans le futur.

#### lettre_motivation.check_cover_letter_content_not_empty
```sql
CHECK (TRIM(contenu) != '')
```
**But**: Le contenu de la lettre ne peut pas être vide.

#### session_entretien.check_interview_duration_positive
```sql
CHECK (duree IS NULL OR duree > 0)
```
**But**: La durée doit être positive.

#### session_entretien.check_interview_date_future
```sql
CHECK (statut != 'SCHEDULED' OR date_session IS NULL OR date_session >= CURRENT_TIMESTAMP)
```
**But**: Une session planifiée doit avoir une date dans le futur.

#### question_entretien.check_question_not_empty
```sql
CHECK (TRIM(question) != '')
```
**But**: La question ne peut pas être vide.

#### question_entretien.check_question_order_positive
```sql
CHECK (ordre >= 1)
```
**But**: L'ordre doit être positif.

#### question_entretien.check_question_score
```sql
CHECK (score IS NULL OR (score >= 0 AND score <= 100))
```
**But**: Le score doit être entre 0 et 100.

#### feedback_ia.check_score_global
```sql
CHECK (score_global >= 0 AND score_global <= 100)
```
**But**: Le score global doit être entre 0 et 100.

#### notification.check_notification_title_not_empty
```sql
CHECK (TRIM(titre) != '')
```
**But**: Le titre ne peut pas être vide.

#### notification.check_notification_message_not_empty
```sql
CHECK (TRIM(message) != '')
```
**But**: Le message ne peut pas être vide.

#### notification.check_notification_date_past
```sql
CHECK (date_envoi <= CURRENT_TIMESTAMP)
```
**But**: La date d'envoi ne peut pas être dans le futur.

---

### 5. NOT NULL (Non Null)

Les contraintes NOT NULL garantissent qu'une colonne doit toujours avoir une valeur.

**Exemples**:
- utilisateur.nom, prenom, email, mot_de_passe
- chercheur_emploi.user_id
- entreprise.user_id, nom_entreprise
- cv.candidate_id, titre, fichier_pdf
- Et toutes les clés primaires et étrangères

---

### 6. DEFAULT (Valeur par Défaut)

Les contraintes DEFAULT fournissent des valeurs par défaut pour les colonnes.

**Exemples**:
```sql
is_active BOOLEAN DEFAULT TRUE
role user_role DEFAULT 'CANDIDATE'
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
is_default BOOLEAN DEFAULT FALSE
version INTEGER DEFAULT 1
statut analysis_status DEFAULT 'PENDING'
statut job_status DEFAULT 'DRAFT'
devise VARCHAR(10) DEFAULT 'XAF'
type_entretien interview_type DEFAULT 'MIXED'
type_question question_type DEFAULT 'OPEN'
generated_by_ai BOOLEAN DEFAULT FALSE
lu BOOLEAN DEFAULT FALSE
```

---

### 7. ENUM (Types Énumérés)

Les types ENUM limitent les valeurs possibles à un ensemble prédéfini.

#### user_role
```sql
CREATE TYPE user_role AS ENUM ('ADMIN', 'CANDIDATE', 'COMPANY');
```

#### application_status
```sql
CREATE TYPE application_status AS ENUM ('PENDING', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'HIRED', 'WITHDRAWN');
```

#### contract_type
```sql
CREATE TYPE contract_type AS ENUM ('CDI', 'CDD', 'FREELANCE', 'INTERNSHIP', 'APPRENTICESHIP');
```

#### job_status
```sql
CREATE TYPE job_status AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED', 'EXPIRED');
```

#### analysis_status
```sql
CREATE TYPE analysis_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
```

#### interview_type
```sql
CREATE TYPE interview_type AS ENUM ('TECHNICAL', 'BEHAVIORAL', 'MIXED', 'HR');
```

#### interview_status
```sql
CREATE TYPE interview_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED');
```

#### question_type
```sql
CREATE TYPE question_type AS ENUM ('OPEN', 'MULTIPLE_CHOICE', 'CODE', 'BEHAVIORAL');
```

#### notification_type
```sql
CREATE TYPE notification_type AS ENUM ('APPLICATION', 'INTERVIEW', 'JOB', 'SYSTEM', 'PROFILE');
```

---

## Résumé des Contraintes par Table

### utilisateur
- PRIMARY KEY: id
- UNIQUE: email
- NOT NULL: nom, prenom, email, mot_de_passe, role
- CHECK: email format, password length, phone format, date_inscription
- DEFAULT: is_active, role, created_at, updated_at

### chercheur_emploi
- PRIMARY KEY: id
- FOREIGN KEY: user_id → utilisateur
- UNIQUE: user_id
- NOT NULL: user_id
- CHECK: date_naissance, minimum age, genre
- DEFAULT: created_at, updated_at

### entreprise
- PRIMARY KEY: id
- FOREIGN KEY: user_id → utilisateur
- UNIQUE: user_id
- NOT NULL: user_id, nom_entreprise
- CHECK: company name not empty, website format
- DEFAULT: verified, created_at, updated_at

### cv
- PRIMARY KEY: id
- FOREIGN KEY: candidate_id → chercheur_emploi
- NOT NULL: candidate_id, titre, fichier_pdf
- CHECK: title not empty, version positive, file not empty
- DEFAULT: date_import, version, is_default, created_at, updated_at

### experience_professionnelle
- PRIMARY KEY: id
- FOREIGN KEY: cv_id → cv
- NOT NULL: cv_id, poste, entreprise, date_debut
- CHECK: dates, poste not empty, entreprise not empty

### formation
- PRIMARY KEY: id
- FOREIGN KEY: cv_id → cv
- NOT NULL: cv_id, diplome, etablissement, date_debut
- CHECK: dates, diplome not empty, etablissement not empty

### competence
- PRIMARY KEY: id
- FOREIGN KEY: cv_id → cv
- NOT NULL: cv_id, nom, niveau
- CHECK: name not empty, level valid

### analyse_cv
- PRIMARY KEY: id
- FOREIGN KEY: cv_id → cv
- NOT NULL: cv_id, statut
- CHECK: score_global (0-100)
- DEFAULT: date_analyse, statut, created_at

### offre_emploi
- PRIMARY KEY: id
- FOREIGN KEY: entreprise_id → entreprise
- NOT NULL: entreprise_id, titre, description, type_contrat, devise
- CHECK: title, description, salary range, experience, dates
- DEFAULT: devise, date_publication, statut, created_at, updated_at

### recommandation_offre
- PRIMARY KEY: id
- FOREIGN KEY: analyse_cv_id → analyse_cv
- FOREIGN KEY: offre_id → offre_emploi
- UNIQUE: (analyse_cv_id, offre_id)
- NOT NULL: analyse_cv_id, offre_id, score_compatibilite
- CHECK: score_compatibilite (0-100)
- DEFAULT: date_recommandation

### candidature
- PRIMARY KEY: id
- FOREIGN KEY: candidate_id → chercheur_emploi
- FOREIGN KEY: offre_id → offre_emploi
- UNIQUE: (candidate_id, offre_id)
- NOT NULL: candidate_id, offre_id, statut
- CHECK: date_candidature
- DEFAULT: date_candidature, statut, created_at, updated_at

### lettre_motivation
- PRIMARY KEY: id
- FOREIGN KEY: candidature_id → candidature
- UNIQUE: candidature_id
- NOT NULL: candidature_id, contenu
- CHECK: contenu not empty
- DEFAULT: date_creation, generated_by_ai

### session_entretien
- PRIMARY KEY: id
- FOREIGN KEY: candidate_id → chercheur_emploi
- FOREIGN KEY: offre_id → offre_emploi
- NOT NULL: candidate_id, type_entretien, statut
- CHECK: duration, date_session
- DEFAULT: type_entretien, statut, created_at

### question_entretien
- PRIMARY KEY: id
- FOREIGN KEY: session_id → session_entretien
- NOT NULL: session_id, question, ordre
- CHECK: question not empty, order positive, score
- DEFAULT: type_question

### feedback_ia
- PRIMARY KEY: id
- FOREIGN KEY: session_id → session_entretien
- UNIQUE: session_id
- NOT NULL: session_id
- CHECK: score_global (0-100)
- DEFAULT: date_feedback

### notification
- PRIMARY KEY: id
- FOREIGN KEY: user_id → utilisateur
- NOT NULL: user_id, titre, message, type
- CHECK: title not empty, message not empty, date_envoi
- DEFAULT: type, lu, date_envoi

### audit_log
- PRIMARY KEY: id
- FOREIGN KEY: changed_by → utilisateur
- NOT NULL: table_name, record_id, action
- DEFAULT: changed_at

---

## Notes d'Architecture

- **Intégrité**: Les contraintes garantissent l'intégrité des données à tous les niveaux.
- **Validation**: Les contraintes CHECK valident les données au niveau de la base de données.
- **Performance**: Les contraintes sont optimisées avec des indexes appropriés.
- **Sécurité**: Les contraintes empêchent les données invalides ou corrompues.
- **Normalisation**: Les contraintes UNIQUE et FOREIGN KEY maintiennent la normalisation 3NF.
