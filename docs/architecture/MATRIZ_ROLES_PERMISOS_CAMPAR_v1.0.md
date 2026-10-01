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
| `ian` | Ian | IT & Soporte Multifuncional |
| `emanuelle` | Emanuelle | Supervisión Operativa & Calidad |
| `cris` | Cris | Inspecciones & Entregas |
| `aless` | Aless | Supervisión Operativa & Calidad |
| `esme` | Esme | Coordinación Operativa Multifuncional |

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
| Eliminar lógicamente OC | A | O | — | — | — | O |
| Asignar OC a Cosme/Duma | O | O | O | — | O | O |
| Vincular OC de recepción/reclasificación | O | O | — | O | — | O |
| Consultar Producción/KanBan | V | V | V | V | V | V |
| Mover piezas entre etapas | — | O | O | — | O | O |
| Ajustar avance de producción | — | O | O | — | O | O |
| Consultar Inventario/ATP | V | V | V | V | V | V |
| Alta de producto al catálogo | O | O | — | — | — | O |
| Editar producto personalizado | O | O | — | — | — | O |
| Activar / inactivar producto | A/O | O | — | — | — | O |
| Registrar stock manual | O* | O* | O | — | O | O* |
| Asignar stock existente a OC | O | O | O | — | O | O |
| Consultar inspecciones | V | V | V | V | V | V |
| Crear inspección | — | O | O | O | O | O |
| Editar inspección | — | O | O | O | O | O |
| Solicitar retrabajo | — | O | O | O | O | O |
| Habilitar reinspección | — | O | O | O | O | O |
| Cerrar NC/incidente | — | O | O | — | O | O |
| **Liberar lote** | — | — | **A** | — | **A** | — |
| Vincular OC de recepción a OC original | — | O | — | — | — | O |
| Consultar Entregas/Calendario | V | V | V | V | V | V |
| Programar entrega | — | O | — | O | — | O |
| Confirmar recepción/entrega | — | O | — | O | — | O |
| Usar simulador de carga | V | O | O | O | O | O |
| Exportar PDFs/reportes | V | V | V | V | V | V |
| Administrar usuarios/permisos | ADM | O/ADM | — | — | — | — |
| Reiniciar datos/demo | ADM | O/ADM | — | — | — | — |

**Regla adicional:** sólo Emanuelle y Aless pueden registrar stock manual directamente con estado **Liberado**. Los demás perfiles autorizados a actualizar stock deben usar un estado no liberado cuando corresponda.

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

- Emanuelle (Gustavo).
- Aless (Alessandri).

Sandra, Ian, Cris y Esme podrán consultar la liberación, pero no emitirla salvo decisión posterior expresa. La autoridad formal permanece en Emanuelle y Aless.

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
- `orders.link_receipt`

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
Sandra conserva supervisión global, administración y acciones administrativas sobre OCs, catálogo e inventario, sin convertirse en autoridad técnica de liberación.

### IT & Soporte Multifuncional
Ian tiene acceso técnico/administrativo total al sistema para soporte, configuración y asistencia operativa. La única excepción deliberada es la liberación formal de calidad, reservada a Emanuelle y Aless.

### Supervisión Operativa & Calidad
Rol compartido por Emanuelle (Gustavo) y Aless (Alessandri). Incluye asignaciones, producción, actualización de stock, inspección, retrabajo, reinspección, cierre de NC y liberación formal de lote.

### Coordinación Operativa Multifuncional
Esme participa de forma transversal en OCs, producción, inventario, catálogo, inspecciones, NC y logística. Puede archivar, restaurar y eliminar lógicamente OCs para mantener el control operativo, pero no tiene permiso de liberación formal ni administración de usuarios.

### Inspecciones & Entregas
Cris queda limitado a inspecciones, evidencia/retrabajo/reinspección y logística de entregas. No modifica OCs, producción, inventario ni libera lotes.

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

## 10. Decisiones de identidad y jerarquía cerradas

1. **Aless = Alessandri** y comparte rol con Emanuelle.
2. **Emanuelle = Gustavo** y conserva el nombre visible “Emanuelle” en la app.
3. **Emanuelle y Aless** comparten el rol **Supervisión Operativa & Calidad**.
4. **Esme** queda como **Coordinación Operativa Multifuncional**.
5. **Cris** queda como **Inspecciones & Entregas**.
6. **Miguel** permanece fuera del sistema como chofer, sin usuario.
7. **Ian** queda como **IT & Soporte Multifuncional**, con acceso total técnico/administrativo salvo la liberación formal de calidad.

---

## 11. Aclaración de permisos de inventario

**Emanuelle y Aless comparten también la autorización para actualizar stock.**

Esto incluye:

- registrar ajustes/ingresos de stock operativo;
- actualizar cantidades disponibles por aserradero;
- asignar stock existente a una OC;
- mantener trazabilidad del motivo, usuario y fecha del ajuste.

La actualización de stock no elimina la necesidad de respetar el estado de calidad del lote: un ajuste de inventario no debe convertir por sí mismo producto pendiente, retenido o en retrabajo en producto liberado.


---

## 12. Estado de implementación

La capa de permisos ya fue incorporada en el frontend actual mediante:

- `roleKey` por usuario;
- `ROLE_PERMISSIONS`;
- `can(permission)`;
- `requirePermission(permission)`;
- validaciones sobre las principales acciones mutables.

La liberación ya no permite seleccionar manualmente la autoridad: se deriva del perfil activo. Sólo Emanuelle y Aless pueden ejecutar `quality.release`.

**Importante:** esta capa mejora el prototipo, pero todavía no constituye seguridad real. Los mismos permisos deberán implementarse nuevamente en Supabase Auth/RLS/RPC para que no puedan eludirse desde el navegador.


---

## 13. Registro de OC de recepción vinculada

La reclasificación de una OC solicitada por planta se registra **exclusivamente desde el expediente de Órdenes de Compra**, no desde Entregas.

Flujo operativo:

- Cris reporta desde planta el cambio de OC.
- Ian o Esme reciben la información y realizan el registro administrativo en el sistema.
- La remisión/entrega se usa como evidencia relacionada, pero el módulo de Entregas no modifica el vínculo comercial.
- El sistema conserva la OC original como origen de producción y vincula la nueva OC como OC de recepción.
- La función `orders.link_receipt` está autorizada únicamente para Ian y Esme.

Esto evita que el personal de entrega modifique directamente la estructura comercial de una OC mientras mantiene la trazabilidad de lo reportado en planta.
