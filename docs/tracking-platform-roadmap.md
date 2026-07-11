# Plataforma GPS Security Solutions

## Base instalada

- CRM conectado a Traccar para vehiculos, eventos, comandos, resumen diario y alertas WhatsApp por vehiculo.
- OSRM privado para Uruguay instalado con Docker y mapa de Geofabrik.
- Variables activas en `.env`:
  - `OSRM_BASE_URL="http://127.0.0.1:5000"`
  - `OSRM_MAP_MATCHING="true"`
  - `OSRM_ALLOW_PUBLIC="false"`
- Identidad visual por vehiculo en el CRM: marca, modelo, color, color visual, icono y logo URL.
- Centro de Monitoreo inicial en el modal de Vehiculos: mapa operativo propio, ruta corregida/filtrada, paradas, marcador final, estado y accesos a Google Maps.
- Alertas WhatsApp auditadas por vehiculo: prueba, comandos y eventos Traccar quedan guardados con numero, estado, evento, error y fecha.
- Imagen de vehiculo seleccionable desde archivo PNG/JPG/WEBP, comprimida y reutilizada en lista, mapa y futuras vistas de cliente.
- Alertas WhatsApp enriquecidas con geozona, coordenadas, enlace Google Maps y datos reales de posicion cuando Traccar entrega `positionId`.

## Por que OSRM primero

OSRM tiene servicio `match` para ajustar puntos GPS a la red vial. Esto ataca el problema visible de recorridos dibujados por fuera de las calles. El CRM queda preparado para usar OSRM local, evitando mandar recorridos de clientes a un servicio publico.

Fuente: https://project-osrm.org/docs/v5.24.0/api/#match-service

Mapa Uruguay:
https://download.geofabrik.de/south-america/uruguay.html

Imagen Docker OSRM:
https://hub.docker.com/r/osrm/osrm-backend

## Traccar como motor, CRM como experiencia premium

Traccar soporta comandos de GPS, incluyendo comandos personalizados y cola de comandos cuando el dispositivo esta offline. Tambien soporta eventos, geozonas y canales de notificacion.

Fuentes:
- Comandos: https://www.traccar.org/commands/
- Geozonas: https://www.traccar.org/geofences/
- Notificaciones: https://www.traccar.org/notifications/
- API: https://www.traccar.org/api-reference/

La estrategia recomendada es:

1. Usar Traccar como motor tecnico confiable.
2. Usar el CRM como panel operativo y portal de cliente con identidad Security Solutions.
3. Evitar modificar el core de Traccar al inicio; primero construir branding, alertas, reportes, auditoria y automatizaciones desde el CRM.
4. Cuando el flujo este probado, evaluar personalizacion visual de Traccar o un frontend propio completo conectado por API.

## Diferenciadores para vender mejor

- Recorrido corregido sobre calles con OSRM privado.
- Reportes por cliente con logo, color del vehiculo y resumen entendible.
- Alertas WhatsApp por vehiculo: panico, contacto encendido/apagado, ingreso/salida de geozona, exceso de velocidad, desconexion/conexion.
- Comandos de seguridad desde CRM con confirmacion: consultar estado, bloquear motor, restaurar motor.
- Geozonas operativas para clientes, base, talleres, proveedores y zonas de riesgo.
- Auditoria de eventos y comandos para saber quien hizo que y cuando.
- Portal cliente Security Solutions, sin exponer el panel tecnico completo.

## Siguientes pasos tecnicos

1. Agregar selector visual avanzado de icono por tipo/modelo de vehiculo.
2. Crear reglas automaticas: alarma + motor encendido, geozona fuera de horario, exceso de velocidad sostenido.
3. Crear reporte PDF de recorrido diario/semanal con marca Security Solutions.
4. Crear portal cliente con vista limitada por vehiculo/empresa.
5. Separar permisos: operador interno, supervisor, cliente.
6. Evaluar mapa con tiles reales en el CRM: Leaflet/OpenStreetMap privado, Google Maps o portal propio sobre Traccar.
