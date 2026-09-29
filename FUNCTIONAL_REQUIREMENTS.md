# Requisitos funcionales actuales

## Navegación principal
Mantener 7 módulos principales:
1. Inicio
2. Órdenes
3. Producción
4. Inventario
5. Inspecciones
6. Entregas
7. No conformidades

Los recursos documentales pueden aparecer como accesos secundarios sin convertirse necesariamente en módulos principales.

## Inicio
Debe funcionar como **hub de acceso rápido**, no como dashboard saturado.
Debe ofrecer acceso rápido a:
- Nueva OC
- Abrir OC
- Nueva inspección
- Abrir inspecciones
- Buscar producto/lote/OC
- módulos principales
- recursos documentales principales

Sólo mostrar alertas operativas verdaderamente importantes.

## Órdenes
Debe permitir:
- crear OC;
- abrir expediente de OC;
- manejar múltiples partidas;
- asignar cantidad a Cosme, Duma o ambos;
- ampliar una OC sin sobrescribir el dato original;
- reabrir una OC cerrada;
- registrar motivo, fecha, usuario y valores antes/después;
- consultar historial de cambios;
- consultar cantidades ordenadas, producidas, liberadas, entregadas y pendientes.

Una OC puede tener entregas parciales y más de una línea/partida.

## Producción
Etapas válidas:
`En corte → En armado → En estufado → Limpios`

Requisitos:
- mover cantidad entre etapas sin duplicarla;
- permitir avances parciales;
- separar Cosme y Duma;
- mantener vínculo con OC/partida/producto;
- crear/habilitar lotes inspeccionables cuando la cantidad llegue a Limpios.

## Inventario
Debe priorizar:
- Cosme;
- Duma;
- concentrado total del producto.

La tarjeta “Producto seleccionado” debe ser compacta y secundaria visualmente.

Los KPI superiores deben enfocarse en piezas **Limpias/listas para inspección** de:
- Cosme;
- Duma;
- ambos aserraderos.

Debe mostrar etapas físicas únicamente hasta `Limpios`. La calidad se consulta/gestiona en Inspecciones.

Para cada lote Limpio debe existir la acción `Inspeccionar lote`.

## Inspecciones
Debe permitir:
- iniciar inspección desde un lote Limpio;
- crear inspección manualmente cuando proceda;
- abrir una inspección existente;
- consultar lote, producto, aserradero y cantidad;
- tamaño de lote y muestra;
- mediciones de humedad/dimensiones según diseño posterior;
- defectos/hallazgos;
- evidencia;
- resultado;
- estado de liberación;
- responsable/autoridad;
- reinspección cuando existe retrabajo.

No borrar o sobrescribir inspecciones anteriores.

## No conformidades
Una retención/rechazo debe poder vincularse a lote e inspección. Debe soportar:
- causa/defecto;
- severidad/clasificación;
- retrabajo;
- reinspección;
- cierre con evidencia.

## Entregas
Debe poder:
- usar únicamente cantidad liberada/apta para entrega;
- vincular lote(s), OC, planta y cantidad;
- registrar fecha y estado;
- confirmar entrega/recepción;
- soportar entregas parciales;
- cerrar OC sólo cuando corresponda al cumplimiento vigente.

## Buscador
Búsqueda global por al menos:
- OC
- código/nombre de producto
- lote
- inspección
- NC

## Persistencia
v0.9 usa localStorage sólo para validar lógica. Fase siguiente: backend multiusuario.
