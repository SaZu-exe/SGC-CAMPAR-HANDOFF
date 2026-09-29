# Datos y backend — notas para la siguiente fase

## Estado actual
`app/index.html` v0.9 implementa el flujo de forma local con `localStorage`. No es todavía un sistema multiusuario ni una fuente oficial de registro.

## Backend propuesto
PostgreSQL/Supabase como primera implementación multiusuario.

El esquema preliminar está en:
`app/backend/schema_postgres.sql`

## Entidades mínimas
- users
- products
- purchase_orders
- purchase_order_lines
- sawmills
- allocations
- production_movements
- lots
- inspections
- nonconformities
- deliveries
- documents
- audit_history

## Recomendaciones antes de implementar producción
1. Agregar autenticación real y roles/permisos.
2. Aplicar RLS/políticas en Supabase si se adopta Supabase.
3. No guardar documentos sensibles en rutas públicas.
4. Separar documentos operativos/evidencias de archivos estáticos del frontend.
5. Mantener auditoría append-only para cambios críticos de OC, inspección, liberación y entrega.
6. Evitar depender de nombres como claves; usar IDs y conservar códigos visibles únicos.
7. Modelar `purchase_order_lines` como partidas independientes.
8. Modelar ampliaciones/reaperturas en historial/auditoría y, si se requiere precisión contable, con movimientos de cantidad en lugar de reescritura destructiva.
9. Definir formalmente los estados permitidos mediante constraints/enums cuando el flujo quede congelado.
10. Considerar almacenamiento privado para fotos, planos, constancias HT y recepciones.

## Despliegue futuro
Mientras se valida la app: GitHub Pages es suficiente para frontend estático.
Para producción se ha considerado AWS Amplify/CloudFront o S3 + CloudFront. La decisión final debe tomarse cuando frontend, autenticación, backend y permisos estén estables.
