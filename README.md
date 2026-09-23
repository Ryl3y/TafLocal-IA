# TafLocal-IA

Plateforme intelligente de recrutement et d'accompagnement à l'employabilité,
développée avec **React (Vite + TypeScript)**, **Django REST Framework** et
**PostgreSQL**.

L'intelligence artificielle est **entièrement interne** (paquet Django
`Backend/ai/engine`) : aucune clé d'API, aucun appel à un service externe
(l'ancienne dépendance à Google Gemini a été supprimée).

| Fonctionnalité | Qui | Où |
|---|---|---|
| Analyse de CV (PDF, DOCX, DOC, TXT) : compétences, score d'employabilité, points forts/faibles, recommandations | Candidat | `/cv-analysis` |
| Offres recommandées, classées par compatibilité avec explication | Candidat | `/jobs/recommended` |
| Détail de compatibilité avec une offre | Candidat | `/jobs/:id` |
| Lettre de motivation générée | Candidat | `/jobs/:id/apply` |
| Simulation d'entretien (questions ciblées + évaluation de chaque réponse + feedback global) | Candidat | `/interview` |
| Classement indicatif des candidatures reçues | Entreprise | `/company/applications` |
| Suggestion des compétences requises depuis la description d'une offre | Entreprise | `/company/jobs/create` |
| Statistiques de la plateforme et état du moteur IA | Admin | `/admin/dashboard` |

Le rapport d'audit et la liste de toutes les corrections se trouvent dans
[`docs/RAPPORT_AUDIT_CORRECTIONS.md`](docs/RAPPORT_AUDIT_CORRECTIONS.md).

---

## Démarrage rapide

### 1. Backend (Django)

Prérequis : Python 3.11+ et PostgreSQL 14+.

```bash
cd Backend
python -m venv .venv
# Windows : .venv\Scripts\activate    Linux/macOS : source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env          # puis renseignez SECRET_KEY et l'accès PostgreSQL
# (Windows PowerShell : .\setup.ps1 crée le .env et génère la clé secrète)

createdb taflocal_ai          # ou via pgAdmin
python manage.py migrate
python manage.py seed_demo    # comptes et offres de démonstration (mot de passe affiché)
python manage.py runserver
```

> Pas de PostgreSQL sous la main ? Mettez `DB_ENGINE=sqlite` dans `.env`
> pour un essai rapide.

- API : http://127.0.0.1:8000/api/
- Documentation Swagger : http://127.0.0.1:8000/api/docs/
- Administration Django : http://127.0.0.1:8000/admin/

### 2. Frontend (React)

Prérequis : Node.js 20+.

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_BASE_URL=http://127.0.0.1:8000/api
npm run dev                   # http://localhost:5173
```

### 3. Comptes de démonstration

Créés par `python manage.py seed_demo` (le mot de passe commun est affiché
par la commande, ou choisi avec `--password`) :

| Rôle | Email |
|---|---|
| Candidat | `candidat@taflocal.demo` |
| Entreprise | `recrutement@taflocal.demo` |
| Administrateur | `admin@taflocal.demo` |

---

## Le moteur IA interne

Le code se trouve dans `Backend/ai/` :

```
ai/
├── engine/            # Python pur, indépendant de Django, testé unitairement
│   ├── text.py          normalisation (accents), racinisation, similarité cosinus
│   ├── skills.py        référentiel de ~160 compétences (tech, finance, RH, langues...) + synonymes
│   ├── cv_parser.py     lecture PDF/DOCX/DOC/TXT, sections, coordonnées, années d'expérience, niveau d'études
│   ├── cv_analyzer.py   score d'employabilité (5 critères), forces, faiblesses, recommandations
│   ├── matching.py      compatibilité candidat ↔ offre (5 critères pondérés + explication)
│   ├── interview.py     banque de questions, génération ciblée, évaluation des réponses (STAR, mots-clés...)
│   └── cover_letter.py  lettre de motivation personnalisée
├── services.py        couche Django (profils, cache, enregistrement, notifications)
├── models.py          MatchResult : cache des scores (invalidé automatiquement par signaux)
├── signals.py         invalidation du cache quand un profil, un CV ou une offre change
├── views.py / urls.py API /api/ai/...
└── tasks.py           tâche Celery optionnelle (AI_USE_CELERY=True)
```

**Score de compatibilité** (0-100) = moyenne pondérée de :
compétences 45 % · expérience 20 % · proximité sémantique du profil 15 % ·
localisation 10 % · formation 10 %. Un critère non renseigné (ex. offre sans
expérience demandée) est exclu et son poids redistribué : le moteur n'affiche
jamais de score « par défaut ». Chaque score est accompagné des compétences
correspondantes/manquantes et d'une explication en français.

**Score d'employabilité du CV** = compétences 35 % · expérience 25 % ·
formation 15 % · structure du CV 15 % · coordonnées 10 %.

Le classement des candidatures côté entreprise est **indicatif** : il ne
constitue pas une décision ni une recommandation de recrutement.

---

## Principales routes de l'API

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/api/auth/register/`, `/api/auth/login/`, `/api/auth/logout/` | tous |
| GET/PATCH | `/api/users/candidates/me/` | candidat |
| CRUD | `/api/users/skills/`, `/api/users/experiences/`, `/api/users/formations/` | candidat |
| CRUD | `/api/jobs/` (+ `archive/`, `activate/`) | entreprise (lecture publique) |
| GET | `/api/jobs/match_for_me/` · `/api/jobs/{id}/match/` | candidat |
| GET | `/api/jobs/{id}/applications/ranked/` · `/api/applications/ranked/` | entreprise |
| CRUD | `/api/applications/` (+ `withdraw/`) | candidat / entreprise |
| POST | `/api/cv-analysis/cvs/` (upload + analyse) · `cvs/{id}/analyze/` · `cvs/latest/` | candidat |
| POST | `/api/interviews/sessions/` · `{id}/answer/` · `{id}/complete/` | candidat |
| POST | `/api/ai/cover_letter/` · `/api/ai/extract_skills/` · GET `/api/ai/skills/` · `/api/ai/health/` | selon le cas |
| GET | `/api/notifications/` (+ `mark_read/`, `mark_all_read/`, `unread_count/`) | tous |

La liste complète et les schémas sont dans Swagger (`/api/docs/`).

---

## Tests et qualité

```bash
# Backend : 66 tests (moteur IA, API, permissions)
cd Backend && pytest

# Frontend
cd frontend && npm run lint && npm run build
```
