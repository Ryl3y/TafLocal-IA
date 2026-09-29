@echo off
REM Lance le backend depuis le dossier de ce script (plus de chemin absolu codé en dur)
cd /d "%~dp0"
echo Starting Django backend...
if exist .venv\Scripts\python.exe (
    .venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
) else (
    python manage.py runserver 0.0.0.0:8000
)
pause
