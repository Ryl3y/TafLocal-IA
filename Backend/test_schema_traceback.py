
import os
import sys
import traceback
from pathlib import Path

# Configure Django
BASE_DIR = Path(__file__).resolve().parent
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from drf_spectacular.generators import SchemaGenerator

try:
    print("Generating schema...")
    generator = SchemaGenerator()
    schema = generator.get_schema(request=None, public=True)
    print("SUCCESS! Schema generated!")
    print("Schema keys:", schema.keys())
except Exception as e:
    print("\n=== FULL TRACEBACK ===")
    print(traceback.format_exc())
