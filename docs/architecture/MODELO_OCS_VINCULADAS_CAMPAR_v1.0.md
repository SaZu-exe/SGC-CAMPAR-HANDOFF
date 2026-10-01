# MODELO DE OCs VINCULADAS — CAMPAR SGC Digital

**Documento:** ARQ-OC-01  
**Versión:** 1.0  
**Estado:** IMPLEMENTADO EN PROTOTIPO  
**Fecha:** 2026-10-01  
**Base funcional:** AI Studio/GitHub actual

## 1. Caso de negocio

Planta puede emitir una OC original y, al momento de recibir una partida ya producida/entregada, indicar que esa mercancía será recibida bajo un número de OC distinto.

CAMPAR debe conservar:

- la OC que originó producción;
- lote e inspección originales;
- remisión física;
- la nueva OC usada para recepción;
- cantidad reclasificada;
- motivo y usuario que realizó el vínculo.

La nueva OC no debe duplicar demanda ni disparar producción adicional por las piezas vinculadas.

## 2. Modelo implementado

Se incorpora `state.orderLinks[]`.

Cada vínculo contiene:

- `id`
- `sourceOrderId`
- `sourceLineId`
- `targetOrderId`
- `targetLineId`
- `productCode`
- `qty`
- `deliveryId`
- `type`
- `reason`
- `status`
- `createdAt`
- `createdBy`

## 3. Tipos disponibles

- Reclasificación de OC en planta
- Sustitución administrativa
- Continuación de OC

## 4. Reglas implementadas

1. Sólo puede vincularse cantidad físicamente entregada.
2. No puede reutilizarse más cantidad de una remisión de la que realmente fue entregada.
3. Una OC no puede vincularse consigo misma.
4. La OC original conserva sus lotes, producción e inspecciones.
5. Si la OC destino no existe, el sistema crea una OC vinculada.
6. Si la OC destino existe y tiene la misma partida/producto con saldo suficiente, se utiliza esa partida.
7. Si existe el producto en la OC destino pero no tiene capacidad suficiente, el sistema bloquea la operación para evitar sobrecumplimiento.
8. Si la OC destino no contiene ese producto, se agrega una partida vinculada.
9. Las piezas vinculadas a la OC destino cuentan como cumplimiento comercial, pero no como demanda productiva nueva.
10. Las piezas reclasificadas salen del compromiso comercial pendiente de la OC original.
11. ATP y cumplimiento por partida utilizan el vínculo para evitar duplicar demanda.
12. La trazabilidad del vínculo aparece en ambos expedientes de OC y en la remisión asociada.

## 5. Ejemplo

```text
OC 450001
P1 = 200 pzas

Entrega ENT-014 = 100 pzas
Planta solicita recepción bajo OC 450099

Resultado:
OC 450001
- volumen original: 200
- reclasificado: 100 → OC 450099
- compromiso comercial restante: 100

OC 450099
- partida vinculada: 100
- cubierta desde OC 450001 / P1
- demanda productiva nueva: 0

ENT-014
- OC de origen: 450001
- OC de recepción vinculada: 450099
```

## 6. Permiso

La acción usa `orders.link_receipt`.

Perfiles habilitados actualmente:

- Sandra
- Ian
- Esme
- Cris

Cris recibe este permiso porque la reclasificación puede ocurrir durante la entrega/recepción en planta; no obtiene con ello permisos generales para crear o modificar OCs fuera de este flujo.

## 7. Backend definitivo

En PostgreSQL/Supabase este arreglo temporal deberá migrarse a una tabla relacional `order_links` con claves foráneas, restricciones de cantidad y auditoría transaccional.
