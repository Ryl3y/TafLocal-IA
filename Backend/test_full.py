
import subprocess
import time
import requests
import threading
import sys

def stream_output(stream, name):
    while True:
        line = stream.readline()
        if not line:
            break
        print(f"[{name}] {line.rstrip()}")

print("Starting server...")
server = subprocess.Popen(
    [r".venv\Scripts\python.exe", "manage.py", "runserver", "--noreload"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    cwd="."
)
stdout_thread = threading.Thread(target=stream_output, args=(server.stdout, "STDOUT"))
stderr_thread = threading.Thread(target=stream_output, args=(server.stderr, "STDERR"))
stdout_thread.daemon = True
stderr_thread.daemon = True
stdout_thread.start()
stderr_thread.start()

print("Waiting for server to start...")
time.sleep(10)

print("Making request to /api/docs/...")
try:
    response = requests.get("http://127.0.0.1:8000/api/docs/")
    print(f"Status: {response.status_code}")
except Exception as e:
    print(f"Request failed: {e}")
    import traceback
    print(traceback.format_exc())

print("Giving server a sec to log errors...")
time.sleep(2)
print("Stopping server...")
server.terminate()
try:
    server.wait(timeout=5)
except subprocess.TimeoutExpired:
    server.kill()
print("Test complete!")
