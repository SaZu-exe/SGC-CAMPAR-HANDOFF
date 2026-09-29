# Contexto del proyecto CAMPAR SGC

## 1. Empresa y alcance
CAMPAR actúa como intermediaria/comercializadora de embalajes de madera. La fabricación se realiza externamente en dos aserraderos. Los productos principales son tarimas y marcos de madera.

Aserraderos usados en la app:
- **Cosme** — autorización operativa/fitosanitaria `MX-1361`.
- **Duma** — autorización operativa/fitosanitaria `MX-1071`.

Las entregas se realizan a tres plantas destino, identificadas operativamente como Planta 1, Planta 2 y Planta 3.

## 2. Roles actuales
- **Sandra**: Dirección; contacto principal con planta, prioridades, escalaciones, aprobación del SGC y consulta ejecutiva.
- **Esmeralda**: operación administrativa; OCs, inventarios, documentación, correos, consolidación y logística.
- **Gustavo**: supervisión/inspección y autoridad de liberación.
- **Alessandri**: supervisión/inspección y autoridad de liberación.
- **Ian** y **Cris**: apoyo en supervisión, inspección/reinspección y entregas; no deben asumir liberación por defecto.
- **Miguel**: chofer.

## 3. Arquitectura de procesos del SGC
### Estratégicos
- PE-01 Dirección y Planeación del SGC
- PE-02 Seguimiento y Evaluación del Desempeño
- PE-03 Revisión y Mejora del SGC

### Operativos
- PO-01 Gestión de Requisitos y Órdenes
- PO-02 Planeación y Seguimiento de Producción
- PO-03 Inspección y Liberación de Producto
- PO-04 Control de Inventario y Producto
- PO-05 Carga, Transporte y Entrega
- PO-06 Gestión de No Conformidades y Rechazos
- PO-07 Gestión y Evaluación de Proveedores

### Soporte
- PS-01 Gestión de Información Documentada
- PS-02 Gestión de Equipos de Medición
- PS-03 Competencia y Capacitación

## 4. Flujo operativo digital objetivo
`OC → Partida → Asignación Cosme/Duma → Producción → Limpios → Lote → Inspección → Liberación o NC → Entrega → Cierre`

Etapas físicas de producción que deben usarse de forma consistente:
1. En corte
2. En armado
3. En estufado
4. Limpios

`Limpios` es la última etapa productiva visible en inventario y habilita la inspección CAMPAR. No equivale a producto liberado.

## 5. Trazabilidad
La **unidad central de trazabilidad es el lote**. Un lote debe poder vincularse con:
- OC y partida
- producto
- aserradero
- cantidad
- movimientos de producción
- inspección/reinspección
- NC y retrabajo
- liberación
- tratamiento HT/evidencia aplicable
- entrega y recepción

## 6. Inspección
Controles habituales del proyecto:
- dimensiones según plano/ficha vigente del producto;
- humedad cuando aplique;
- componentes, ensamble, fijación y daño;
- hongo;
- nudos/ojos según especificación aplicable;
- deformación;
- limpieza;
- verificación de tratamiento/marca fitosanitaria cuando aplique.

Principios ya acordados:
- el plano/ficha vigente prevalece sobre tolerancias genéricas;
- no generalizar ±3 mm a todos los productos;
- humedad máxima de 20 % cuando la especificación aplicable lo requiere;
- hongo y humedad alta se tratan como condiciones críticas relevantes;
- retrabajo requiere reinspección antes de reingresar a estado conforme;
- Gustavo o Alessandri realizan la liberación final en el esquema actual.

Equipos identificados:
- General Tools MMD4E
- Delmhorst Navigator BDX-30
- flexómetros

## 7. Muestreo del proyecto
El manual v1.2 contiene las cantidades de muestra adoptadas para el piloto con Nivel General II y la regla interna 1–15 = 100 %.

No inventar tablas Ac/Re. La regla piloto conservadora permanece válida mientras el plan exacto Ac/Re no esté cotejado contra copia controlada: ante una NC en la muestra, retener y ampliar revisión/100 % del lote afectado antes de liberar.

## 8. Tratamiento y evidencia fitosanitaria
Todos los pallets suministrados por CAMPAR reciben tratamiento térmico/estufado dentro de la operación descrita. Para requisitos de exportación, la evidencia de tratamiento y marca se controla de forma separada de la medición de humedad.

No confundir “estufado/tratamiento” con conformidad final del producto.

## 9. Inventario
La pantalla debe permitir ver, para un producto específico:
- cantidad en Cosme;
- cantidad en Duma;
- concentrado total;
- desglose por En corte / En armado / En estufado / Limpios.

Una unidad sólo puede estar en una etapa productiva a la vez. Los movimientos entre etapas no deben inflar el inventario.

## 10. Documentación
La documentación maestra y manual de inspección se encuentran en `docs/master/`. El software habilita el SGC, pero no sustituye los documentos controlados ni la evidencia operativa.
