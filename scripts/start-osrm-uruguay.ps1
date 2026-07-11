$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$required = Join-Path $root "infra\osrm\data\uruguay-latest.osrm"

if (-not (Test-Path $required)) {
  throw "No existe $required. Ejecuta primero scripts\prepare-osrm-uruguay.ps1"
}

docker compose --profile gps up -d osrm-uruguay
Write-Host "OSRM Uruguay disponible en http://127.0.0.1:5000"
