# Historial resumido de versiones digitales

## v0.1
Primer prototipo estático del SGC digital.

## v0.2
Identidad CAMPAR, documentación y arquitectura SGC integradas.

## v0.3
Primer flujo operativo conectado dentro del prototipo.

## v0.4
Rediseño formal/ejecutivo y nueva lógica de producción/inventario. Se establecen Cosme/Duma y etapas En corte/En armado/En estufado/Limpios.

## v0.5
Se exploró una vista orientada a reuniones y expediente de OC.

## v0.6
Depuración fuerte de interfaz a 7 módulos. Se identificó que simplificar demasiado había eliminado funciones esenciales.

## v0.7
Se recuperaron Nueva OC, Abrir/Ampliar/Reabrir OC, historial y apertura de inspecciones existentes.

## v0.8
Inicio se convirtió en hub de acceso rápido en lugar de dashboard saturado.

## v0.9 — referencia actual
Objetivo: validar lógica de punta a punta antes del backend.
Implementa de forma local:
- OC y asignaciones;
- movimientos productivos sin doble conteo;
- lotes al llegar a Limpios;
- inventario dinámico;
- inspección;
- liberación/NC;
- retrabajo/reinspección;
- entregas;
- cierre de OC;
- esquema preliminar PostgreSQL/Supabase.
