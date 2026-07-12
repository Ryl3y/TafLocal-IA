
import os
import django
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

print("Adding missing columns to utilisateur table...")
try:
    with connection.cursor() as cursor:
        # Add username column
        cursor.execute("""
            ALTER TABLE utilisateur 
            ADD COLUMN IF NOT EXISTS username VARCHAR(150) UNIQUE DEFAULT NULL
        """)
        print("Column username added")
        
        # Rename password column to mot_de_passe if it exists as password
        cursor.execute("""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'utilisateur' AND column_name = 'password'
                ) THEN
                    ALTER TABLE utilisateur RENAME COLUMN password TO mot_de_passe;
                END IF;
            END $$;
        """)
        print("Column password renamed to mot_de_passe (if it existed)")
        
        # Add mot_de_passe column if it doesn't exist
        cursor.execute("""
            ALTER TABLE utilisateur 
            ADD COLUMN IF NOT EXISTS mot_de_passe VARCHAR(128)
        """)
        print("Column mot_de_passe added (if it didn't exist)")
        
        # Add date_joined column
        cursor.execute("""
            ALTER TABLE utilisateur 
            ADD COLUMN IF NOT EXISTS date_joined TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        """)
        print("Column date_joined added")
        
    print("Database updated successfully!")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
