
@echo off
cd /d "d:\Projet_Perso\TafLocal-IA\Backend"
echo Starting Django backend...
.venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
pause
