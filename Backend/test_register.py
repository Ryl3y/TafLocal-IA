
import os
import django
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User, UserRole

print("Test creation d'un utilisateur...")
try:
    user = User.objects.create_user(
        email="test@example.com",
        password="password123",
        nom="Test",
        prenom="User",
        role=UserRole.CANDIDATE
    )
    print(f"Utilisateur cree ! ID: {user.id}, Email: {user.email}")
    
    # Testons la generation de token
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    print(f"Token access: {refresh.access_token}")
    print("Succes !")
except Exception as e:
    print(f"Erreur: {e}")
    import traceback
    traceback.print_exc()
