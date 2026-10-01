# MATRIZ DE ROLES Y PERMISOS — CAMPAR SGC Digital

**Documento:** ARQ-SEC-01  
**Versión:** 1.0  
**Estado:** BORRADOR CONTROLADO PARA VALIDACIÓN  
**Fecha:** 2026-10-01  
**Base funcional:** implementación actual de AI Studio/GitHub  
**Objetivo:** definir permisos sin modificar el lenguaje visual actual de la aplicación.

> Esta matriz parte de los perfiles que ya existen en la interfaz de AI Studio. No cambia todavía la UI ni activa restricciones en producción. Sirve como contrato de seguridad para implementar después las validaciones de frontend y, principalmente, las políticas de backend/Supabase.

---

## 1. Principio general

La interfaz actual se conserva. El control de acceso debe implementarse por **acciones**, no ocultando completamente la información necesaria para operar.

Niveles usados:

- **V** = Ver / consultar.
- **O** = Operar / crear / actualizar dentro del proceso.
- **A** = Autorizar una acción crítica.
- **ADM** = Administración del sistema.
- **—** = Sin permiso de ejecución.

La visibilidad puede seguir siendo amplia; la restricción principal debe aplicarse al intentar ejecutar una acción.

---

## 2. Perfiles actuales de AI Studio

| ID técnico | Perfil visible actual | Rol funcional base |
|---|---|---|
| `sandra` | Sandra | Dirección General |
| `ian` | Ian | Administración & Compras |
| `emanuelle` | Emanuelle | Control de Producción |
| `cris` | Cris | Logística & Embarques |
| `aless` | Aless | Calidad & SGC |
| `esme` | Esme | Supervisión de Calidad & Lotes |

### Pendiente de alta

El flujo de liberación actual menciona a **Gustavo** como autoridad formal junto con Alessandri/Aless. Para que la autorización sea real, Gustavo debe existir como identidad autenticable antes de activar permisos de backend.

---

## 3. Permisos por dominio

| Acción | Sandra | Ian | Emanuelle | Cris | Aless | Esme |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Consultar Inicio/KPIs | V | V | V | V | V | V |
| Consultar OCs | V | V | V | V | V | V |
| Crear OC | O | O | — | — | — | O |
| Editar datos vigentes de OC | O | O | — | — | — | O |
| Ampliar OC | A/O | O | — | — | — | O |
| Reabrir OC | A/O | O | — | — | — | O |
| Archivar / restaurar OC | A/O | O | — | — | — | O |
| Eliminar lógicamente OC | A | O | — | — | — | — |
| Asignar OC a Cosme/Duma | O | O | O | — | V | O |
| Consultar Producción/KanBan | V | V | V | V | V | V |
| Mover piezas entre etapas | V | O | O | — | O | O |
| Ajustar avance de producción | V | O | O | — | O | O |
| Consultar Inventario/ATP | V | V | V | V | V | V |
| Alta de producto al catálogo | O | O | — | — | — | O |
| Editar producto personalizado | O | O | — | — | — | O |
| Activar / inactivar producto | A/O | O | — | — | — | O |
| Registrar stock manual | A/O | O | O | — | V | O |
| Asignar stock existente a OC | O | O | O | — | V | O |
| Consultar inspecciones | V | V | V | V | V | V |
| Crear inspección | V | O | — | — | O | O |
| Editar inspección | V | — | — | — | O | O |
| Solicitar retrabajo | V | — | O | — | O | O |
| Habilitar reinspección | V | — | — | — | O | O |
| Cerrar NC/incidente | V | — | — | — | A/O | O |
| **Liberar lote** | V | — | — | — | **A** | — |
| Consultar Entregas/Calendario | V | V | V | V | V | V |
| Programar entrega | V | O | — | O | V | O |
| Confirmar recepción/entrega | V | V | — | O | V | O |
| Usar simulador de carga | V | O | O | O | V | O |
| Exportar PDFs/reportes | V | V | V | V | V | V |
| Administrar usuarios/permisos | ADM | — | — | — | — | — |
| Reiniciar datos/demo | ADM | — | — | — | — | — |

> **Nota de diseño:** los permisos marcados para Sandra como V en operaciones técnicas buscan evitar que Dirección sea la ejecutora rutinaria de movimientos de producción o calidad. Puede supervisar y autorizar acciones administrativas críticas sin convertirse automáticamente en autoridad de liberación de producto.

---

## 4. Permiso crítico: liberación de lote

La liberación debe separarse de la inspección.

### Regla

```text
Inspección conforme
      ↓
Pendiente de liberación
      ↓
Autoridad autorizada
      ↓
LIBERADO
```

En backend no bastará con elegir un nombre en un selector.

La identidad autenticada deberá cumplir:

```text
permission = quality.release
```

Autoridades previstas:

- Aless / Alessandri.
- Gustavo, una vez creado como usuario real.

Sandra, Ian, Cris, Emanuelle y Esme podrán consultar la liberación, pero no emitirla salvo decisión posterior expresa.

---

## 5. Permisos atómicos propuestos

Estos códigos servirán para frontend y RLS/backend.

### Órdenes
- `orders.read`
- `orders.create`
- `orders.update`
- `orders.expand`
- `orders.reopen`
- `orders.archive`
- `orders.soft_delete`
- `orders.assign`

### Producción
- `production.read`
- `production.move`
- `production.adjust`

### Catálogo / Inventario
- `inventory.read`
- `inventory.manual_stock`
- `inventory.assign_stock`
- `catalog.create`
- `catalog.update`
- `catalog.set_active`

### Calidad
- `quality.read`
- `quality.inspect`
- `quality.edit_inspection`
- `quality.request_rework`
- `quality.reinspect`
- `quality.close_nc`
- `quality.release`

### Logística
- `deliveries.read`
- `deliveries.schedule`
- `deliveries.confirm`
- `loadplan.use`

### Sistema
- `reports.export`
- `users.manage`
- `system.reset`

---

## 6. Perfiles técnicos propuestos

### Dirección General
Permisos amplios de consulta y administración, con autorización administrativa, pero sin liberación técnica automática.

### Administración & Compras
Control operativo de OC, catálogo, inventario y programación administrativa.

### Control de Producción
Actualización de etapas, asignaciones operativas y stock de producción; sin autorización de calidad.

### Logística & Embarques
Programación y confirmación de entregas, simulación/carga y consulta de lotes liberados.

### Calidad & SGC
Inspección, retrabajo, reinspección, NC y, cuando la identidad corresponda a autoridad aprobada, liberación.

### Supervisión de Calidad & Lotes
Inspección y seguimiento de lotes/NC; sin liberación formal por defecto.

---

## 7. Reglas que el backend debe imponer

1. Un usuario sin `orders.create` no puede crear una OC aunque invoque manualmente la API.
2. Un usuario sin `production.move` no puede alterar cantidades de etapas.
3. Un usuario sin `catalog.create` no puede dar de alta productos.
4. Un usuario sin `inventory.manual_stock` no puede crear stock manual.
5. Un usuario sin `quality.inspect` no puede registrar una inspección.
6. Un usuario sin `quality.release` no puede liberar un lote.
7. Una liberación debe registrar el usuario autenticado; no debe aceptar un nombre arbitrario enviado por el cliente.
8. Un lote retenido o con NC abierta no puede programarse para entrega.
9. Un usuario sin `deliveries.confirm` no puede confirmar recepción en planta.
10. Las acciones críticas generan evento de auditoría con usuario, fecha, entidad, acción y cambio.

---

## 8. Aplicación visual

El lenguaje visual construido en AI Studio **no se modifica**.

Cuando un usuario no tenga permiso, se recomienda:

- mantener visible la información que necesita consultar;
- ocultar o deshabilitar únicamente la acción que no puede ejecutar;
- conservar estilos, botones, modales, tipografía y estructura actuales;
- cuando sea útil, mostrar un mensaje breve de permiso insuficiente usando los componentes visuales ya existentes.

No se creará una interfaz visual distinta por rol salvo necesidad operativa posterior.

---

## 9. Implementación por fases

### Fase A — Prototipo actual
Agregar una capa `PERMISSIONS` y validaciones `can(permission)` en frontend sin rediseñar la UI.

### Fase B — Autenticación real
Migrar perfiles a Supabase Auth.

### Fase C — Backend
Repetir las validaciones en PostgreSQL/RLS/RPC. El frontend nunca será la única barrera.

### Fase D — Auditoría
Registrar las acciones críticas en `audit_events`.

---

## 10. Puntos pendientes de confirmación

1. Confirmar si `Aless` en la interfaz corresponde a Alessandri.
2. Dar de alta a Gustavo como usuario autenticable para `quality.release`.
3. Confirmar si Emanuelle permanecerá como responsable de Control de Producción.
4. Confirmar si Esme conservará el rol visual actual de Supervisión de Calidad & Lotes.
5. Determinar si Miguel requiere cuenta propia o permanece fuera del sistema como operador de transporte.
6. Validar si Ian conserva las atribuciones administrativas propuestas o requiere también permisos de inspección más amplios.

Hasta cerrar estos puntos, esta matriz se considera **BORRADOR CONTROLADO** y no debe utilizarse todavía para bloquear funciones irreversiblemente.
