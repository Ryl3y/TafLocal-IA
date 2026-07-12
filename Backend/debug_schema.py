
import os
import sys
import traceback
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from drf_spectacular.generators import SchemaGenerator
from django.urls import get_resolver
from django.urls.resolvers import URLPattern

resolver = get_resolver()

def check_all_urls(patterns, prefix=''):
    for pattern in patterns:
        if isinstance(pattern, URLPattern):
            path = prefix + str(pattern.pattern)
            try:
                if hasattr(pattern.callback, 'cls'):
                    view_cls = pattern.callback.cls
                    print(f"\nChecking view: {view_cls} at path: {path}")
                    if hasattr(view_cls, 'serializer_class'):
                        print(f"  Serializer: {view_cls.serializer_class}")
                        if hasattr(view_cls.serializer_class, 'Meta'):
                            print(f"  Meta.fields: {getattr(view_cls.serializer_class.Meta, 'fields', None)}")
            except Exception as e:
                print(f"Error checking {path}: {e}")
                print(traceback.format_exc())
        else:
            new_prefix = prefix + str(pattern.pattern)
            check_all_urls(pattern.url_patterns, new_prefix)

try:
    print("Generating schema...")
    generator = SchemaGenerator()
    generator.parse(request=None, public=True)
    print("Schema generated okay!")
except Exception as e:
    print(f"Error generating schema: {type(e).__name__}: {e}")
    import inspect
    import traceback
    # Let's find which file/line number
    tb = traceback.extract_tb(sys.exc_info()[2])
    for frame in tb:
        print(f"\n--- Frame: {frame.filename}:{frame.lineno}")
        print(frame.line)
    print(traceback.format_exc())


print("\n--- Checking all URLs ---")
check_all_urls(resolver.url_patterns)

