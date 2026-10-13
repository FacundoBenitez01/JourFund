# Importación v152

Operaciones → Importar operaciones. Disponible para usuarios autenticados, sin restricción por rol.

- CSV/TSV con encabezados configurables; UTF-8 o UTF-16 con BOM. Separador detectado de la primera línea.
- HTML de MT5: tabla de posiciones cerradas con dos columnas Time/Fecha, Position/Ticket, Symbol/Activo, Type/Tipo y Profit/Resultado. Se usa la última fecha. No se importan deals, órdenes ni posiciones abiertas.
- Seleccionar cuenta y etapa. No replica al grupo. Confirmar moneda y operaciones cerradas.
- Seleccionar formato de fecha y separador decimal; neto por defecto en CSV. HTML bruto suma comisión, swap y fee con signo.
- La fecha es el día del informe, sin conversión horaria. Sin inventar riesgo, RR, precios ni capturas.
- Identificador SHA-256 por cuenta/ticket; sin ticket, por fecha/activo/P&L/lotaje. Repetidos se bloquean en toda la cuenta, incluyendo otras fases. Coincidencias con registros manuales requieren selección explícita.
- Archivos limitados a 5 MB y 5.000 filas. El archivo original no se almacena ni se sube. Metadatos de las últimas 10 importaciones en las preferencias de la cuenta.
- Deshacer elimina únicamente los registros intactos del lote. Cualquier edición/revisión bloquea toda la reversión. Las operaciones ya eliminadas se ignoran. No cambia estado/fase/capital ni restaura retiros.
- Usa snapshot/commit existentes, validación del workspace, protección de cambios concurrentes y sincronización offline. No incorpora polling ni migraciones.
- PDF necesita muestra real y no está admitido. Los fixtures HTML son sintéticos; validar un informe real antes de ampliar compatibilidad a otros formatos/brokers.

Validación: `node --test`, `node --check trade-import*.js` (cada archivo), `checks/trade-import-browser.cjs` y `checks/trade-review-browser.cjs` con Playwright. PC 1440 y móvil 390/320; Supabase y auth simulados, sin modificar usuarios reales. No prueba de iPhone físico.
