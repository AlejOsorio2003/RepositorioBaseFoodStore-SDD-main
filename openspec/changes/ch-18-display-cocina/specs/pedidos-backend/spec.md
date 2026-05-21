## MODIFIED Requirements

### Requirement: Avanzar estado del pedido

El sistema SHALL exponer `PATCH /api/v1/pedidos/{id}/estado` que valida la transición FSM antes de persistir. Solo usuarios con rol ADMIN o GESTOR_PEDIDOS pueden avanzar estados a través de este endpoint. Al avanzar, se inserta un nuevo registro en `HistorialEstadoPedido` (append-only). El motivo es obligatorio si `nuevo_estado = "CANCELADO"`.

El rol COCINA NO tiene acceso a este endpoint; las transiciones permitidas para COCINA (`CONFIRMADO → EN_PREP` y `EN_PREP → EN_CAMINO`) están restringidas exclusivamente al endpoint `PATCH /api/v1/cocina/pedidos/{id}/estado` definido en el módulo `cocina`.

#### Scenario: Transición válida

- **WHEN** un ADMIN hace `PATCH /api/v1/pedidos/{id}/estado` con `nuevo_estado: "CONFIRMADO"` desde PENDIENTE
- **THEN** el sistema actualiza `Pedido.estado_id`, inserta registro en historial y retorna HTTP 200 con `PedidoRead` actualizado

#### Scenario: Transición inválida

- **WHEN** se intenta transicionar de ENTREGADO a cualquier estado
- **THEN** el sistema retorna HTTP 422 con detalle `TRANSICION_INVALIDA`

#### Scenario: Estado terminal sin transiciones

- **WHEN** el pedido está en ENTREGADO o CANCELADO y se intenta avanzar
- **THEN** el sistema retorna HTTP 422 con detalle `ESTADO_TERMINAL`

#### Scenario: CANCELADO sin motivo

- **WHEN** se hace `PATCH` con `nuevo_estado: "CANCELADO"` y `motivo: null`
- **THEN** el sistema retorna HTTP 422 con detalle `MOTIVO_REQUERIDO`

#### Scenario: CANCELADO con motivo

- **WHEN** se hace `PATCH` con `nuevo_estado: "CANCELADO"` y `motivo: "Cliente solicitó cancelación"`
- **THEN** el sistema persiste el motivo en `HistorialEstadoPedido.notas` y retorna HTTP 200

#### Scenario: Acceso denegado a CLIENT

- **WHEN** un CLIENT intenta hacer `PATCH /api/v1/pedidos/{id}/estado`
- **THEN** el sistema retorna HTTP 403

#### Scenario: Acceso denegado a COCINA

- **WHEN** un usuario con rol COCINA intenta hacer `PATCH /api/v1/pedidos/{id}/estado`
- **THEN** el sistema retorna HTTP 403 (COCINA solo puede avanzar estados por `/api/v1/cocina/pedidos/{id}/estado`)
