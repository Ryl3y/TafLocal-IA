
import requests
import time
from html import unescape

print("Waiting 5 seconds...")
time.sleep(5)
print("Requesting /api/schema/...")
try:
    r = requests.get("http://127.0.0.1:8000/api/schema/")
    print(f"Status: {r.status_code}")
    if r.status_code == 500:
        # Find traceback in HTML
        start = r.text.find('ul class="traceback"')
        if start != -1:
            end = r.text.find('</ul>', start)
            traceback_html = r.text[start:end]
            print("\n=== TRACEBACK ===")
            print(unescape(traceback_html))
except Exception as e:
    print(f"Error: {e}")
