# AUDITORÍA DE ARQUITECTURA — CAMPAR SGC Digital

**Documento:** AUD-ARQ-01  
**Versión:** 1.0  
**Estado:** EN REVISIÓN TÉCNICA  
**Fecha de corte:** 2026-10-01  
**Repositorio auditado:** `SaZu-exe/SGC-CAMPAR-HANDOFF`  
**Commit de referencia:** `dd281c63f646759a69bcd301a66be57d476265a9`  
**Alcance:** arquitectura de software, integridad de datos, autenticación/autorización, trazabilidad, persistencia, mantenibilidad, consistencia con la documentación del proyecto y preparación para backend PostgreSQL/Supabase.

> Esta auditoría no modifica la lógica operativa. Su objetivo es congelar el estado técnico actual, identificar riesgos y definir la ruta de estabilización antes de migrar a un backend multiusuario real.

---

## 1. Conclusión ejecutiva

La aplicación ha evolucionado de un prototipo local v0.9 a un **prototipo avanzado con servidor Express, persistencia centralizada temporal, sincronización periódica, perfiles de usuario, KanBan de producción, ATP, inventario, inspecciones, retrabajos, entregas, calendario, PDFs y simulador de carga**.

La arquitectura actual es adecuada para **demostración y validación funcional**, pero **no debe tratarse todavía como arquitectura de producción**. Los principales bloqueos son:

1. datos y documentos potencialmente expuestos;
2. autenticación y autorización únicamente simuladas en frontend;
3. persistencia por reemplazo completo de estado, sin transacciones ni control real de concurrencia;
4. rutas que permiten liberar o disponer producto sin hacer cumplir las reglas de calidad en backend;
5. coexistencia de dos modelos de etapas productivas;
6. trazabilidad/auditoría almacenada dentro de un estado mutable;
7. divergencia entre documentación, versión visual y comportamiento real;
8. modelo PostgreSQL preliminar ya superado por el frontend.

**Decisión técnica recomendada:** conservar las funciones operativas valiosas del prototipo, congelar primero las reglas de dominio y después sustituir la persistencia temporal por PostgreSQL/Supabase con Auth, RLS, Storage y operaciones transaccionales. No se recomienda seguir ampliando significativamente el archivo monolítico antes de esa estabilización.

---

## 2. Arquitectura actual observada

```text
Navegador
│
├── index.html
│   ├── HTML
│   ├── CSS embebido
│   └── JavaScript embebido
│       ├── Órdenes
│       ├── Producción / KanBan
│       ├── Inventario / ATP
│       ├── Inspecciones / retrabajo
│       ├── Entregas / calendario
│       ├── Simulador de trailer
│       ├── PDFs
│       └── Perfiles / PIN
│
├── localStorage
│
└── HTTP
    ├── GET  /api/state
    ├── POST /api/state
    └── POST /api/reset
           │
           ▼
      Node.js + Express
           │
           ▼
      data/state.json
```

### 2.1 Dimensión aproximada del frontend

- `index.html`: ~9,000 líneas.
- ~228 funciones JavaScript detectadas.
- 37 productos base: 23 CAMPAR + 14 Nestlé.
- 6 secciones principales visibles: Inicio, Órdenes, Producción, Inventario, Inspecciones y Entregas.
- `package.json`: versión 0.9.0.
- Interfaz: contiene referencias visuales a v1.0.

### 2.2 Estado persistido actualmente

El estado operativo central se maneja principalmente mediante:

- `orders`
- `allocations`
- `lots`
- `inspections`
- `deliveries`
- `customProducts`
- historiales embebidos por entidad

El servidor mantiene el estado completo en `data/state.json` y cada guardado reemplaza el documento completo.

---

## 3. Fortalezas que conviene conservar

### F-01. Modelo operativo reconocible
El código ya representa una cadena útil de OC → partida → asignación → producción → lote → inspección → entrega.

### F-02. Partidas de OC
El frontend ya diferencia líneas/partidas y dispone de funciones por `lineId`, lo cual es indispensable para entregas parciales y OCs multiproducto.

### F-03. Separación Cosme / Duma
Se conservan los dos aserraderos y sus códigos `MX-1361` y `MX-1071`.

### F-04. Trazabilidad visible
OC, asignaciones, lotes, inspecciones y entregas incorporan historiales y enlaces entre registros.

### F-05. Archivado y eliminación lógica
La app ya evita borrar directamente ciertas órdenes y conserva motivos, usuario y fecha.

### F-06. KanBan e inventario operativo
La vista de producción, movimientos parciales, ATP y auditoría de lotes son conceptos valiosos y pueden mantenerse sobre el backend definitivo.

### F-07. Inspección rica
La aplicación ya contempla muestra, humedad, piezas fuera de medida, hallazgos, criticidad, fotografías, retrabajo, reinspección y liberación.

### F-08. Entregas y calendario
Existe programación, confirmación de recepción, calendario de compromisos y expedientes de entrega.

### F-09. Simulador de trailer
La geometría base de la plana y sus dos hileras está integrada y puede conservarse como herramienta logística.

### F-10. Auditoría técnica auxiliar
Existe `scripts/audit_relations.cjs`, que valida referencias entre varias entidades. Debe evolucionar hacia pruebas automatizadas, pero es una buena base.

---

## 4. Hallazgos críticos

### ARQ-01 — Repositorio público con información interna
**Severidad:** CRÍTICA antes de usar datos reales.

El repositorio está configurado como `public` y contiene documentación del SGC, lógica operativa, estructura de usuarios, archivos de estado y documentos internos.

**Riesgo:** exposición involuntaria de información operativa y documental.

**Acción requerida:** cambiar el repositorio a privado antes de utilizar datos reales.

---

### ARQ-02 — El servidor publica prácticamente todo el repositorio
**Severidad:** CRÍTICA.

`server.js` contiene:

```js
app.use(express.static(__dirname));
```

Esto convierte la raíz completa del proyecto en contenido estático potencialmente accesible. Además, existen rutas específicas para `/assets` y `/docs`.

**Impacto:** archivos como `data/state.json`, SQL, documentación u otros recursos pueden quedar expuestos por HTTP. Incluso si en el futuro se protege `/api/state`, una ruta estática al archivo podría evitar la protección.

**Corrección:** servir únicamente un directorio público explícito. Ejemplo futuro:

```text
/public
  index.html
  assets/
```

Documentos privados y estado nunca deben estar dentro del árbol estático.

---

### ARQ-03 — API de estado sin autenticación ni autorización
**Severidad:** CRÍTICA.

Actualmente:

```text
GET  /api/state
POST /api/state
POST /api/reset
```

no verifican identidad, rol ni permiso.

**Impacto:** cualquier cliente con acceso al servidor podría leer, sustituir o reiniciar el estado.

**Corrección:** eliminar este esquema al migrar a Supabase y usar autenticación + RLS. Mientras exista el servidor temporal, como mínimo debe existir autenticación real en backend.

---

### ARQ-04 — El sistema de PIN no es autenticación real
**Severidad:** CRÍTICA para producción.

Los perfiles y PIN se encuentran embebidos en `index.html`. La interfaz incluso muestra el PIN asignado y existe `quickLogin()`, que inicia sesión directamente sin validar el PIN.

**Impacto:** la identidad mostrada por la interfaz no demuestra quién realizó una acción.

**Acción:** conservar el selector visual de perfil sólo como diseño; reemplazar la autenticación por Supabase Auth o proveedor equivalente.

---

### ARQ-05 — La autoridad de liberación no está realmente protegida
**Severidad:** CRÍTICA.

La interfaz muestra que Gustavo o Alessandri deben autorizar la liberación, pero `saveRelease()` acepta el nombre elegido en un selector. No valida al usuario autenticado.

Además, existen rutas como ingreso manual/asignación de stock capaces de crear lotes con:

```text
quality = "Liberado"
```

sin exigir una inspección y un evento de liberación autorizado.

**Impacto:** un lote podría quedar disponible para entrega sin satisfacer el flujo de control de calidad.

**Regla futura obligatoria:** un lote sólo puede pasar a LIBERADO mediante una operación de backend autorizada y auditada.

---

### ARQ-06 — Persistencia por reemplazo de estado completo
**Severidad:** CRÍTICA en multiusuario.

Cada modificación hace un `POST /api/state` con el objeto global completo. El servidor incrementa una versión, pero no exige que el cliente esté modificando la última versión.

Escenario posible:

```text
Usuario A lee versión 20
Usuario B lee versión 20

A guarda -> versión 21
B guarda su copia anterior -> versión 22

El cambio de A puede desaparecer.
```

**Impacto:** pérdida silenciosa de datos por concurrencia.

**Corrección:** operaciones por entidad y transacciones SQL; no guardar snapshots completos desde el navegador.

---

## 5. Hallazgos de integridad y lógica de dominio

### ARQ-07 — Existen dos modelos de etapas productivas
**Severidad:** ALTA.

Documentación histórica/controlada del proyecto:

```text
En corte → En armado → En estufado → Limpios
```

Código actual:

```text
corte
armado
por_estufa
estufando
por_limpiar
stock_entrega
```

Además permanecen funciones antiguas que todavía buscan una etapa `limpios`.

**Impacto:** creación incorrecta de lotes, movimientos incompatibles y cálculos inconsistentes.

**Decisión necesaria antes de BD:** elegir un catálogo canónico de etapas. Si se desean las seis etapas actuales, eliminar por completo las rutas heredadas de cuatro etapas y actualizar la documentación. Si se desean cuatro, mapear/reducir las seis.

---

### ARQ-08 — Edición de OC puede romper el balance de producción
**Severidad:** ALTA.

`saveEditOrder()` puede cambiar directamente `allocation.qty`, pero no redistribuye automáticamente las cantidades ya existentes en las etapas.

Ejemplo:

```text
Asignación previa: 200
Etapas acumuladas: 200

Usuario cambia asignación a 120
allocation.qty = 120
Etapas pueden seguir sumando 200
```

Asimismo, al eliminar una partida desde la edición, las asignaciones previamente relacionadas no se eliminan ni se invalidan automáticamente.

**Corrección:** las cantidades comprometidas no deben reescribirse destructivamente cuando ya existe movimiento. Usar eventos de ajuste/transacciones con validación de saldo.

---

### ARQ-09 — `saveExpand()` conserva estructura antigua
**Severidad:** ALTA.

Una ruta de ampliación todavía puede crear etapas con:

```text
corte / armado / estufado / limpios
```

mientras el sistema principal trabaja con seis etapas.

**Corrección:** eliminar lógica heredada al congelar el catálogo de etapas.

---

### ARQ-10 — El historial no es una auditoría inmutable
**Severidad:** ALTA.

Los historiales están dentro del mismo objeto que el navegador puede sobrescribir y el servidor acepta.

**Impacto:** técnicamente el cliente puede modificar o eliminar su propio historial.

**Corrección:** tabla `audit_events` append-only generada por backend/BD, sin permisos de UPDATE/DELETE para usuarios ordinarios.

---

### ARQ-11 — No conformidad no es todavía entidad de primera clase
**Severidad:** ALTA.

En el frontend, la NC se representa principalmente mediante campos como:

- `ncStatus`
- `severity`
- `reworkDetails`

dentro de una inspección. Sin embargo, el esquema SQL preliminar sí propone `nonconformities`.

**Impacto:** dificultad para registrar múltiples NC por inspección, causa, acción correctiva, responsable, evidencia, eficacia y cierre independiente.

**Corrección:** formalizar NC como entidad separada vinculada a lote e inspección.

---

### ARQ-12 — Entrega y carga no soportan adecuadamente un viaje multi-lote
**Severidad:** ALTA.

La entrega actual está fuertemente ligada a un solo `lotId`. El simulador puede contener diferentes productos/estibas, pero al crear una entrega busca el primer código/dominante y un lote coincidente.

**Impacto:** una carga real con varios productos/lotes no queda representada fielmente por una sola remisión.

**Modelo futuro:**

```text
shipment
├── shipment_items
└── shipment_lot_allocations
```

Un viaje puede contener múltiples productos y múltiples lotes.

---

### ARQ-13 — ATP todavía puede atribuir entrega a la partida incorrecta
**Severidad:** ALTA.

Existe una función `qtyDeliveredLine()` con lógica más precisa por partida. Sin embargo, parte de `getProductAtpData()` calcula entregas a partir del total entregado de la OC y lo distribuye mientras recorre líneas.

**Impacto:** una OC multiproducto puede mostrar compromisos ATP incorrectos.

**Corrección:** ATP definitivo debe calcularse por `purchase_order_line_id`, producto y lote.

---

### ARQ-14 — IDs derivados de longitud de arrays
**Severidad:** MEDIA.

Ejemplos:

- `INS-... length + 1`
- `ENT-... length + 1`
- lotes por conteo de lotes existentes en la OC

Pueden existir colisiones al borrar/restaurar/importar datos.

**Corrección:** UUID interno + folio visible generado por secuencia en BD.

---

## 6. Seguridad y datos

### ARQ-15 — Fotografías embebidas dentro del estado
**Severidad:** ALTA.

Las inspecciones almacenan `evidenceData` y todo el estado se serializa. `data/state.json` ya tiene un tamaño aproximado de 1.85 MB.

**Impacto:**

- crecimiento rápido del payload;
- sincronizaciones cada vez más pesadas;
- riesgo de superar el límite de 30 MB del servidor;
- Git puede terminar almacenando evidencia operativa;
- una foto cambia obliga a reenviar el estado completo.

**Corrección:** Supabase Storage privado; PostgreSQL guarda únicamente metadatos y ruta.

---

### ARQ-16 — No existe validación de esquema en backend
**Severidad:** ALTA.

`POST /api/state` sólo comprueba que el payload sea un objeto.

**Impacto:** datos incompletos, tipos incorrectos o estados imposibles pueden persistirse.

**Corrección:** constraints SQL + validación de input + operaciones específicas.

---

### ARQ-17 — `state.json` está versionado en Git
**Severidad:** ALTA antes del piloto real.

Una base de datos operativa no debe almacenarse como archivo versionado dentro del repositorio.

**Corrección:** retirar `data/state.json` del control de versiones y conservar únicamente un `state.demo.json` sin información real si se necesita demo.

---

### ARQ-18 — Falta un `.gitignore` real
**Severidad:** ALTA.

Existe un archivo llamado `download` cuyo contenido parece corresponder a reglas típicas de `.gitignore`:

```text
.DS_Store
Thumbs.db
.env
.env.*
node_modules/
dist/
```

pero no existe un `.gitignore` con ese nombre en la raíz.

**Impacto:** archivos `.env`, dependencias o builds podrían terminar versionados por error.

**Corrección inmediata:** crear `.gitignore` real.

---

### ARQ-19 — Escritura del JSON no atómica
**Severidad:** MEDIA.

El servidor usa `writeFileSync` directamente sobre el archivo final.

**Riesgo:** una interrupción durante escritura puede dejar el estado corrupto. Tampoco existen copias de seguridad ni journal.

**Corrección:** PostgreSQL elimina este problema. Si se mantiene temporalmente, usar archivo temporal + rename + backups.

---

## 7. Consistencia con el SGC y documentación

### ARQ-20 — Documentación de handoff desactualizada
**Severidad:** MEDIA/ALTA.

Los archivos `README_FIRST.md`, `MANIFEST.md` y otros todavía hablan de rutas como:

```text
app/index.html
app/backend/schema_postgres.sql
docs/master/
references/
```

mientras el repositorio actual está principalmente aplanado en raíz y usa otra evolución funcional.

**Corrección:** actualizar documentación después de congelar arquitectura.

---

### ARQ-21 — 7 módulos documentados vs 6 módulos implementados
**Severidad:** MEDIA.

La documentación exige:

1. Inicio
2. Órdenes
3. Producción
4. Inventario
5. Inspecciones
6. Entregas
7. No conformidades

El frontend actual tiene seis; NC está integrada dentro de Inspecciones.

**Esto no es necesariamente incorrecto**, pero debe convertirse en una decisión explícita del proyecto.

---

### ARQ-22 — Inconsistencia de versiones
**Severidad:** MEDIA.

Se observan simultáneamente:

- `package.json`: 0.9.0
- título/metadata: v0.9
- menú/interfaz: v1.0
- documentación: v0.9 como referencia

**Corrección:** no declarar v1.0 hasta cerrar backend, seguridad, integridad, migración y piloto.

---

### ARQ-23 — Usuarios/roles del frontend requieren validación
**Severidad:** ALTA por trazabilidad.

La lista actual incluye perfiles como Aless, Emanuelle, Ian, Cris, Sandra y Esme. No coincide completamente con la matriz de roles previamente validada del proyecto, donde Gustavo y Alessandri son autoridades formales de liberación.

**Acción:** no asumir que la lista actual es definitiva. Crear catálogo real de usuarios y una matriz de permisos antes de Auth/RLS.

---

### ARQ-24 — Afirmaciones “oficiales” o normativas están codificadas sin relación de evidencia
**Severidad:** ALTA por control documental.

Se detectan textos como:

- “Plano Oficial de Estiba”
- “altura máx. reglamentaria”
- referencia a normativa SCT;
- “certificado fitosanitario correspondiente” en entrega;
- estimación de peso mediante 23 kg por tarima.

El software no demuestra en esos puntos qué documento controlado respalda esas afirmaciones ni qué certificado está asociado al viaje/lote.

**Corrección:** el software debe mostrar requisitos/evidencia vinculados, no afirmar cumplimiento por defecto. Eliminar o etiquetar como referencia interna cualquier cálculo no validado.

---

## 8. Mantenibilidad

### ARQ-25 — Frontend monolítico
**Severidad:** MEDIA/ALTA.

`index.html` concentra HTML, CSS y aproximadamente 228 funciones en ~9,000 líneas.

**Impacto:**

- mayor riesgo de regresiones;
- mezcla de lógica vieja y nueva;
- difícil revisión de cambios entre ChatGPT y AI Studio;
- pruebas aisladas complicadas.

**Recomendación:** refactor incremental, no reescritura total.

Estructura propuesta:

```text
src/
├── app.js
├── api/
│   └── client.js
├── auth/
│   └── auth.js
├── domain/
│   ├── orders.js
│   ├── production.js
│   ├── inventory.js
│   ├── quality.js
│   ├── deliveries.js
│   └── load-plans.js
├── ui/
│   ├── modal.js
│   ├── toast.js
│   └── pdf.js
└── styles/
    └── app.css
```

---

### ARQ-26 — Pruebas insuficientes
**Severidad:** MEDIA.

`audit_relations.cjs` verifica relaciones básicas, pero no sustituye pruebas sobre:

- concurrencia;
- ampliaciones;
- eliminación de partidas;
- saldo por etapa;
- liberación;
- entregas parciales;
- OCs multiproducto;
- retrabajo/reinspección;
- ATP;
- permisos.

**Acción:** convertir reglas críticas en pruebas automatizadas antes del piloto multiusuario.

---

## 9. Evaluación del esquema PostgreSQL preliminar

El archivo `schema_postgres.sql` ya no cubre todo lo que hace la aplicación actual.

### Conservar como base conceptual

- `products`
- `purchase_orders`
- `purchase_order_lines`
- `sawmills`
- `allocations`
- `lots`
- `inspections`
- `nonconformities`
- `documents`
- `audit_history`

### Debe ampliarse o rediseñarse

1. Auth de Supabase + perfiles.
2. Roles y permisos.
3. RLS.
4. estados mediante enums/check constraints.
5. UUID con valores por defecto.
6. índices en claves foráneas.
7. `updated_at` y control de revisiones.
8. movimientos productivos append-only.
9. mediciones individuales de inspección.
10. hallazgos/defectos separados.
11. evidencia en Storage.
12. acciones de NC y verificación de eficacia.
13. evento de liberación separado.
14. entregas multi-lote/multi-producto.
15. recepción en planta.
16. planes de carga y estibas.
17. stock libre y asignación posterior.
18. vistas ATP.
19. auditoría inmutable.
20. restricciones para impedir sobreasignación/sobreentrega.

---

## 10. Arquitectura objetivo recomendada

```text
Frontend CAMPAR
│
├── módulos UI
├── cliente Supabase
└── generación/consulta de reportes
        │
        ▼
Supabase
│
├── Auth
│   └── identidad real
│
├── PostgreSQL
│   ├── OCs / partidas
│   ├── asignaciones
│   ├── movimientos de producción
│   ├── lotes
│   ├── inspecciones
│   ├── NC / retrabajo
│   ├── liberaciones
│   ├── entregas
│   ├── carga
│   └── audit_events
│
├── RLS
│   └── permisos por rol
│
└── Storage privado
    ├── inspecciones/
    ├── ht/
    ├── planos/
    ├── recepciones/
    └── nc/
```

### Principio central

No almacenar “el estado actual” como un gran JSON. Registrar **hechos/movimientos** y derivar saldos.

Ejemplo:

```text
Producción:
+100 Corte
-40 Corte
+40 Armado
...
```

Así la BD puede reconstruir el historial y evitar que una edición destruya trazabilidad.

---

## 11. Modelo de datos objetivo propuesto

### Seguridad
- `profiles`
- `roles` o rol controlado en `profiles`

### Catálogos
- `products`
- `product_specifications`
- `sawmills`

### Órdenes
- `purchase_orders`
- `purchase_order_lines`
- `order_events`

### Producción
- `allocations`
- `production_movements`
- `lots`

### Calidad
- `inspections`
- `inspection_measurements`
- `inspection_findings`
- `inspection_evidence`
- `lot_releases`
- `nonconformities`
- `nc_actions`
- `reinspection_links`

### Logística
- `shipments`
- `shipment_items`
- `shipment_lot_allocations`
- `shipment_receipts`
- `load_plans`
- `load_plan_stacks`

### Documentación / auditoría
- `documents`
- `audit_events`

---

## 12. Invariantes que debe hacer cumplir el backend

1. La suma asignada de una partida no puede superar su cantidad vigente.
2. Una cantidad física no puede estar simultáneamente en dos etapas.
3. Un ajuste de cantidad no puede dejar saldos negativos.
4. Un lote retenido no puede asignarse a entrega.
5. Un lote no puede estar LIBERADO sin evento de liberación autorizado.
6. Sólo perfiles autorizados pueden liberar.
7. Un retrabajo requiere reinspección antes de nueva liberación.
8. La suma programada/entregada de un lote no puede exceder el saldo disponible.
9. La suma entregada contra una partida no puede exceder su cantidad vigente salvo cambio formal de OC.
10. Una entrega puede usar múltiples lotes, pero cada consumo debe quedar registrado.
11. Cambios críticos generan `audit_event` append-only.
12. Un documento/evidencia eliminado lógicamente conserva referencia de auditoría.

---

## 13. Plan de estabilización

### Fase 0 — Seguridad inmediata
Antes de datos reales:

- cambiar repo a privado;
- crear `.gitignore`;
- dejar de versionar `data/state.json`;
- restringir archivos estáticos;
- eliminar PIN visible y `quickLogin` como mecanismo de seguridad;
- evitar evidencias reales en JSON/Git.

### Fase 1 — Congelar reglas de dominio
Resolver explícitamente:

1. ¿4 o 6 etapas productivas?
2. ¿NC como módulo visible o integrada en Calidad?
3. usuarios y roles definitivos;
4. autoridad exacta de liberación;
5. reglas de stock manual;
6. modelo de viaje multi-lote;
7. versión oficial del software.

### Fase 2 — Esquema Supabase/PostgreSQL definitivo
Crear:

- migraciones SQL;
- constraints;
- índices;
- RLS;
- funciones/RPC transaccionales;
- datos maestros iniciales.

### Fase 3 — Auth y Storage
- usuarios reales;
- sesiones reales;
- fotos/documentos privados;
- permisos por rol.

### Fase 4 — Adaptador frontend
Reemplazar gradualmente:

```text
save()
pullServerState()
state.json
```

por operaciones específicas sobre Supabase.

### Fase 5 — Modularización
Separar el monolito por dominio sin rediseñar innecesariamente la UI.

### Fase 6 — Piloto multiusuario
Probar una OC real completa:

```text
OC
→ partida
→ asignación
→ producción
→ lote
→ inspección
→ liberación/NC
→ entrega
→ recepción
→ cierre
```

### Fase 7 — v1.0
Sólo después de:

- backend estable;
- seguridad;
- permisos;
- trazabilidad;
- pruebas;
- respaldo;
- piloto real;
- documentación sincronizada.

---

## 14. Clasificación de lo construido

### CONSERVAR
- identidad visual CAMPAR;
- expediente de OC;
- partidas;
- Cosme/Duma;
- KanBan;
- catálogo;
- inventario/ATP como concepto;
- lotes;
- inspecciones;
- retrabajo/reinspección;
- calendario;
- entregas;
- simulador de trailer;
- PDFs como capacidad;
- buscador;
- archivado/eliminación lógica.

### CORREGIR
- etapas inconsistentes;
- cálculo ATP por partida;
- edición destructiva de asignaciones;
- modelo de entrega;
- stock manual;
- autoridad de liberación;
- usuarios/roles;
- textos “oficiales/normativos” sin evidencia;
- versionado.

### FORMALIZAR EN BACKEND
- identidad;
- permisos;
- lotes;
- movimientos;
- inspecciones;
- liberaciones;
- NC;
- entregas;
- documentos;
- auditoría;
- disponibilidad.

### RETIRAR COMO MECANISMO DE PRODUCCIÓN
- PIN hardcodeado;
- `quickLogin`;
- `state.json` como BD;
- reemplazo completo de estado;
- historial editable por cliente;
- fotografías base64 dentro del estado;
- liberación por simple cambio de campo;
- rutas heredadas de etapas antiguas.

---

## 15. Decisiones requeridas antes de construir el backend

Estas decisiones deben quedar documentadas antes de generar el esquema definitivo:

| ID | Decisión | Estado |
|---|---|---|
| D-01 | Catálogo canónico de etapas productivas | Pendiente |
| D-02 | Estructura visible de No Conformidades | Pendiente |
| D-03 | Usuarios y roles reales | Pendiente |
| D-04 | Matriz de permisos y liberación | Pendiente |
| D-05 | Regla para stock existente/manual | Pendiente |
| D-06 | Modelo de viaje/remisión multi-lote | Pendiente |
| D-07 | Regla definitiva ATP | Pendiente |
| D-08 | Versión oficial previa a backend | Pendiente |

---

## 16. Resultado de la auditoría

**Estado técnico:** prototipo avanzado y funcionalmente valioso.

**Apto para:** validación de UX, flujos, demostración, definición de reglas y preparación de backend.

**No apto todavía para:** operar como registro oficial multiusuario de CAMPAR con datos reales y trazabilidad de calidad confiable.

La prioridad ya no debe ser añadir más pantallas. La prioridad es **estabilizar reglas, proteger datos y convertir la lógica validada en una arquitectura transaccional y auditable**.

---

## 17. Próximo entregable recomendado

`ARQ-DB-01_Modelo_Datos_Definitivo_CAMPAR_v1.0`

Debe incluir:

- diagrama entidad-relación;
- tablas y columnas;
- claves/relaciones;
- constraints;
- estados;
- RLS;
- Storage;
- funciones transaccionales;
- vistas ATP/inventario;
- plan de migración desde `state.json`.

Antes de producir ese esquema se deben cerrar, al menos, D-01, D-03, D-04 y D-06.
