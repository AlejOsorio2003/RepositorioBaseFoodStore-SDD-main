## ADDED Requirements

### Requirement: Crear pedido
El sistema SHALL exponer `POST /api/v1/pedidos` que acepta una lista de ítems y crea el pedido en una única transacción atómica. Cada ítem requiere `producto_id`, `cantidad` (≥ 1) y opcionalmente `personalizacion` (IDs de ingredientes removidos). El total se calcula como suma de `precio_snapshot × cantidad` por ítem. El primer registro de `HistorialEstadoPedido` se inserta con `estado_desde=NULL`. Solo usuarios con rol CLIENT pueden crear pedidos.

#### Scenario: Creación exitosa
- **WHEN** un CLIENT autenticado hace `POST /api/v1/pedidos` con ítems válidos y productos disponibles
- **THEN** el sistema retorna HTTP 201 con `PedidoRead` incluyendo `id`, `estado_nombre: "PENDIENTE"`, `total`, `created_at`

#### Scenario: Producto no disponible
- **WHEN** uno de los ítems referencia un producto con `disponible=false`
- **THEN** el sistema retorna HTTP 422 con detalle `PRODUCTO_NO_DISPONIBLE` y no crea ningún registro

#### Scenario: Producto no encontrado
- **WHEN** uno de los ítems referencia un `producto_id` inexistente
- **THEN** el sistema retorna HTTP 404 con detalle `PRODUCTO_NOT_FOUND`

#### Scenario: Lista de ítems vacía
- **WHEN** el body incluye `items: []`
- **THEN** el sistema retorna HTTP 422 (validación Pydantic: mínimo 1 ítem)

#### Scenario: Dirección opcional
- **WHEN** el body incluye `direccion_id: null` o no incluye el campo
- **THEN** el pedido se crea con `direccion_id=null` (retiro en local) y `direccion_snapshot=null`

#### Scenario: Snapshot de dirección
- **WHEN** el body incluye un `direccion_id` válido
- **THEN** el pedido almacena un snapshot JSON de los datos de la dirección en `direccion_snapshot`

---

### Requirement: Listar pedidos
El sistema SHALL exponer `GET /api/v1/pedidos` con paginación. Un CLIENT autenticado ve solo sus propios pedidos. Un usuario con rol ADMIN o GESTOR_PEDIDOS ve todos los pedidos del sistema. Soporta filtros opcionales: `estado` (nombre de estado), `page`, `size`.

#### Scenario: CLIENT ve solo sus pedidos
- **WHEN** un CLIENT hace `GET /api/v1/pedidos`
- **THEN** retorna HTTP 200 con lista paginada de sus propios pedidos únicamente

#### Scenario: ADMIN ve todos los pedidos
- **WHEN** un ADMIN hace `GET /api/v1/pedidos`
- **THEN** retorna HTTP 200 con lista paginada de todos los pedidos del sistema

#### Scenario: Filtro por estado
- **WHEN** se hace `GET /api/v1/pedidos?estado=PENDIENTE`
- **THEN** retorna solo pedidos con `estado_nombre = "PENDIENTE"`

---

### Requirement: Detalle de pedido
El sistema SHALL exponer `GET /api/v1/pedidos/{id}` que retorna el detalle completo del pedido incluyendo ítems (`DetallePedidoRead`) y última entrada del historial. Solo el propietario del pedido, ADMIN o GESTOR_PEDIDOS pueden acceder.

#### Scenario: Detalle exitoso para propietario
- **WHEN** el propietario del pedido hace `GET /api/v1/pedidos/{id}`
- **THEN** retorna HTTP 200 con `PedidoDetail` con campos: `id`, `estado_nombre`, `total`, `costo_envio`, `items: list[DetallePedidoRead]`, `created_at`

#### Scenario: Acceso denegado a otro usuario
- **WHEN** un CLIENT intenta acceder a un pedido que no le pertenece
- **THEN** el sistema retorna HTTP 403

#### Scenario: Pedido no encontrado
- **WHEN** se hace `GET /api/v1/pedidos/9999` y no existe
- **THEN** el sistema retorna HTTP 404

---

### Requirement: Avanzar estado del pedido
El sistema SHALL exponer `PATCH /api/v1/pedidos/{id}/estado` que valida la transición FSM antes de persistir. Solo usuarios con rol ADMIN o GESTOR_PEDIDOS pueden avanzar estados. Al avanzar, se inserta un nuevo registro en `HistorialEstadoPedido` (append-only). El motivo es obligatorio si `nuevo_estado = "CANCELADO"`.

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

---

### Requirement: Ver historial del pedido
El sistema SHALL exponer `GET /api/v1/pedidos/{id}/historial` que retorna todos los registros de `HistorialEstadoPedido` del pedido, ordenados por `creado_en ASC`. Solo el propietario, ADMIN o GESTOR_PEDIDOS pueden acceder. El historial es inmutable — nunca se modifican ni eliminan registros.

#### Scenario: Historial de pedido nuevo
- **WHEN** se pide el historial de un pedido recién creado
- **THEN** retorna una lista con exactamente 1 registro con `estado_desde: null`

#### Scenario: Historial tras múltiples transiciones
- **WHEN** el pedido pasó por PENDIENTE → CONFIRMADO → EN_PREP
- **THEN** retorna 3 registros en orden cronológico ascendente

#### Scenario: Acceso denegado
- **WHEN** un CLIENT intenta ver el historial de un pedido que no le pertenece
- **THEN** el sistema retorna HTTP 403

---

### Requirement: Cancelar pedido propio
El sistema SHALL exponer `DELETE /api/v1/pedidos/{id}` que permite a un CLIENT propietario cancelar su propio pedido. Solo es posible si el estado actual es PENDIENTE o CONFIRMADO. Al cancelar, se inserta registro en historial con `estado_desde = estado_actual` y `notas = motivo`. Retorna HTTP 200 con el pedido cancelado (no HTTP 204).

#### Scenario: Cancelación exitosa desde PENDIENTE
- **WHEN** el propietario hace `DELETE /api/v1/pedidos/{id}` con el pedido en PENDIENTE
- **THEN** el sistema transiciona a CANCELADO, inserta historial y retorna HTTP 200 con `estado_nombre: "CANCELADO"`

#### Scenario: Cancelación desde estado no permitido
- **WHEN** el propietario intenta cancelar un pedido en EN_PREP o posterior
- **THEN** el sistema retorna HTTP 422 con detalle `CANCELACION_NO_PERMITIDA`

#### Scenario: Otro usuario intenta cancelar
- **WHEN** un CLIENT intenta cancelar un pedido que no le pertenece
- **THEN** el sistema retorna HTTP 403

---

### Requirement: FSM de estados — tabla de transiciones
El sistema SHALL validar transiciones de estado según la siguiente matriz antes de persistir cualquier cambio de estado:

| Estado actual | Transiciones permitidas |
|---|---|
| PENDIENTE | CONFIRMADO, CANCELADO |
| CONFIRMADO | EN_PREP, CANCELADO |
| EN_PREP | EN_CAMINO, CANCELADO |
| EN_CAMINO | ENTREGADO |
| ENTREGADO | (ninguna — terminal) |
| CANCELADO | (ninguna — terminal) |

#### Scenario: Cualquier intento de transición no listada
- **WHEN** se solicita una transición que no aparece en la tabla anterior
- **THEN** el sistema retorna HTTP 422 con detalle `TRANSICION_INVALIDA`

---

### Requirement: Historial append-only garantizado
El sistema SHALL garantizar que `HistorialEstadoPedido` solo recibe inserciones. Ninguna capa (router, service, repository) SHALL emitir UPDATE ni DELETE sobre esta tabla.

#### Scenario: Registro inicial con estado_desde null
- **WHEN** se crea un pedido nuevo
- **THEN** el primer registro del historial tiene `estado_desde = null` (sin estado previo)

#### Scenario: Registro de transición con estado anterior
- **WHEN** el pedido avanza de PENDIENTE a CONFIRMADO
- **THEN** se inserta un registro con `estado_desde.nombre = "PENDIENTE"` y `estado_hasta.nombre = "CONFIRMADO"`

---

### Requirement: Seed de estados de pedido
El sistema SHALL garantizar que los 6 registros de `EstadoPedido` (PENDIENTE, CONFIRMADO, EN_PREP, EN_CAMINO, ENTREGADO, CANCELADO) existen en BD al arrancar. El seed es idempotente — no falla si los registros ya existen.

#### Scenario: Primer arranque sin estados
- **WHEN** la BD no tiene registros en `estados_pedido`
- **THEN** el startup inserta los 6 estados correctamente y el servidor arranca sin errores

#### Scenario: Arranque con estados ya existentes
- **WHEN** los 6 estados ya existen en BD
- **THEN** el startup no lanza errores ni duplica registros
