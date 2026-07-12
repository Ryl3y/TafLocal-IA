import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User, CandidateProfile
from cv_analysis.models import CV

print('Users:', list(User.objects.all()))
print('Candidate Profiles:', list(CandidateProfile.objects.all()))
print('CVs:', list(CV.objects.all()))
