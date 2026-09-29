# CAMPAR SGC — AI Studio Handoff v0.9

Este paquete transfiere el estado actual del proyecto CAMPAR SGC a otro entorno de desarrollo/IA.

## Orden de lectura recomendado
1. `AI_STUDIO_START_PROMPT.md`
2. `PROJECT_CONTEXT.md`
3. `FUNCTIONAL_REQUIREMENTS.md`
4. `DESIGN_DECISIONS.md`
5. `DATA_AND_BACKEND_NOTES.md`
6. `VERSION_HISTORY.md`
7. `app/README.md` y `app/DATA_MODEL.md`
8. Documentación controlada en `docs/master/`

## Fuente funcional actual
La referencia ejecutable actual es `app/index.html`, correspondiente a **CAMPAR SGC Digital v0.9**.

La app v0.9 sigue siendo un prototipo funcional con persistencia en `localStorage`. El archivo `app/backend/schema_postgres.sql` es un esquema preliminar para la futura fase multiusuario con PostgreSQL/Supabase.

## Regla de continuidad
No eliminar ni reinterpretar funcionalidades existentes sin validar primero contra `FUNCTIONAL_REQUIREMENTS.md` y `DESIGN_DECISIONS.md`.

## Contenido
- `app/`: aplicación v0.9, assets, PDFs integrados y esquema SQL preliminar.
- `docs/master/`: documentación maestra del SGC disponible en DOCX/PDF.
- `docs/registers/`: matrices y registros del proyecto.
- `references/`: logo, planos de referencia y referencia visual aprobada del inventario.
- `legacy/`: archivos anteriores conservados sólo como antecedente.

## Importante sobre normas
El proyecto distingue siempre entre requisito normativo, requisito contractual del cliente, criterio interno CAMPAR y recomendación técnica. Antes de declarar conformidad formal o una edición normativa vigente, verificar la fuente controlada correspondiente.
