# Modelo de datos v0.9

La unidad central de trazabilidad es el **lote**. Cada lote mantiene vínculo con:

`OC → Partida → Asignación → Aserradero → Producción → Lote → Inspección → NC / Liberación → Entrega`

## Entidades incluidas
- Usuarios
- Productos
- Órdenes de compra
- Partidas de OC
- Aserraderos
- Asignaciones
- Movimientos de producción
- Lotes
- Inspecciones
- No conformidades
- Entregas
- Documentos
- Historial de auditoría

La interfaz v0.9 todavía usa `localStorage` únicamente para validar el flujo antes de conectar PostgreSQL/Supabase.
