import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.urls import get_resolver, reverse

try:
    print('URL for user-me:', reverse('user-me'))
except Exception as e:
    print('Error:', e)
    import traceback
    print(traceback.format_exc())
