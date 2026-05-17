## MODIFIED Requirements

### Requirement: Detalle de pedido
El sistema SHALL exponer `GET /api/v1/pedidos/{id}` que retorna el detalle completo del pedido incluyendo ítems (`DetallePedidoRead`), última entrada del historial, y el pago asociado (`PagoResponse | None`). Solo el propietario del pedido, ADMIN o GESTOR_PEDIDOS pueden acceder.

#### Scenario: Detalle exitoso para propietario
- **WHEN** un CLIENT autenticado hace `GET /api/v1/pedidos/{id}` siendo propietario
- **THEN** retorna HTTP 200 con `PedidoDetail` que incluye `items`, `historial` y `pago` (puede ser `null` si no hay pago registrado)

#### Scenario: Pedido con pago aprobado
- **WHEN** el pedido tiene un `Pago` asociado con `mp_status = "approved"`
- **THEN** el campo `pago` en `PedidoDetail` incluye `mp_status`, `mp_payment_id`, `monto` y `mp_status_detail`

#### Scenario: Pedido sin pago
- **WHEN** el pedido no tiene ningún `Pago` asociado aún
- **THEN** el campo `pago` en `PedidoDetail` es `null`

#### Scenario: Acceso denegado
- **WHEN** un CLIENT intenta acceder al detalle de un pedido que no le pertenece
- **THEN** retorna HTTP 403
