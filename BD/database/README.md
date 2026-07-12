# TafLocal AI - PostgreSQL Database

## Description

Base de données PostgreSQL pour TafLocal AI, une plateforme d'assistant de carrière alimentée par l'IA.

## Caractéristiques

- **PostgreSQL 17+**
- **UTF8** - Encodage Unicode complet
- **Timezone UTC** - Gestion cohérente des dates/heures
- **UUID Primary Keys** - Identifiants universels uniques
- **Foreign Keys** - Intégrité référentielle
- **CHECK Constraints** - Validation des données
- **UNIQUE Constraints** - Unicité des données critiques
- **Indexes** - Optimisation des performances
- **Views** - Vues pour les tableaux de bord et rapports
- **Functions** - Fonctions utilitaires PostgreSQL
- **Triggers** - Automatisation des tâches
- **Transactions** - Gestion ACID des transactions
- **Compatible Django ORM** - Intégration avec Django

## Structure du Projet

```
database/
├── README.md
├── schema/
│   ├── 001_extensions.sql      # Extensions PostgreSQL
│   ├── 002_tables.sql          # Tables de la base de données
│   ├── 003_constraints.sql     # Contraintes additionnelles
│   ├── 004_indexes.sql         # Indexes de performance
│   ├── 005_views.sql           # Vues de reporting
│   ├── 006_functions.sql       # Fonctions utilitaires
│   ├── 007_triggers.sql        # Triggers automatiques
│   ├── 008_seed.sql            # Données de référence
│   ├── 009_demo_data.sql       # Données de démonstration
│   └── 010_drop.sql            # Script de suppression
└── documentation/
    ├── DataDictionary.md        # Dictionnaire de données
    ├── Tables.md                # Documentation des tables
    ├── Relationships.md         # Documentation des relations
    ├── Constraints.md           # Documentation des contraintes
    ├── Views.md                 # Documentation des vues
    ├── Functions.md             # Documentation des fonctions
    ├── Triggers.md              # Documentation des triggers
    └── ERD.md                   # Diagramme Entité-Relation
```

## Installation

### Prérequis

- PostgreSQL 17 ou supérieur
- Accès administrateur à la base de données

### Étapes d'Installation

1. **Créer la base de données**
   ```sql
   CREATE DATABASE taflocal_ai
   WITH ENCODING 'UTF8'
   LC_COLLATE='en_US.UTF-8'
   LC_CTYPE='en_US.UTF-8'
   TEMPLATE=template0;
   ```

2. **Exécuter les scripts dans l'ordre**
   ```bash
   # Connectez-vous à la base de données
   psql -d taflocal_ai

   # Exécutez les scripts séquentiellement
   \i schema/001_extensions.sql
   \i schema/002_tables.sql
   \i schema/003_constraints.sql
   \i schema/004_indexes.sql
   \i schema/005_views.sql
   \i schema/006_functions.sql
   \i schema/007_triggers.sql
   \i schema/008_seed.sql
   \i schema/009_demo_data.sql
   ```

3. **Vérifier l'installation**
   ```sql
   -- Vérifier les tables
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;

   -- Vérifier les données de démonstration
   SELECT role, COUNT(*) FROM utilisateur GROUP BY role;
   ```

## Utilisation

### Connexion

```bash
psql -h localhost -U postgres -d taflocal_ai
```

### Utilisateur par Défaut

- **Email**: admin@taflocal.ai
- **Mot de passe**: Admin123!
- **Rôle**: ADMIN

### Données de Démonstration

Le script `009_demo_data.sql` insère:
- 5 Administrateurs
- 20 Entreprises
- 50 Candidats
- 80 CVs
- 120 Offres d'emploi
- 250 Candidatures
- 80 Analyses de CV
- 250 Recommandations
- 40 Sessions d'entretien
- 200 Questions d'entretien
- 40 Feedbacks IA
- 300 Notifications

## Maintenance

### Nettoyer la Base de Données

```bash
psql -d taflocal_ai -f schema/010_drop.sql
```

### Réinitialiser la Base de Données

```bash
# Supprimer tout
psql -d taflocal_ai -f schema/010_drop.sql

# Recréer
psql -d taflocal_ai -f schema/001_extensions.sql
psql -d taflocal_ai -f schema/002_tables.sql
psql -d taflocal_ai -f schema/003_constraints.sql
psql -d taflocal_ai -f schema/004_indexes.sql
psql -d taflocal_ai -f schema/005_views.sql
psql -d taflocal_ai -f schema/006_functions.sql
psql -d taflocal_ai -f schema/007_triggers.sql
psql -d taflocal_ai -f schema/008_seed.sql
psql -d taflocal_ai -f schema/009_demo_data.sql
```

### Archiver les Offres Expirées

```sql
SELECT archive_expired_jobs();
```

### Marquer les Notifications comme Lues

```sql
SELECT mark_notifications_read('user-uuid', 'APPLICATION');
```

## Sécurité

### Mots de Passe

Les mots de passe sont hashés avec SHA256 via la fonction `pgcrypto`.

### Rôles

- **ADMIN**: Accès complet au système
- **CANDIDATE**: Accès limité aux fonctionnalités de candidat
- **COMPANY**: Accès limité aux fonctionnalités d'entreprise

### Audit

Toutes les modifications critiques sont journalisées dans la table `audit_log`.

## Performance

### Indexes

Les indexes sont créés sur:
- Colonnes fréquemment recherchées (email, role, statut)
- Colonnes de jointure (foreign keys)
- Colonnes de tri (created_at, date_publication)
- Colonnes de recherche textuelle (titre, description)

### Vues

Les vues matérialisées sont utilisées pour:
- Tableaux de bord utilisateurs
- Statistiques et rapports
- Données agrégées

## Documentation

Pour plus de détails sur la structure de la base de données, consultez:

- [Data Dictionary](documentation/DataDictionary.md) - Dictionnaire de données complet
- [Tables](documentation/Tables.md) - Documentation des tables
- [Relationships](documentation/Relationships.md) - Documentation des relations
- [Constraints](documentation/Constraints.md) - Documentation des contraintes
- [Views](documentation/Views.md) - Documentation des vues
- [Functions](documentation/Functions.md) - Documentation des fonctions
- [Triggers](documentation/Triggers.md) - Documentation des triggers
- [ERD](documentation/ERD.md) - Diagramme Entité-Relation

## Support

Pour toute question ou problème, contactez l'équipe technique de TafLocal AI.

## Licence

© 2026 TafLocal AI. Tous droits réservés.
