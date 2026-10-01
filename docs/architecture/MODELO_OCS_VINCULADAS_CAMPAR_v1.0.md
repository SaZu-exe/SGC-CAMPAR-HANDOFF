# MODELO DE OC DE RECEPCIÓN VINCULADA — CAMPAR SGC Digital

**Documento:** ARQ-OC-01  
**Versión:** 1.1  
**Estado:** IMPLEMENTADO EN PROTOTIPO  
**Fecha:** 2026-10-01  
**Base funcional:** AI Studio/GitHub actual

## 1. Caso de negocio

Planta puede emitir una OC original y, al momento de recibir una partida ya producida o enviada, indicar que esa mercancía será registrada bajo un número de OC distinto.

CAMPAR debe conservar:

- la OC original que generó la demanda y la producción;
- su partida, asignaciones, lote, inspección y entrega;
- el número de OC informado posteriormente por planta;
- la cantidad relacionada;
- la remisión asociada cuando ya exista;
- el motivo, fecha y usuario que registró el vínculo.

## 2. Decisión funcional vigente

La **OC de recepción vinculada no es una nueva Orden de Compra operativa dentro de CAMPAR**.

Se maneja como una referencia comercial asociada a la OC original.

Por lo tanto:

- no aparece como una fila independiente en el módulo Órdenes;
- no genera un folio interno nuevo;
- no genera demanda adicional;
- no crea asignaciones a aserradero;
- no crea producción, lotes o inspecciones propios;
- no reduce ni traslada el progreso de la OC original;
- puede localizarse buscando su número en el módulo Órdenes;
- se muestra dentro del expediente de la OC original.

## 3. Modelo temporal implementado

Se mantiene temporalmente `state.orderLinks[]` por compatibilidad con el prototipo.

Cada vínculo utiliza principalmente:

- `id`
- `sourceOrderId`
- `sourceLineId`
- `productCode`
- `qty`
- `deliveryId` (opcional)
- `receivingOrderNumber`
- `receivingPlant`
- `type`
- `reason`
- `status`
- `createdAt`
- `createdBy`

El campo heredado `targetOrderId` se conserva temporalmente sólo para compatibilidad de datos, pero representa el número de referencia de recepción y **no una segunda OC operativa**.

## 4. Tipos disponibles

- Reclasificación de OC en planta
- Sustitución administrativa
- Continuación de OC

## 5. Reglas implementadas

1. La OC original permanece como única orden operativa.
2. Su cantidad original sigue siendo la base de demanda y producción.
3. El avance de cumplimiento se calcula con las entregas físicas registradas contra la OC original.
4. Registrar una OC de recepción no disminuye el porcentaje de avance de la OC original.
5. La cantidad vinculada no puede exceder la cantidad de la partida original disponible para vinculación.
6. Una misma cantidad no debe vincularse dos veces.
7. Si se selecciona una remisión, la cantidad vinculada no puede superar el saldo disponible de esa remisión.
8. La remisión es opcional, permitiendo que Ian o Esme registren el dato cuando planta lo comunica, incluso si la confirmación logística todavía no ha sido completada.
9. El vínculo puede anularse sin modificar la producción, lotes, inspecciones o entregas de la OC original.
10. La referencia queda registrada en el historial de trazabilidad.
11. El número de OC de recepción puede utilizarse en la búsqueda del módulo Órdenes para localizar la OC original.
12. Las versiones antiguas del prototipo que crearon OCs vinculadas independientes se normalizan para que esas referencias dejen de mostrarse como órdenes operativas separadas.

## 6. Ejemplo

```text
OC ORIGINAL 450001
P1 = 200 pzas

Producción / inspección / lotes
        │
        └── pertenecen siempre a OC 450001

Entrega física:
100 pzas

Planta informa:
"Estas 100 piezas ingresarán con OC 450099"

Resultado en CAMPAR:

OC 450001
├── P1: 200 pzas
├── Entregadas: 100 / 200
├── Avance: 50 %
└── OC de recepción vinculada:
      450099 · 100 pzas

450099 NO aparece como otra OC en la tabla de Órdenes.
```

Cuando se complete la segunda entrega de 100 piezas:

```text
OC 450001
Entregadas: 200 / 200
Avance: 100 %
```

El vínculo comercial con 450099 permanece como parte de la trazabilidad.

## 7. Responsabilidad y permiso

La acción utiliza:

`orders.link_receipt`

Perfiles autorizados:

- **Ian — IT & Soporte Multifuncional**
- **Esme — Coordinación Operativa Multifuncional**

Cris puede reportar desde planta que hubo cambio de OC, pero no registra ni modifica el vínculo dentro del sistema.

## 8. Presentación visual

Se conserva el lenguaje visual de AI Studio.

En la tabla de Órdenes se mantiene una sola fila para la OC original y, debajo de su número, puede mostrarse de forma secundaria:

`Recepción: 450099`

En el expediente se muestra un bloque denominado:

**OCs de recepción vinculadas**

sin convertir esas referencias en nuevas órdenes operativas.

## 9. Backend definitivo

En PostgreSQL/Supabase deberá modelarse como una entidad de referencia comercial, por ejemplo:

`receiving_order_links`

vinculada a:

- OC original;
- partida original;
- remisión opcional;
- cantidad;
- usuario;
- fecha.

No deberá existir una segunda fila en `purchase_orders` únicamente por este cambio administrativo de recepción.
