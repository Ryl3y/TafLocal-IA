
import sys
import os
from pathlib import Path

# Configure Django
BASE_DIR = Path(__file__).resolve().parent
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

import inspect
import users.serializers

print("=== users.serializers file path:", users.serializers.__file__)
print("\n=== users.serializers source code:")
print(inspect.getsource(users.serializers))
