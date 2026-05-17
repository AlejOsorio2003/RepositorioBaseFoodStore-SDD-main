## Why

El sistema necesita el módulo de gestión de pedidos para completar el flujo de compra de extremo a extremo. Los módulos prerequisito (CH-06 Productos, CH-08 Direcciones, CH-09 Usuarios) están archivados y todos los stubs del módulo `pedidos/` están pendientes de implementación desde CH-00.

## What Changes

- Implementar **schemas Pydantic** completos del módulo pedidos: `CrearPedidoRequest`, `ItemPedidoRequest`, `AvanzarEstadoRequest`, `PedidoRead`, `PedidoDetail`, `DetallePedidoRead`, `HistorialRead`
- Implementar **PedidoRepository** con consultas paginadas, filtros por estado/usuario, eager-loading de relaciones
- Implementar **PedidoService** con:
  - `crear_pedido`: transacción atómica completa (validar disponibilidad, calcular total como snapshot, crear detalles, crear historial inicial)
  - `avanzar_estado`: validación FSM de 6 estados, append-only en historial, regla CANCELADO requiere motivo
  - `cancelar_pedido`: solo CLIENT propietario, solo desde PENDIENTE o CONFIRMADO
  - `get_pedido`, `listar_pedidos`, `get_historial`
- Implementar **router** con 6 endpoints REST (GET list, GET detail, POST crear, PATCH estado, GET historial, DELETE cancelar)
- **Alinear modelo con spec**: el modelo existente (CH-00) usa `estado_id` (FK a int) pero la spec define `estado_codigo` (FK semántica VARCHAR). El diseño adaptará la implementación al modelo existente sin migraciones destructivas, exponiendo `estado_codigo` en los schemas via join.
- Registrar `pedidos_router` en `main.py` y confirmar que `uow.pedidos` ya está wired en `UnitOfWork`

## Capabilities

### New Capabilities

- `pedidos-backend`: CRUD de pedidos con FSM de 6 estados, audit trail append-only, snapshots inmutables de precio/nombre

### Modified Capabilities

- `backend-infra`: `main.py` incluye el router de pedidos (registro de endpoint)

## Impact

- **Archivos nuevos/modificados:**
  - `backend/app/pedidos/schemas.py` — todos los schemas Pydantic
  - `backend/app/pedidos/repository.py` — PedidoRepository completo
  - `backend/app/pedidos/service.py` — PedidoService completo
  - `backend/app/pedidos/router.py` — 6 endpoints
  - `backend/app/main.py` — registrar pedidos_router
- **Dependencias de datos:** requiere `EstadoPedido` seed en BD (6 estados: PENDIENTE, CONFIRMADO, EN_PREP, EN_CAMINO, ENTREGADO, CANCELADO)
- **Prerequisitos archivados:** CH-06 (productos disponibles), CH-08 (direcciones), CH-09 (usuarios con roles)
- **Sin migraciones:** el modelo `Pedido`, `DetallePedido`, `HistorialEstadoPedido` ya fue generado en CH-00; no se modifican tablas
