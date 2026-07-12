
import os
import django
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User, CandidateProfile, UserRole

# Check if test user already exists
email = "candidate@taflocal.ai"

try:
    user = User.objects.get(email=email)
    print(f"User {email} already exists!")

except User.DoesNotExist:
    print(f"Creating test user: {email}")
    user = User.objects.create_user(
        email=email,
        password="password123",
        nom="Test",
        prenom="Candidate",
        role=UserRole.CANDIDATE,
    )

    # Make sure candidate profile exists
    try:
        profile = user.candidate_profile
    except CandidateProfile.DoesNotExist:
        print("Creating candidate profile...")
        profile = CandidateProfile.objects.create(user=user)

    print(f"Test user created: {user}")

# Print all users in DB
print("\nAll users in DB:")
for u in User.objects.all():
    print(f"- {u.email}, role: {u.role}, id: {u.id}, is_active: {u.is_active}")
