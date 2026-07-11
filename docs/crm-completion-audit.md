# Auditoria de cierre del CRM

Fecha: 2026-07-11

## Estado general

El CRM ya tiene una base operativa amplia: clientes, sitios, equipos, agenda, despachador, presupuestos, ordenes de trabajo, almacen, gastos e ingresos, vehiculos, Traccar, OSRM y WhatsApp. La compilacion de API y web esta limpia.

La prioridad ahora es cerrar consistencia, auditoria y experiencia de uso para que el sistema sea confiable en operacion real y vendible como servicio.

Avance ejecutado:

- Tabla y endpoint de auditoria operativa creados.
- Pantalla de Auditoria disponible en el menu lateral del CRM.
- Auditoria conectada a vehiculos, Traccar y WhatsApp.
- Auditoria conectada a almacén: articulos, movimientos, salidas agrupadas, facturas importadas y eliminaciones.
- Auditoria conectada a gastos e ingresos: altas, ediciones y eliminaciones.
- Auditoria conectada a presupuestos: creacion, modificacion, aprobacion y eliminacion.

## Lo que esta fuerte

- Presupuesto aprobado genera orden de trabajo, materiales y flujo operativo.
- Almacen soporta entradas por factura, stock, salidas y consumos internos.
- Gastos e ingresos ya separan movimientos, monedas y pagos operativos.
- Vehiculos tienen Traccar, comandos, resumen GPS, alertas WhatsApp y logs auditados.
- OSRM local corrige recorridos sobre calles sin mandar datos de clientes a servicios publicos.
- WhatsApp/OpenWA ya envia desde el CRM y registra exito o falla por vehiculo.

## Riesgos antes de vender

- Hay mucho codigo de interfaz concentrado en `apps/web/app/page.tsx`; conviene separar componentes por modulo para mantenimiento.
- Falta una pantalla de auditoria global: quien cambio stock, quien aprobo presupuesto, quien envio comando GPS, quien marco pago.
- Falta un flujo cerrado de conciliacion mensual: ingresos cobrados, egresos reales, rentabilidad por trabajo, rentabilidad por proveedor y diferencia por moneda.
- Falta permisos finos por rol: operador, tecnico, supervisor, administracion y cliente.
- Faltan pruebas automaticas para los flujos criticos: aprobar presupuesto, descontar almacen, completar orden, registrar gasto, enviar alerta GPS.
- Falta politica clara de respaldo/restauracion y limpieza de datos de prueba.

## Orden recomendado para terminar

1. **Auditoria y permisos**
   - Auditoria base implementada para los modulos mas sensibles.
   - Falta registrar actor real desde el usuario autenticado en cada accion.
   - Separar permisos internos y futuros accesos de clientes.
   - Bloquear acciones peligrosas: eliminar facturas, bloquear motor, borrar movimientos financieros.

2. **Cierre financiero real**
   - Pantalla de cierre mensual por moneda y equivalente.
   - Diferenciar cobrado, pendiente, costo de almacen, gasto operativo y ganancia estimada/real.
   - Confirmar que movimientos pendientes no cuenten como ganancia hasta tener metodo y estado de pago.

3. **Portal cliente**
   - Vista limitada por cliente: vehiculos, ubicacion, recorridos, reportes, ordenes e informes tecnicos.
   - Enlaces compartidos con vencimiento o usuario/clave.
   - Branding Security Solutions sin exponer Traccar completo.

4. **Monitoreo GPS premium**
   - Reglas automaticas: panico, contacto fuera de horario, salida de geozona, exceso sostenido, desconexion.
   - Notificaciones WhatsApp configurables por vehiculo y por evento.
   - Reporte diario/semanal PDF con logo, mapa, paradas y resumen.

5. **Mantenimiento y calidad**
   - Separar `page.tsx` en componentes.
   - Agregar tests de backend para flujos criticos.
   - Crear datos demo limpios y backups programados.

## Proximo bloque sugerido

Implementar **Auditoria Operativa Global**.

Motivo: es la base para confiar en todo lo demas. Antes de sumar mas botones, conviene saber exactamente quien hizo cada cambio y poder revisar historiales sin tocar la base de datos.

Alcance inicial:

- Modelo `AuditLog`.
- Servicio reutilizable de auditoria.
- Registrar acciones en:
  - presupuestos aprobados/rechazados,
  - ordenes completadas,
  - movimientos de almacen,
  - gastos e ingresos,
  - comandos Traccar,
  - alertas WhatsApp fallidas,
  - cambios de configuracion Traccar.
- Vista en Dashboard o modulo nuevo: filtros por modulo, usuario, fecha, cliente, trabajo y severidad.

## Despues de auditoria

Seguir con **Cierre financiero mensual**. Ese modulo debe usar la auditoria y los movimientos reales para mostrar una foto confiable del negocio.
