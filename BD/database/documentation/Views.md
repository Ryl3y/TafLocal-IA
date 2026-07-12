# TafLocal AI - Database Views

## Overview

Ce document décrit toutes les vues de la base de données TafLocal AI. Les vues sont utilisées pour simplifier les requêtes complexes, fournir des tableaux de bord et générer des rapports.

## Vues

### 1. v_candidate_dashboard

**Description**: Vue du tableau de bord des candidats avec statistiques agrégées.

**Colonnes**:
- user_id: Identifiant de l'utilisateur
- nom, prenom: Nom et prénom du candidat
- email: Email du candidat
- candidate_id: Identifiant du profil candidat
- ville: Ville de résidence
- photo: URL de la photo
- linkedin: URL du profil LinkedIn
- total_cvs: Nombre total de CVs
- default_cv_count: Nombre de CVs par défaut
- total_applications: Nombre total de candidatures
- pending_applications: Nombre de candidatures en attente
- shortlisted_applications: Nombre de candidatures shortlistées
- hired_applications: Nombre de candidatures acceptées
- total_interviews: Nombre total d'entretiens
- completed_interviews: Nombre d'entretiens complétés
- unread_notifications: Nombre de notifications non lues
- average_cv_score: Score moyen des analyses de CV

**Requête**:
```sql
SELECT 
    u.id AS user_id,
    u.nom, u.prenom, u.email,
    ce.id AS candidate_id,
    ce.ville, ce.photo, ce.linkedin,
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
```

**Utilisation**: Tableau de bord candidat, statistiques personnelles.

---

### 2. v_company_dashboard

**Description**: Vue du tableau de bord des entreprises avec statistiques agrégées.

**Colonnes**:
- user_id: Identifiant de l'utilisateur
- nom, prenom: Nom et prénom du contact
- email: Email du contact
- company_id: Identifiant de l'entreprise
- nom_entreprise: Nom de l'entreprise
- secteur: Secteur d'activité
- ville: Ville de l'entreprise
- logo: URL du logo
- verified: Indicateur de vérification
- total_job_offers: Nombre total d'offres
- active_job_offers: Nombre d'offres actives
- closed_job_offers: Nombre d'offres fermées
- expired_job_offers: Nombre d'offres expirées
- total_applications: Nombre total de candidatures reçues
- pending_applications: Nombre de candidatures en attente
- shortlisted_applications: Nombre de candidatures shortlistées
- hired_applications: Nombre de candidatures acceptées
- unread_notifications: Nombre de notifications non lues

**Utilisation**: Tableau de bord entreprise, statistiques de recrutement.

---

### 3. v_admin_dashboard

**Description**: Vue du tableau de bord des administrateurs avec statistiques globales.

**Colonnes**:
- user_id: Identifiant de l'administrateur
- nom, prenom: Nom et prénom
- email: Email
- total_candidates: Nombre total de candidats
- total_companies: Nombre total d'entreprises
- total_admins: Nombre total d'administrateurs
- total_job_offers: Nombre total d'offres
- active_job_offers: Nombre d'offres actives
- total_applications: Nombre total de candidatures
- total_cvs: Nombre total de CVs
- total_cv_analyses: Nombre total d'analyses
- total_interviews: Nombre total d'entretiens
- unread_notifications: Nombre de notifications non lues

**Utilisation**: Tableau de bord administrateur, statistiques globales.

---

### 4. v_unread_notifications

**Description**: Vue des notifications non lues avec informations utilisateur.

**Colonnes**:
- id: Identifiant de la notification
- user_id: Identifiant de l'utilisateur
- user_nom, user_prenom: Nom et prénom de l'utilisateur
- user_email: Email de l'utilisateur
- titre: Titre de la notification
- message: Message de la notification
- type: Type de notification
- date_envoi: Date d'envoi

**Utilisation**: Liste des notifications non lues, centre de notifications.

---

### 5. v_recent_analyses

**Description**: Vue des analyses de CV récentes avec informations candidat.

**Colonnes**:
- analysis_id: Identifiant de l'analyse
- cv_id: Identifiant du CV
- cv_titre: Titre du CV
- candidate_id: Identifiant du candidat
- user_id: Identifiant de l'utilisateur
- candidate_nom, candidate_prenom: Nom et prénom du candidat
- date_analyse: Date de l'analyse
- score_global: Score global
- statut: Statut de l'analyse
- resume: Résumé de l'analyse

**Utilisation**: Historique des analyses de CV, monitoring des traitements IA.

---

### 6. v_interview_statistics

**Description**: Vue des statistiques d'entretien avec détails complets.

**Colonnes**:
- session_id: Identifiant de la session
- candidate_id: Identifiant du candidat
- user_id: Identifiant de l'utilisateur
- candidate_nom, candidate_prenom: Nom et prénom du candidat
- offre_id: Identifiant de l'offre
- job_titre: Titre du poste
- company_name: Nom de l'entreprise
- date_session: Date de la session
- type_entretien: Type d'entretien
- duree: Durée en minutes
- statut: Statut de la session
- score_global: Score global
- total_questions: Nombre total de questions
- average_question_score: Score moyen des questions
- feedback_id: Identifiant du feedback
- points_forts: Liste des points forts
- points_faibles: Liste des points faibles
- conseils: Liste des conseils

**Utilisation**: Rapports d'entretien, analyse des performances.

---

### 7. v_top_recommended_jobs

**Description**: Vue des emplois les plus recommandés triés par score.

**Colonnes**:
- recommendation_id: Identifiant de la recommandation
- analyse_cv_id: Identifiant de l'analyse
- cv_id: Identifiant du CV
- cv_titre: Titre du CV
- candidate_id: Identifiant du candidat
- user_id: Identifiant de l'utilisateur
- candidate_nom, candidate_prenom: Nom et prénom du candidat
- offre_id: Identifiant de l'offre
- job_titre: Titre du poste
- job_description: Description du poste
- localisation: Localisation
- type_contrat: Type de contrat
- salaire_min, salaire_max: Fourchette salariale
- devise: Devise
- company_name: Nom de l'entreprise
- secteur: Secteur d'activité
- score_compatibilite: Score de compatibilité
- explication: Explication de la recommandation
- date_recommandation: Date de la recommandation

**Utilisation**: Recommandations d'emploi, matching candidat-offre.

---

### 8. v_applications_statistics

**Description**: Vue des statistiques de candidatures avec détails complets.

**Colonnes**:
- application_id: Identifiant de la candidature
- candidate_id: Identifiant du candidat
- candidate_user_id: Identifiant de l'utilisateur candidat
- candidate_nom, candidate_prenom: Nom et prénom du candidat
- candidate_email: Email du candidat
- offre_id: Identifiant de l'offre
- job_titre: Titre du poste
- job_description: Description du poste
- localisation: Localisation
- type_contrat: Type de contrat
- salaire_min, salaire_max: Fourchette salariale
- company_name: Nom de l'entreprise
- secteur: Secteur d'activité
- date_candidature: Date de la candidature
- statut: Statut de la candidature
- commentaire: Commentaire du candidat
- cover_letter_id: Identifiant de la lettre de motivation
- generated_by_ai: Indicateur de génération par IA
- days_since_application: Jours depuis la candidature

**Utilisation**: Suivi des candidatures, rapports de recrutement.

---

### 9. v_active_job_offers

**Description**: Vue des offres d'emploi actives avec statistiques de candidatures.

**Colonnes**:
- job_id: Identifiant de l'offre
- titre: Titre du poste
- description: Description du poste
- localisation: Localisation
- type_contrat: Type de contrat
- salaire_min, salaire_max: Fourchette salariale
- devise: Devise
- experience_requise: Expérience requise
- niveau_etude: Niveau d'études requis
- date_publication: Date de publication
- date_expiration: Date d'expiration
- company_id: Identifiant de l'entreprise
- nom_entreprise: Nom de l'entreprise
- secteur: Secteur d'activité
- ville: Ville de l'entreprise
- logo: URL du logo
- verified: Indicateur de vérification
- application_count: Nombre total de candidatures
- pending_count: Nombre de candidatures en attente
- shortlisted_count: Nombre de candidatures shortlistées
- hired_count: Nombre de candidatures acceptées

**Utilisation**: Liste des offres actives, marketplace d'emploi.

---

### 10. v_candidate_profile_complete

**Description**: Vue des profils candidats avec indicateur de complétude.

**Colonnes**:
- candidate_id: Identifiant du candidat
- user_id: Identifiant de l'utilisateur
- nom, prenom: Nom et prénom
- email: Email
- telephone: Numéro de téléphone
- date_naissance: Date de naissance
- genre: Genre
- adresse: Adresse
- ville: Ville
- photo: URL de la photo
- biographie: Biographie
- linkedin: URL LinkedIn
- github: URL GitHub
- portfolio: URL Portfolio
- cv_count: Nombre de CVs
- experience_count: Nombre d'expériences
- education_count: Nombre de formations
- skill_count: Nombre de compétences
- analysis_count: Nombre d'analyses
- profile_complete: Indicateur de complétude (TRUE/FALSE)

**Utilisation**: Évaluation de la complétude des profils, onboarding.

---

## Résumé des Vues

| Vue | But | Utilisation Principale |
|-----|-----|----------------------|
| v_candidate_dashboard | Statistiques candidat | Tableau de bord candidat |
| v_company_dashboard | Statistiques entreprise | Tableau de bord entreprise |
| v_admin_dashboard | Statistiques globales | Tableau de bord admin |
| v_unread_notifications | Notifications non lues | Centre de notifications |
| v_recent_analyses | Analyses CV récentes | Monitoring IA |
| v_interview_statistics | Statistiques entretien | Rapports d'entretien |
| v_top_recommended_jobs | Recommandations emploi | Matching candidat-offre |
| v_applications_statistics | Statistiques candidatures | Suivi recrutement |
| v_active_job_offers | Offres actives | Marketplace emploi |
| v_candidate_profile_complete | Complétude profil | Onboarding |

## Notes d'Architecture

- **Performance**: Les vues utilisent des indexes pour optimiser les performances.
- **Agrégation**: Les vues utilisent des fonctions d'agrégation (COUNT, AVG) pour les statistiques.
- **Filtrage**: Les vues filtrent les données inactives (is_active = FALSE).
- **Jointures**: Les vues utilisent des LEFT JOIN pour inclure les données NULL.
- **Ordre**: Les vues sont triées par date décroissante pour les données récentes.
- **Réutilisabilité**: Les vues peuvent être utilisées dans d'autres vues ou requêtes.
