@echo off
setlocal

if "%~1"=="" (
  echo Uso: scripts\restore-database.cmd backups\sscc-YYYYMMDD-HHMMSS.dump
  exit /b 1
)

set ROOT=%~dp0..
set BACKUP_FILE=%~f1
set RESTORE_NAME=sscc-restore.dump

if not exist "%BACKUP_FILE%" (
  echo No existe el archivo:
  echo %BACKUP_FILE%
  exit /b 1
)

echo ATENCION: esto reemplaza los datos actuales de la base sscc.
choice /C SN /M "Confirmas restaurar este backup"
if errorlevel 2 exit /b 1

cd /d "%ROOT%"

docker ps --format "{{.Names}}" | findstr /x "sscc-postgres" >nul
if errorlevel 1 (
  echo Iniciando PostgreSQL...
  docker compose up -d postgres
)

docker cp "%BACKUP_FILE%" sscc-postgres:/tmp/%RESTORE_NAME%
if errorlevel 1 exit /b 1

docker exec sscc-postgres pg_restore -U sscc -d sscc --clean --if-exists /tmp/%RESTORE_NAME%
if errorlevel 1 exit /b 1

docker exec sscc-postgres rm /tmp/%RESTORE_NAME% >nul

echo Backup restaurado correctamente.
