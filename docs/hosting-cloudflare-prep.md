# Preparacion Hosting + Dominio + Cloudflare

Objetivo: dejar el CRM listo para publicarse con dominio propio, HTTPS y DNS ordenado.

## Estructura recomendada

```txt
tudominio.com
crm.tudominio.com       -> frontend Next.js
api.tudominio.com       -> backend NestJS
gps.tudominio.com       -> Traccar
www.tudominio.com       -> web institucional futura
```

Para arrancar rapido tambien se puede publicar todo con:

```txt
crm.tudominio.com       -> CRM
```

y que el frontend use la API interna del mismo servidor.

## Compra del hosting

Pedir o elegir un hosting/VPS que tenga:

- Ubuntu 22.04/24.04 o Debian 12.
- Acceso SSH.
- Docker permitido.
- Minimo 2 vCPU, 4 GB RAM para CRM basico.
- Mejor 4 vCPU, 8 GB RAM si tambien va Traccar, WhatsApp y procesos GPS.
- Disco SSD, minimo 60 GB.
- Backup automatico o snapshot.
- IP publica fija.

Evitar hosting compartido comun si no permite Node.js, Docker, procesos persistentes y PostgreSQL.

## DNS: hosting vs Cloudflare

Si el proveedor da dos DNS tipo:

```txt
ns1.proveedor.com
ns2.proveedor.com
```

eso significa que el proveedor puede manejar la zona DNS.

Recomendacion para Security Solutions:

1. Comprar dominio y hosting.
2. Crear cuenta/zone en Cloudflare.
3. Cloudflare entregara dos nameservers.
4. En el registrador del dominio, reemplazar los DNS del proveedor por los de Cloudflare.
5. Manejar todos los registros desde Cloudflare.

## Registros DNS iniciales

Si el servidor tiene IP publica `X.X.X.X`:

```txt
A     crm      X.X.X.X    Proxied: ON
A     api      X.X.X.X    Proxied: ON
A     gps      X.X.X.X    Proxied: OFF o ON segun Traccar/web
A     @        X.X.X.X    Proxied: ON si habra web principal
CNAME www      @          Proxied: ON
```

Para puertos GPS fisicos de Traccar, Cloudflare no proxyfica TCP comun en plan gratis. Los dispositivos GPS deben apuntar directo a un host DNS sin proxy, por ejemplo:

```txt
A gps-ingest X.X.X.X Proxied: OFF
```

Luego el GPS fisico usaria:

```txt
gps-ingest.tudominio.com:5023
```

## Variables de produccion

Copiar `.env.production.example` al servidor como `.env` y cambiar:

- `DATABASE_URL`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `NEXT_PUBLIC_API_URL`
- `INTERNAL_API_URL`
- claves de Gmail/WhatsApp/Google si se usan.

Ejemplo para produccion:

```txt
CORS_ORIGIN="https://crm.tudominio.com"
NEXT_PUBLIC_API_URL="https://api.tudominio.com"
INTERNAL_API_URL="http://127.0.0.1:3001"
```

## Checklist para manana

Antes de tocar DNS:

- Confirmar dominio comprado.
- Confirmar IP publica del servidor.
- Confirmar acceso SSH.
- Confirmar usuario sudo/root.
- Confirmar si Docker esta instalado.
- Confirmar si se usara Cloudflare como DNS principal.

Despues:

- Apuntar nameservers del dominio a Cloudflare.
- Crear registros `crm`, `api`, `gps` y `gps-ingest`.
- Instalar dependencias del servidor.
- Subir codigo.
- Crear `.env` de produccion.
- Levantar PostgreSQL.
- Ejecutar migraciones Prisma.
- Compilar frontend/backend.
- Configurar reverse proxy HTTPS.
- Probar login.
- Probar dashboard.
- Probar carga de presupuestos/trabajos.
- Probar backup.

## Decision recomendada

Para este proyecto conviene VPS + Docker + Cloudflare.

El hosting compartido puede servir para una web simple, pero para este CRM con API, PostgreSQL, GPS, WhatsApp y procesos en segundo plano, lo mas estable es VPS.
