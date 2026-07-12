
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from users.models import CandidateProfile
from django_filters.rest_framework import FilterSet

print("Trying to create filter set...")
try:
    class TestFilterSet(FilterSet):
        class Meta:
            model = CandidateProfile
            fields = ["ville", "genre"]  # What users.views.CandidateProfileViewSet has
    print("SUCCESS! FilterSet created!")
except Exception as e:
    import traceback
    print(f"ERROR creating filter set: {e}")
    print(f"STACK: {traceback.format_exc()}")

print("\nChecking every possible filter field for old names...")
try:
    from rest_framework.filters import DjangoFilterBackend
    backend = DjangoFilterBackend()
    # Simulate what drf_spectacular does with filter set
    from users.views import CandidateProfileViewSet
    viewset = CandidateProfileViewSet()
    print(f"View set filter set: {backend.get_filterset_class(viewset)}")
except Exception as e:
    print(f"ERROR with view set filter: {e}")
    import traceback
    print(traceback.format_exc())
