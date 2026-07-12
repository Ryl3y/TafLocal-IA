import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User, UserRole

# Delete existing admin user if exists
User.objects.filter(email='admin@example.com').delete()

# Create superuser
user = User.objects.create_superuser(
    email='admin@example.com',
    password='admin123',
    nom='Admin',
    prenom='Super'
)

print(f'Superuser created: {user.email}, role: {user.role}')
