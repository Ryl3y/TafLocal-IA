
import os
import django
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

print("Mise à jour de la base de données...")
try:
    with connection.cursor() as cursor:
        # Ajouter is_staff
        cursor.execute("ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS is_staff BOOLEAN DEFAULT FALSE")
        print("Colonne is_staff ajoutée")
        # Ajouter is_superuser
        cursor.execute("ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS is_superuser BOOLEAN DEFAULT FALSE")
        print("Colonne is_superuser ajoutée")
        # Ajouter last_login
        cursor.execute("ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE")
        print("Colonne last_login ajoutée")
    print("Base de données mise à jour avec succès !")
except Exception as e:
    print(f"Erreur: {e}")
