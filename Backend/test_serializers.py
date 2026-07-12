
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

print("Finding all serializers...")
serializer_files = list(BASE_DIR.rglob("*/serializers.py"))
for file in serializer_files:
    if ".venv" in file.parts or "__pycache__" in file.parts:
        continue
    module_name = file.relative_to(BASE_DIR).with_suffix("").as_posix().replace("/", ".")
    print(f"\nTrying to import {module_name}")
    try:
        module = __import__(module_name, fromlist=["*"])
        for attr_name in dir(module):
            attr = getattr(module, attr_name)
            try:
                from rest_framework.serializers import SerializerMetaclass
                if isinstance(attr, SerializerMetaclass) and attr_name != "Serializer" and attr_name != "ModelSerializer":
                    print(f"  Found serializer: {attr_name}")
                    # Try instantiating it and getting fields
                    print(f"  Trying to get fields for {attr_name}")
                    serializer_instance = attr()
                    fields = serializer_instance.get_fields()
                    print(f"  SUCCESS! Fields: {list(fields.keys())}")
            except Exception as e:
                import traceback
                print(f"  ERROR processing {attr_name}: {e}")
                print(f"  Stack trace: {traceback.format_exc()}")
    except Exception as e:
        import traceback
        print(f"  ERROR importing {module_name}: {e}")
        print(f"  Stack trace: {traceback.format_exc()}")
