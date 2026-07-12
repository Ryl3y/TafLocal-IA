
import os
import sys
import traceback
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.urls import get_resolver, URLPattern
from drf_spectacular.openapi import AutoSchema

print("Finding all URL patterns...")
def list_patterns(patterns, prefix=""):
    for p in patterns:
        if isinstance(p, URLPattern):
            path = prefix + str(p.pattern)
            print(f"\nFound URL pattern: {path}")
            if hasattr(p.callback, "view_class"):
                view_class = p.callback.view_class
                print(f"  View class: {view_class}")
                try:
                    # Try to get the serializer class
                    if hasattr(view_class, "get_serializer_class"):
                        try:
                            serializer_cls = view_class.get_serializer_class()
                            print(f"    get_serializer_class(): {serializer_cls}")
                            if hasattr(serializer_cls, "Meta"):
                                print(f"    Serializer.Meta.fields: {getattr(serializer_cls.Meta, 'fields', '<not set>')}")
                        except Exception as e:
                            print(f"    ERROR getting serializer for {path}: {type(e)} - {e}")
                    # Try to get filterset fields
                    if hasattr(view_class, "filterset_fields"):
                        print(f"    filterset_fields: {view_class.filterset_fields}")
                except Exception as e:
                    print(f"    ERROR examining {view_class}: {type(e)} - {e}")
                    print(f"    STACK TRACE:\n{traceback.format_exc()}")
        else:
            try:
                list_patterns(p.url_patterns, prefix + str(p.pattern))
            except Exception as e:
                print(f"ERROR listing subpatterns: {e}")

list_patterns(get_resolver().url_patterns)

