# CAMPAR SGC Digital v0.9

Prototipo funcional para validar el flujo operativo completo antes de conectar un backend multiusuario.

## Flujo implementado
`OC → Asignación Cosme/Duma → En corte → En armado → En estufado → Limpios → Inspección → Liberación/NC → Entrega → Cierre`

## Funciones principales
- Crear, abrir, ampliar y reabrir OC.
- Distribuir cantidades entre Cosme y Duma.
- Mover cantidades entre etapas sin doble conteo.
- Crear lotes automáticamente al entrar a Limpios.
- Inventario dinámico por producto y aserradero.
- Inspección desde lotes Limpios con muestra sugerida.
- Liberación por Gustavo o Alessandri.
- Generación de NC por resultado retenido.
- Retrabajo y reinspección.
- Programación y confirmación de entregas.
- Cierre automático de OC cuando la cantidad entregada cubre la cantidad vigente.
- Buscador global.
- Reinicio de demo.

## Persistencia
La demostración usa `localStorage`. Esto es intencional para validar lógica y estructura antes de Supabase/PostgreSQL.

## Backend preliminar
`backend/schema_postgres.sql` contiene el esquema propuesto para la siguiente fase.
