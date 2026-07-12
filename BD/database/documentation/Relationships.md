# TafLocal AI - Database Relationships

## Overview

Ce document décrit toutes les relations entre les tables de la base de données TafLocal AI.

## Diagramme des Relations

```
utilisateur (1) ---- (1) chercheur_emploi
utilisateur (1) ---- (1) entreprise
utilisateur (1) ---- (N) notification

chercheur_emploi (1) ---- (N) cv
chercheur_emploi (1) ---- (N) candidature
chercheur_emploi (1) ---- (N) session_entretien

entreprise (1) ---- (N) offre_emploi

cv (1) ---- (N) experience_professionnelle
cv (1) ---- (N) formation
cv (1) ---- (N) competence
cv (1) ---- (N) analyse_cv

analyse_cv (1) ---- (N) recommandation_offre

offre_emploi (1) ---- (N) candidature
offre_emploi (1) ---- (N) recommandation_offre
offre_emploi (1) ---- (N) session_entretien

candidature (1) ---- (0..1) lettre_motivation

session_entretien (1) ---- (N) question_entretien
session_entretien (1) ---- (1) feedback_ia
```

## Relations Détaillées

### 1. utilisateur ↔ chercheur_emploi

**Type**: 1:1 (One-to-One)

**Description**: Un utilisateur peut avoir exactement un profil de candidat. Un candidat appartient à un seul utilisateur.

**Clé Étrangère**: chercheur_emploi.user_id → utilisateur.id

**Contrainte**: CASCADE DELETE - Suppression du candidat si l'utilisateur est supprimé

**Contrainte**: UNIQUE - Un utilisateur ne peut avoir qu'un seul profil candidat

```sql
FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE
CONSTRAINT unique_candidate_user UNIQUE (user_id)
```

---

### 2. utilisateur ↔ entreprise

**Type**: 1:1 (One-to-One)

**Description**: Un utilisateur peut avoir exactement un profil d'entreprise. Une entreprise appartient à un seul utilisateur.

**Clé Étrangère**: entreprise.user_id → utilisateur.id

**Contrainte**: CASCADE DELETE - Suppression de l'entreprise si l'utilisateur est supprimé

**Contrainte**: UNIQUE - Un utilisateur ne peut avoir qu'un seul profil entreprise

```sql
FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE
CONSTRAINT unique_company_user UNIQUE (user_id)
```

---

### 3. utilisateur ↔ notification

**Type**: 1:N (One-to-Many)

**Description**: Un utilisateur peut recevoir plusieurs notifications. Une notification appartient à un seul utilisateur.

**Clé Étrangère**: notification.user_id → utilisateur.id

**Contrainte**: CASCADE DELETE - Suppression des notifications si l'utilisateur est supprimé

```sql
FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE
```

---

### 4. chercheur_emploi ↔ cv

**Type**: 1:N (One-to-Many)

**Description**: Un candidat peut avoir plusieurs CVs. Un CV appartient à un seul candidat.

**Clé Étrangère**: cv.candidate_id → chercheur_emploi.id

**Contrainte**: CASCADE DELETE - Suppression des CVs si le candidat est supprimé

```sql
FOREIGN KEY (candidate_id) REFERENCES chercheur_emploi(id) ON DELETE CASCADE
```

---

### 5. chercheur_emploi ↔ candidature

**Type**: 1:N (One-to-Many)

**Description**: Un candidat peut faire plusieurs candidatures. Une candidature appartient à un seul candidat.

**Clé Étrangère**: candidature.candidate_id → chercheur_emploi.id

**Contrainte**: CASCADE DELETE - Suppression des candidatures si le candidat est supprimé

```sql
FOREIGN KEY (candidate_id) REFERENCES chercheur_emploi(id) ON DELETE CASCADE
```

---

### 6. chercheur_emploi ↔ session_entretien

**Type**: 1:N (One-to-Many)

**Description**: Un candidat peut effectuer plusieurs sessions d'entretien. Une session d'entretien appartient à un seul candidat.

**Clé Étrangère**: session_entretien.candidate_id → chercheur_emploi.id

**Contrainte**: CASCADE DELETE - Suppression des sessions si le candidat est supprimé

```sql
FOREIGN KEY (candidate_id) REFERENCES chercheur_emploi(id) ON DELETE CASCADE
```

---

### 7. entreprise ↔ offre_emploi

**Type**: 1:N (One-to-Many)

**Description**: Une entreprise peut publier plusieurs offres d'emploi. Une offre d'emploi appartient à une seule entreprise.

**Clé Étrangère**: offre_emploi.entreprise_id → entreprise.id

**Contrainte**: CASCADE DELETE - Suppression des offres si l'entreprise est supprimée

```sql
FOREIGN KEY (entreprise_id) REFERENCES entreprise(id) ON DELETE CASCADE
```

---

### 8. cv ↔ experience_professionnelle

**Type**: 1:N (One-to-Many)

**Description**: Un CV peut contenir plusieurs expériences professionnelles. Une expérience appartient à un seul CV.

**Clé Étrangère**: experience_professionnelle.cv_id → cv.id

**Contrainte**: CASCADE DELETE - Suppression des expériences si le CV est supprimé

```sql
FOREIGN KEY (cv_id) REFERENCES cv(id) ON DELETE CASCADE
```

---

### 9. cv ↔ formation

**Type**: 1:N (One-to-Many)

**Description**: Un CV peut contenir plusieurs formations. Une formation appartient à un seul CV.

**Clé Étrangère**: formation.cv_id → cv.id

**Contrainte**: CASCADE DELETE - Suppression des formations si le CV est supprimé

```sql
FOREIGN KEY (cv_id) REFERENCES cv(id) ON DELETE CASCADE
```

---

### 10. cv ↔ competence

**Type**: 1:N (One-to-Many)

**Description**: Un CV peut contenir plusieurs compétences. Une compétence appartient à un seul CV.

**Clé Étrangère**: competence.cv_id → cv.id

**Contrainte**: CASCADE DELETE - Suppression des compétences si le CV est supprimé

```sql
FOREIGN KEY (cv_id) REFERENCES cv(id) ON DELETE CASCADE
```

---

### 11. cv ↔ analyse_cv

**Type**: 1:N (One-to-Many)

**Description**: Un CV peut avoir plusieurs analyses. Une analyse appartient à un seul CV.

**Clé Étrangère**: analyse_cv.cv_id → cv.id

**Contrainte**: CASCADE DELETE - Suppression des analyses si le CV est supprimé

```sql
FOREIGN KEY (cv_id) REFERENCES cv(id) ON DELETE CASCADE
```

---

### 12. analyse_cv ↔ recommandation_offre

**Type**: 1:N (One-to-Many)

**Description**: Une analyse de CV peut générer plusieurs recommandations. Une recommandation appartient à une seule analyse.

**Clé Étrangère**: recommandation_offre.analyse_cv_id → analyse_cv.id

**Contrainte**: CASCADE DELETE - Suppression des recommandations si l'analyse est supprimée

```sql
FOREIGN KEY (analyse_cv_id) REFERENCES analyse_cv(id) ON DELETE CASCADE
```

---

### 13. offre_emploi ↔ candidature

**Type**: 1:N (One-to-Many)

**Description**: Une offre d'emploi peut recevoir plusieurs candidatures. Une candidature appartient à une seule offre.

**Clé Étrangère**: candidature.offre_id → offre_emploi.id

**Contrainte**: CASCADE DELETE - Suppression des candidatures si l'offre est supprimée

**Contrainte**: UNIQUE - Un candidat ne peut postuler qu'une fois à une offre

```sql
FOREIGN KEY (offre_id) REFERENCES offre_emploi(id) ON DELETE CASCADE
CONSTRAINT unique_application UNIQUE (candidate_id, offre_id)
```

---

### 14. offre_emploi ↔ recommandation_offre

**Type**: 1:N (One-to-Many)

**Description**: Une offre d'emploi peut apparaître dans plusieurs recommandations. Une recommandation appartient à une seule offre.

**Clé Étrangère**: recommandation_offre.offre_id → offre_emploi.id

**Contrainte**: CASCADE DELETE - Suppression des recommandations si l'offre est supprimée

```sql
FOREIGN KEY (offre_id) REFERENCES offre_emploi(id) ON DELETE CASCADE
```

---

### 15. offre_emploi ↔ session_entretien

**Type**: 1:N (One-to-Many)

**Description**: Une offre d'emploi peut avoir plusieurs sessions d'entretien. Une session d'entretien peut être liée à une offre.

**Clé Étrangère**: session_entretien.offre_id → offre_emploi.id

**Contrainte**: SET NULL - L'offre est mise à NULL si elle est supprimée (la session reste)

```sql
FOREIGN KEY (offre_id) REFERENCES offre_emploi(id) ON DELETE SET NULL
```

---

### 16. candidature ↔ lettre_motivation

**Type**: 1:0..1 (One-to-Zero-or-One)

**Description**: Une candidature peut avoir zéro ou une lettre de motivation. Une lettre de motivation appartient à une seule candidature.

**Clé Étrangère**: lettre_motivation.candidature_id → candidature.id

**Contrainte**: CASCADE DELETE - Suppression de la lettre si la candidature est supprimée

**Contrainte**: UNIQUE - Une candidature ne peut avoir qu'une seule lettre de motivation

```sql
FOREIGN KEY (candidature_id) REFERENCES candidature(id) ON DELETE CASCADE
CONSTRAINT unique_cover_letter UNIQUE (candidature_id)
```

---

### 17. session_entretien ↔ question_entretien

**Type**: 1:N (One-to-Many)

**Description**: Une session d'entretien contient plusieurs questions. Une question appartient à une seule session.

**Clé Étrangère**: question_entretien.session_id → session_entretien.id

**Contrainte**: CASCADE DELETE - Suppression des questions si la session est supprimée

```sql
FOREIGN KEY (session_id) REFERENCES session_entretien(id) ON DELETE CASCADE
```

---

### 18. session_entretien ↔ feedback_ia

**Type**: 1:1 (One-to-One)

**Description**: Une session d'entretien génère un feedback IA. Un feedback appartient à une seule session.

**Clé Étrangère**: feedback_ia.session_id → session_entretien.id

**Contrainte**: CASCADE DELETE - Suppression du feedback si la session est supprimée

**Contrainte**: UNIQUE - Une session ne peut avoir qu'un seul feedback

```sql
FOREIGN KEY (session_id) REFERENCES session_entretien(id) ON DELETE CASCADE
CONSTRAINT unique_feedback UNIQUE (session_id)
```

---

### 19. audit_log ↔ utilisateur

**Type**: N:1 (Many-to-One)

**Description**: Un utilisateur peut effectuer plusieurs modifications auditées. Une entrée d'audit est liée à un utilisateur.

**Clé Étrangère**: audit_log.changed_by → utilisateur.id

**Contrainte**: SET NULL - L'utilisateur est mis à NULL s'il est supprimé (l'audit reste)

```sql
FOREIGN KEY (changed_by) REFERENCES utilisateur(id) ON DELETE SET NULL
```

---

## Résumé des Relations

| Relation | Type | Cardinalité | Cascade |
|----------|------|-------------|---------|
| utilisateur → chercheur_emploi | FK | 1:1 | CASCADE |
| utilisateur → entreprise | FK | 1:1 | CASCADE |
| utilisateur → notification | FK | 1:N | CASCADE |
| chercheur_emploi → cv | FK | 1:N | CASCADE |
| chercheur_emploi → candidature | FK | 1:N | CASCADE |
| chercheur_emploi → session_entretien | FK | 1:N | CASCADE |
| entreprise → offre_emploi | FK | 1:N | CASCADE |
| cv → experience_professionnelle | FK | 1:N | CASCADE |
| cv → formation | FK | 1:N | CASCADE |
| cv → competence | FK | 1:N | CASCADE |
| cv → analyse_cv | FK | 1:N | CASCADE |
| analyse_cv → recommandation_offre | FK | 1:N | CASCADE |
| offre_emploi → candidature | FK | 1:N | CASCADE |
| offre_emploi → recommandation_offre | FK | 1:N | CASCADE |
| offre_emploi → session_entretien | FK | 1:N | SET NULL |
| candidature → lettre_motivation | FK | 1:0..1 | CASCADE |
| session_entretien → question_entretien | FK | 1:N | CASCADE |
| session_entretien → feedback_ia | FK | 1:1 | CASCADE |
| audit_log → utilisateur | FK | N:1 | SET NULL |

## Contraintes d'Intégrité

### Uniques (UNIQUE)
- utilisateur.email
- chercheur_emploi.user_id
- entreprise.user_id
- candidature (candidate_id, offre_id)
- lettre_motivation.candidature_id
- recommandation_offre (analyse_cv_id, offre_id)
- feedback_ia.session_id

### Clés Primaires (PRIMARY KEY)
- Toutes les tables utilisent des UUID comme clés primaires

### Clés Étrangères (FOREIGN KEY)
- Toutes les relations sont définies avec des clés étrangères
- La plupart utilisent CASCADE DELETE pour maintenir l'intégrité
- Certaines utilisent SET NULL pour préserver les données historiques

## Notes d'Architecture

- **Intégrité Référentielle**: Toutes les relations sont définies avec des clés étrangères pour garantir l'intégrité des données.
- **Cascade Delete**: La plupart des relations utilisent CASCADE DELETE pour simplifier la suppression des données orphelines.
- **SET NULL**: Les relations historiques (session_entretien.offre_id, audit_log.changed_by) utilisent SET NULL pour préserver les données.
- **Uniques**: Les contraintes UNIQUE empêchent les doublons (email, profils uniques, candidatures uniques).
- **Normalisation**: La base de données est normalisée à 3NF pour éviter la redondance et maintenir la cohérence.
