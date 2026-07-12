import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User, CandidateProfile, UserRole

# Delete existing candidate user if exists
User.objects.filter(email='candidate@example.com').delete()

# Create candidate user
user = User.objects.create_user(
    email='candidate@example.com',
    password='candidate123',
    nom='Candidate',
    prenom='Test',
    role=UserRole.CANDIDATE
)

# Create candidate profile
CandidateProfile.objects.create(user=user)

print(f'Candidate created: {user.email}, role: {user.role}')
