@echo off
setlocal

set ROOT=%~dp0..
cd /d "%ROOT%"

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set STAMP=%%i
set BACKUP_DIR=%ROOT%\backups
set BACKUP_NAME=sscc-%STAMP%.dump

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

docker ps --format "{{.Names}}" | findstr /x "sscc-postgres" >nul
if errorlevel 1 (
  echo Iniciando PostgreSQL...
  docker compose up -d postgres
)

echo Creando backup %BACKUP_NAME%...
docker exec sscc-postgres pg_dump -U sscc -d sscc -Fc -f /tmp/%BACKUP_NAME%
if errorlevel 1 exit /b 1

docker cp sscc-postgres:/tmp/%BACKUP_NAME% "%BACKUP_DIR%\%BACKUP_NAME%"
if errorlevel 1 exit /b 1

docker exec sscc-postgres rm /tmp/%BACKUP_NAME% >nul

echo Backup creado:
echo %BACKUP_DIR%\%BACKUP_NAME%
