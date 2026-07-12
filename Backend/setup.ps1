# Script de configuration pour TafLocal AI Backend
# Ce script configure l'environnement de développement

Write-Host "=== Configuration de TafLocal AI Backend ===" -ForegroundColor Cyan

# Vérifier si .env existe déjà
if (Test-Path .env) {
    Write-Host "Le fichier .env existe déjà. Voulez-vous le remplacer ? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "O" -and $response -ne "o") {
        Write-Host "Configuration annulée." -ForegroundColor Red
        exit
    }
    Remove-Item .env
}

# Copier .env.example vers .env
Write-Host "Création du fichier .env à partir de .env.example..." -ForegroundColor Green
Copy-Item .env.example .env

# Générer une clé secrète Django
Write-Host "Génération d'une clé secrète Django..." -ForegroundColor Green
$secretKey = python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Remplacer la clé secrète dans .env
(Get-Content .env) -replace 'your-secret-key-here', $secretKey | Set-Content .env

Write-Host "=== Configuration terminée ===" -ForegroundColor Green
Write-Host "Le fichier .env a été créé avec succès." -ForegroundColor Green
Write-Host "Veuillez vérifier et modifier les paramètres suivants si nécessaire:" -ForegroundColor Yellow
Write-Host "  - DB_PASSWORD: mot de passe PostgreSQL" -ForegroundColor Yellow
Write-Host "  - DB_HOST: hôte PostgreSQL (par défaut: localhost)" -ForegroundColor Yellow
Write-Host "  - DB_PORT: port PostgreSQL (par défaut: 5432)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pour installer les dépendances, exécutez:" -ForegroundColor Cyan
Write-Host "  pip install -r requirements.txt" -ForegroundColor White
Write-Host ""
Write-Host "Pour tester la connexion à la base de données, exécutez:" -ForegroundColor Cyan
Write-Host "  python manage.py check --database default" -ForegroundColor White
