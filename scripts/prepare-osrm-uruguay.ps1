param(
  [string]$MapUrl = "https://download.geofabrik.de/south-america/uruguay-latest.osm.pbf"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$dataDir = Join-Path $root "infra\osrm\data"
$mapFile = Join-Path $dataDir "uruguay-latest.osm.pbf"

New-Item -ItemType Directory -Force -Path $dataDir | Out-Null

if (-not (Test-Path $mapFile)) {
  Write-Host "Descargando mapa Uruguay desde Geofabrik..."
  Invoke-WebRequest -Uri $MapUrl -OutFile $mapFile
}

$dockerDataDir = $dataDir -replace "\\", "/"
Write-Host "Preparando OSRM extract..."
docker run --rm -t -v "${dockerDataDir}:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/uruguay-latest.osm.pbf

Write-Host "Preparando particiones MLD..."
docker run --rm -t -v "${dockerDataDir}:/data" osrm/osrm-backend osrm-partition /data/uruguay-latest.osrm

Write-Host "Personalizando pesos MLD..."
docker run --rm -t -v "${dockerDataDir}:/data" osrm/osrm-backend osrm-customize /data/uruguay-latest.osrm

Write-Host "OSRM Uruguay listo. Inicia con: docker compose --profile gps up -d osrm-uruguay"
