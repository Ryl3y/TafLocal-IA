
import os
import django
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT version();")
        row = cursor.fetchone()
        print("Connexion PostgreSQL reussie !")
        print(f"Version PostgreSQL : {row[0]}")
except Exception as e:
    print(f"Erreur de connexion : {e}")
