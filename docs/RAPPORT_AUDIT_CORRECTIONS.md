# TafLocal IA — Rapport d'audit et des corrections

Ce document liste **tous les problèmes trouvés** dans le code (version
« phase 1 ») et **la correction appliquée** pour chacun. Il complète le
document `TafLocal-IA_Audit_Roadmap.docx` : les points de ce document ont été
vérifiés un par un, et l'audit du code a révélé de nombreux autres problèmes,
dont plusieurs empêchaient purement et simplement l'application de fonctionner.

État final vérifié :

- le serveur Django démarre **sans aucune clé d'API ni service externe** ;
- 66 tests automatisés passent (moteur IA, API, permissions) ;
- `npm run lint` : 0 problème (51 erreurs avant) ; `npm run build` : OK (échouait avant) ;
- parcours complet testé dans un vrai navigateur (inscription, connexion,
  analyse de CV, recommandations, candidature avec lettre IA, simulation
  d'entretien, notifications, classement des candidatures par l'entreprise,
  création d'offre, tableau de bord admin) : aucune erreur.

---

## 1. Suppression de Gemini et création d'une IA interne Django

**Avant.** `ai/services.py` appelait Google Gemini (`google-genai`) pour tout :
extraction de compétences, recommandations, questions d'entretien, feedback.
Problèmes :

- `from google import genai` au chargement du module, importé par
  `interviews/views.py` → **le serveur entier refusait de démarrer** si le
  paquet n'était pas installé (`ModuleNotFoundError`) ;
- sans `GEMINI_API_KEY`, chaque appel échouait et renvoyait un score par
  défaut de 50 — trompeur pour l'utilisateur ;
- un appel réseau par offre pour chaque recommandation (lent et coûteux) ;
- le code utilisait des champs qui n'existent pas (`job.title`,
  `job.requirements`, `job.skills_required`, `job.is_active`,
  `job.company.profile.company_name`, `candidate.experience_years`) : même
  avec une clé valide, la fonctionnalité était cassée ;
- l'upload de CV n'appelait jamais l'analyse : `cv_analysis/services.py` était
  un stub qui créait une analyse vide (score 0).

**Après.** Nouveau moteur `Backend/ai/engine/`, en Python pur (aucun modèle à
télécharger, aucune API) :

| Module | Rôle |
|---|---|
| `text.py` | normalisation (accents), racinisation FR/EN, similarité cosinus |
| `skills.py` | référentiel de ~160 compétences (informatique, finance, RH, marketing, logistique, santé, langues, savoir-être…) avec synonymes et compétences proches |
| `cv_parser.py` | lecture PDF (`pypdf`), DOCX (`python-docx`), DOC, TXT ; détection des sections, coordonnées, années d'expérience (fusion des périodes), niveau d'études (BTS → Doctorat, y compris HND/GCE) |
| `cv_analyzer.py` | score d'employabilité sur 5 critères, points forts, points faibles, compétences manquantes (d'après les offres réellement publiées), recommandations priorisées |
| `matching.py` | score de compatibilité sur 5 critères pondérés, compétences correspondantes/manquantes/proches, explication en français ; un critère inconnu est exclu au lieu de valoir « 50 » |
| `interview.py` | banque de questions (RH, comportementales, techniques par compétence), ciblage des compétences manquantes, évaluation de chaque réponse (mots-clés, pertinence, méthode STAR, exemples chiffrés, longueur), synthèse de session |
| `cover_letter.py` | lettre de motivation personnalisée |

La couche Django (`ai/services.py`) construit le profil complet du candidat
(compétences déclarées + compétences du CV, expériences, formations, ville),
met en cache les scores (`MatchResult`, invalidé automatiquement par
signaux quand le profil, le CV ou l'offre change) et crée les notifications.
L'analyse peut passer par Celery (`AI_USE_CELERY=True`) ; par défaut elle est
immédiate (moins d'une seconde).

Dépendances : `google-genai` et `PyPDF2` retirés, `pypdf` et `python-docx`
ajoutés. Le doublon `jobs/matching_service.py` a été supprimé.

---

## 2. Bugs bloquants (l'application ne fonctionnait pas)

| # | Problème | Fichier(s) | Correction |
|---|---|---|---|
| 1 | **Inscription impossible pour tout le monde** : le profil candidat/entreprise était créé deux fois (dans le sérialiseur puis dans la vue) → violation de contrainte unique → erreur 500. En plus, `Company` n'était pas importé dans le sérialiseur (`NameError` pour les entreprises). | `authentication/serializers.py`, `authentication/views.py` | Création unique dans une transaction, import ajouté, email/nom d'utilisateur en double refusés proprement. |
| 2 | **Déconnexion toujours en erreur** : `token.blacklist()` sans l'application `token_blacklist` installée ; les jetons n'étaient jamais révoqués. | `config/settings.py`, `authentication/views.py` | App ajoutée (migrations), la vue accepte `refresh` ou `refresh_token`. |
| 3 | **Erreurs 500 sur les entreprises et les entretiens** : `get_permissions()` renvoyait des classes (`[IsAuthenticated]`, `[IsCandidate \| IsCompany \| IsAdmin]`) au lieu d'instances. | `companies/views.py`, `interviews/views.py` | Permissions instanciées. |
| 4 | **Une entreprise ne pouvait pas créer d'offre** : le champ `entreprise` était obligatoire alors que le frontend ne l'envoie pas (400), et le formulaire envoyait l'expérience en texte (« Junior ») pour un champ entier. | `jobs/serializers.py`, `jobs/views.py`, `JobFormPage.tsx` | Entreprise déduite du compte connecté ; expérience en années ; statut brouillon/publié ; validations des salaires. |
| 5 | **Liste des offres toujours en erreur côté candidat** : le frontend filtrait `statut=ACTIVE`, valeur inexistante (400). Les types de contrat envoyés (« Stage », « Freelance ») n'existaient pas non plus. | `JobsListPage.tsx` | Filtres alignés sur les valeurs du backend ; le backend ne montre aux candidats que les offres publiées et non expirées. |
| 6 | **Déconnexion à chaque rechargement de page** : le jeton était écrit en texte brut par `apiClient` mais relu avec `JSON.parse` par `AuthContext` → échec → session effacée (refresh token compris). | `context/AuthContext.tsx` | Lecture cohérente du jeton ; écoute d'un événement « session expirée ». |
| 7 | **`npm run build` échouait** : 19 erreurs TypeScript dans la page Profil (champs `location`, `bio`, `first_name`… qui n'existent pas). | `ProfilePage.tsx` | Page réécrite sur les vrais champs. |
| 8 | **La page Profil plantait** : la liste des CV est paginée (`{count, results}`) mais était utilisée comme un tableau (`cvs.map is not a function`). | `cvServices.ts` | Déballage systématique des listes paginées (`unwrapList`). |
| 9 | **Chaque suppression était signalée comme une erreur** : `response.json()` sur une réponse 204 vide. | `apiClient.ts` | Gestion des réponses vides ; rafraîchissement du jeton partagé entre requêtes simultanées. |
| 10 | **Aucune notification n'était jamais créée** : le service utilisait des champs inexistants (`title`, `data`, `application.job.title`, `job.skills_required`…). | `notifications/services.py` | Service réécrit ; notifications envoyées à la candidature, au changement de statut, à la fin d'une analyse de CV et d'un entretien. |
| 11 | `common/filters.py` importait `EmploymentType` et `ExperienceLevel`, qui n'existent pas. | `common/filters.py` | Filtres réécrits sur les vrais modèles et utilisés par l'API des offres. |
| 12 | **Tous les tests étaient cassés** (factories sur `CompanyProfile`, `Role`, champs anglais inexistants). | `tests/` | Suite réécrite : 66 tests. |
| 13 | **Aucun bouton de déconnexion** dans toute l'interface. | `Navbar.tsx`, `MobileNav.tsx`, `SettingsPage.tsx` | Déconnexion dans la barre, le menu mobile et les paramètres. |
| 14 | Candidature en double → erreur 500 (contrainte unique) ; candidature possible sur une offre clôturée ou expirée. | `applications/serializers.py` | Validations explicites (400 avec message). |

---

## 3. Failles de sécurité

| Gravité | Problème | Correction |
|---|---|---|
| Critique | N'importe qui pouvait **s'inscrire comme ADMIN** (choix proposé dans le formulaire et accepté par l'API). | Seuls les rôles Candidat et Entreprise sont acceptés. |
| Critique | Un utilisateur pouvait **se donner le rôle ADMIN** via `PATCH /api/auth/profile/` (champ `role` modifiable). | `role` en lecture seule. |
| Élevée | Tout utilisateur connecté pouvait **modifier n'importe quelle entreprise** (et en créer). | Seul le propriétaire (ou un admin) modifie ; création réservée à l'admin. |
| Élevée | Tout utilisateur pouvait **lister, modifier ou supprimer n'importe quel profil candidat**. | Candidat : son profil ; entreprise : uniquement les candidats ayant postulé chez elle ; admin : tout. |
| Élevée | Les entreprises voyaient **tous les CV et toutes les analyses** de tous les candidats ; un CV pouvait être réaffecté à un autre candidat (`candidate` modifiable). | Cloisonnement identique aux profils ; CV non modifiables (upload/suppression seulement). |
| Élevée | Un candidat pouvait **modifier la question et le score** de ses entretiens. | Seule la réponse est modifiable ; le score est calculé par le serveur. |
| Moyenne | IDOR sur `/api/ai/match_job/` (`cv_id` arbitraire) et `/api/ai/job_recommendations/` (`candidate_id` arbitraire). | Le candidat est toujours l'utilisateur connecté. |
| Moyenne | N'importe qui pouvait **créer des notifications pour un autre utilisateur**. | Création réservée au serveur. |
| Moyenne | Les données d'inscription (dont le mot de passe) étaient **affichées dans les logs** (`print` côté Django, `console.log` côté React). | Supprimé. |
| Moyenne | Identifiants pré-remplis dans le formulaire de connexion ; scripts à la racine du backend avec **mots de passe en clair** (`admin123`, `password123`). | Formulaire vide ; 24 fichiers de debug supprimés (scripts, pages d’erreur HTML, SQL), remplacés par `python manage.py seed_demo`. |
| Faible | Pas de limitation de tentatives de connexion (force brute). | Limitation par IP sur connexion, inscription et réinitialisation ; limite dédiée aux calculs IA. |
| Faible | Upload de CV sans contrôle de taille ni d'extension (le validateur existait mais n'était jamais utilisé). | 5 Mo max, PDF/DOCX/DOC/TXT. |
| Faible | Un employeur pouvait mettre une candidature au statut « Retirée ». | Réservé au candidat. |

---

## 4. Fonctionnalités qui n'étaient que des maquettes

Ces pages affichaient des **données inventées** ou **simulaient** les actions
(`setTimeout`) : elles sont maintenant branchées sur l'API.

| Page | Avant | Après |
|---|---|---|
| Tableau de bord candidat | Score « 84/100 » et offres fictives | Dernière analyse, 3 meilleures offres, parcours réel |
| Analyse de CV | Upload simulé, historique fictif | Upload + analyse réelle, liste des CV, réanalyse, suppression |
| Résultat d'analyse | Score et textes fixes | Rapport réel : score détaillé, compétences, forces/faiblesses, recommandations |
| Offres recommandées | 3 offres inventées | Offres classées par le moteur IA avec explication, filtre de score |
| Détail d'une offre | « Northstar Labs » en dur | Offre réelle + détail de compatibilité |
| Candidater | Envoi simulé | Candidature réelle, lettre générée par l'IA |
| Entretien / feedback | 3 questions fixes, réponses jamais envoyées | Sessions réelles, évaluation de chaque réponse, feedback global |
| Notifications | Liste inventée | Notifications réelles, lu/non lu, suppression |
| Admin | « 2.4k utilisateurs » en dur | Statistiques réelles + état du moteur IA |
| Paramètres | Boutons sans effet | Changement de mot de passe + déconnexion |

Ajouts : page **Mes candidatures** (suivi et retrait), liens
« Toutes les offres », « Mes candidatures », « Entretien IA » dans le menu,
gestion des **compétences / expériences / formations** dans le profil
(indispensables au matching), **classement des candidatures** côté
entreprise avec l'avertissement « indicatif, n'est pas une recommandation de
recrutement », suggestion automatique des compétences requises d'une offre.

---

## 5. Autres corrections

- Services frontend obsolètes supprimés (`jobServices.ts`, `candidateServices.ts`,
  `companyServices.ts` qui appelait `/users/companies/`, `demoServices.ts`).
- Modèles : ajout de `Job.exigences` et `Job.competences_requises`
  (référentiel `Skill`), des champs d'évaluation des questions d'entretien et
  du détail des analyses de CV ; migration en attente dans `users` générée ;
  toutes les migrations sont réversibles et sans perte de données.
- Libellés des statuts traduits (« Pending » → « En attente », etc.) ;
  `LANGUAGE_CODE = fr-fr`, fuseau `Africa/Douala`.
- `.env.example` : le port 5173 de Vite manquait dans `CORS_ALLOWED_ORIGINS`
  (le frontend était bloqué par CORS) ; option `DB_ENGINE=sqlite`.
- `start_backend.bat` contenait un chemin absolu (`d:\Projet_Perso\...`).
- Expression régulière du validateur de téléphone invalide (`bad character range`).
- Middleware d'audit réactivé et corrigé (`request.pk` n'existait pas).
- Les classes de limitation de débit ignoraient les réglages de `settings.py`.
- Logo référencé par `/src/assets/...` : cassé une fois l'application compilée.
- Barre de navigation : la recherche, la cloche (avec compteur de non-lues) et
  l'avatar (initiales) fonctionnent.
- Mot de passe : le formulaire acceptait 6 caractères alors que Django en exige 8.
- Réglages HTTPS (cookies sécurisés hors mode debug), avertissements Swagger
  corrigés (schéma OpenAPI généré sans erreur).
- Fichiers supprimés : `Backend/DOCUMENTATION.md` (obsolète, remplacé par le
  `README.md` principal), scripts de debug et pages d'erreur HTML à la racine du backend.

---

## 6. Limites connues / suites possibles

- **Réinitialisation du mot de passe par email** : l'endpoint répond mais
  aucun email n'est envoyé (il faut configurer un serveur SMTP).
- **CV scannés** (PDF image) : pas de reconnaissance de caractères (OCR) ; le
  candidat reçoit un message explicite.
- **Phase 2 de la feuille de route** (embeddings locaux type
  sentence-transformers) : le moteur est conçu pour l'accueillir — il
  suffirait de remplacer `_semantic_component` dans `ai/engine/matching.py`.
- Le schéma SQL de `BD/database` (scripts manuels) n'a pas été modifié : les
  migrations Django font foi pour les nouvelles tables (`resultat_matching`,
  `competence_catalogue`, etc.).
