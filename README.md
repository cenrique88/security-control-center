# Security Solutions Control Center (SSCC)

CRM especializado para empresas de seguridad electronica.

SSCC no busca adaptar una empresa de seguridad a un CRM generico. La idea es construir una herramienta diaria para operar clientes, trabajos, presupuestos, equipos instalados, mantenimientos, cobros, agenda, comunicaciones, GPS y monitoreo desde un mismo lugar.

## Modulos previstos

- Dashboard
- Centro de Monitoreo
- Clientes
- Trabajos
- Agenda
- Presupuestos
- Cobros
- Inventario
- Equipos instalados
- Vehiculos
- GPS
- Gmail
- WhatsApp
- Reportes
- Configuracion

## Stack

- Frontend: Next.js + React
- Backend: NestJS
- Base de datos: PostgreSQL
- ORM: Prisma
- Automatizaciones: n8n
- Correo: Gmail
- Agenda: Google Calendar
- WhatsApp: Evolution API
- GPS: Traccar
- Infraestructura: Proxmox + Docker

## Estructura

```txt
apps/
  api/      Backend NestJS
  web/      Frontend Next.js
packages/
  db/       Prisma schema y cliente compartido
```

## Primer bloque

El primer bloque del sistema deja preparada la base para:

- Autenticacion por email y password con JWT.
- Usuarios con roles.
- Dashboard operativo protegido.
- Centro de Monitoreo como pantalla principal conectado al backend.
- Base de datos PostgreSQL con Prisma.

## Rutas iniciales

Frontend:

- `/login`: ingreso y registro del primer usuario.
- `/`: Dashboard / Centro de Monitoreo protegido por sesion local.

Backend:

- `POST /api/auth/register`: crea usuario y devuelve JWT.
- `POST /api/auth/login`: autentica usuario y devuelve JWT.
- `GET /api/dashboard/summary`: resumen operativo protegido con Bearer token.

## Desarrollo local

1. Copiar las variables de entorno:

```bash
cp .env.example .env
```

2. Levantar PostgreSQL:

```bash
docker compose up -d postgres
```

3. Instalar dependencias:

```bash
npm install
```

4. Generar Prisma y aplicar migraciones:

```bash
npm run db:generate
npm run db:migrate
```

5. Ejecutar frontend y backend:

```bash
npm run dev
```

En Windows, si PowerShell bloquea `npm.ps1`, usar:

```bash
npm.cmd run dev
```
