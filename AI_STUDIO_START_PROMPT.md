# Prompt inicial para Google AI Studio

Estás trabajando sobre el proyecto **CAMPAR SGC Digital**.

Antes de modificar código, lee completamente:
- `PROJECT_CONTEXT.md`
- `FUNCTIONAL_REQUIREMENTS.md`
- `DESIGN_DECISIONS.md`
- `DATA_AND_BACKEND_NOTES.md`
- `VERSION_HISTORY.md`
- `app/README.md`
- `app/DATA_MODEL.md`

Después revisa `app/index.html`, que es la referencia funcional actual v0.9.

## Instrucciones obligatorias de continuidad
- Conserva el versionado numérico: v0.x hasta llegar a v1.0. No usar “alpha”, “beta” o similares.
- No elimines funcionalidad existente sólo para simplificar la interfaz.
- Mantén los 7 módulos principales de navegación mientras no se apruebe otra arquitectura.
- Mantén separados **etapa de producción** y **estado de calidad**.
- Las etapas productivas oficiales de la app son únicamente: `En corte`, `En armado`, `En estufado`, `Limpios`.
- `Limpios` significa listo para que CAMPAR inspeccione; NO significa liberado/conforme.
- Cosme = `MX-1361`; Duma = `MX-1071`.
- El lote es la unidad central de trazabilidad.
- La autoridad de liberación actual corresponde a Gustavo y Alessandri. Ian y Cris pueden apoyar inspección, pero no deben adquirir autoridad de liberación por defecto.
- Las OC deben poder crearse, abrirse, ampliarse y reabrirse conservando historial y trazabilidad.
- Las inspecciones existentes deben poder abrirse y revisarse. Los lotes Limpios deben permitir iniciar una inspección nueva.
- En inventario, prioriza visualmente Cosme, Duma y el concentrado total por producto. La tarjeta del producto seleccionado debe ser compacta.
- Mantén una apariencia sobria, formal, ejecutiva y homogénea en toda la interfaz.
- No inventes requisitos normativos, tolerancias, Ac/Re, planos, revisiones, lotes o evidencias.
- Diferencia explícitamente: requisito normativo / requisito cliente / criterio interno CAMPAR / recomendación técnica / pendiente de validación.

## Objetivo inmediato
Validar completamente el flujo funcional v0.9 y preparar la transición a backend multiusuario PostgreSQL/Supabase sin rediseñar innecesariamente la operación.
