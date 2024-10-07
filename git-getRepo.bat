@echo off
:: Zmienna dla folderu repozytorium
set REPO_PATH=C:\js\kiosk\

:: Przejdź do folderu repozytorium
cd /d %REPO_PATH%

:: Wyświetl aktualny stan repozytorium
echo Sprawdzanie zmian w repozytorium...

:: Pobierz najnowsze zmiany z repozytorium zdalnego
git pull origin main

:: Sprawdź status po operacji pull
if %errorlevel% neq 0 (
    echo Błąd podczas pobierania zmian.
    pause
    exit /b %errorlevel%
)

:: Uruchom aplikację (przykład Node.js)
echo Uruchamianie aplikacji...
npm start

pause
