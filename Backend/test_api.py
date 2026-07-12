
import os
import django
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
import json

client = Client()

# Test registration data
register_data = {
    "email": "testuser123@example.com",
    "password": "Password123!",
    "password2": "Password123!",
    "role": "CANDIDATE",
    "nom": "Doe",
    "prenom": "John"
}

print("Testing registration...")
response = client.post('/api/auth/register/', json.dumps(register_data), content_type='application/json')
print(f"Status: {response.status_code}")
print("Response:", response.json())
