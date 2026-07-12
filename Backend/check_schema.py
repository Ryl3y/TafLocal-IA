import os
import django
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

print("Schéma de la table utilisateur:")
try:
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT column_name, data_type, is_nullable, character_maximum_length
            FROM information_schema.columns 
            WHERE table_name = 'utilisateur' 
            ORDER BY ordinal_position
        """)
        for row in cursor.fetchall():
            print(f"{row[0]}: {row[1]} (nullable: {row[2]}, max_length: {row[3]})")
except Exception as e:
    print(f"Erreur: {e}")
    import traceback
    traceback.print_exc()
