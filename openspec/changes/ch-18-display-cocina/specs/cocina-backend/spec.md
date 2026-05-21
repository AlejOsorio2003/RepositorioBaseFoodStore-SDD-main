### Requirement: Nuevo rol COCINA

El sistema SHALL agregar el rol `COCINA` a la tabla `roles` mediante un seed idempotente que se ejecuta en el startup de la aplicación. El rol COCINA tiene acceso exclusivo a los endpoints del módulo `cocina`. Los roles existentes (CLIENT, ADMIN, GESTOR_PEDIDOS, GESTOR_STOCK) NO deben verse afectados por el seed.

#### Scenario: Primer arranque — rol no existe

- **WHEN** la BD no contiene el rol `COCINA`
- **THEN** el startup inserta el rol y el servidor arranca sin errores

#### Scenario: Arranque con rol ya existente

- **WHEN** el rol `COCINA` ya existe en BD
- **THEN** el startup no lanza errores ni duplica el registro (upsert idempotente)

#### Scenario: Roles preexistentes intactos

- **WHEN** el seed de COCINA se ejecuta en una BD con los 4 roles originales
- **THEN** los roles CLIENT, ADMIN, GESTOR_PEDIDOS y GESTOR_STOCK permanecen sin modificación

---

### Requirement: Listar pedidos para cocina

El sistema SHALL exponer `GET /api/v1/cocina/pedidos` que retorna todos los pedidos cuyo estado sea `CONFIRMADO` o `EN_PREP`, ordenados por `created_at ASC` (el más antiguo primero). Solo usuarios con rol `COCINA` pueden acceder. No requiere paginación; la cocina debe ver todos los pedidos activos de una vez. La respuesta incluye para cada pedido: `id`, `estado_nombre`, `items` (producto nombre + cantidad + personalización), `created_at` y `tiempo_desde_confirmado` (segundos transcurridos desde que el pedido entró a CONFIRMADO).

#### Scenario: Pedidos activos disponibles

- **WHEN** un usuario COCINA hace `GET /api/v1/cocina/pedidos`
- **THEN** el sistema retorna HTTP 200 con la lista de pedidos en estado CONFIRMADO o EN_PREP, ordenados por `created_at ASC`

#### Scenario: Sin pedidos activos

- **WHEN** no hay pedidos en estado CONFIRMADO ni EN_PREP
- **THEN** el sistema retorna HTTP 200 con lista vacía `[]`

#### Scenario: Acceso denegado a otros roles

- **WHEN** un usuario con rol CLIENT, ADMIN, GESTOR_PEDIDOS o GESTOR_STOCK hace `GET /api/v1/cocina/pedidos`
- **THEN** el sistema retorna HTTP 403

#### Scenario: Sin autenticación

- **WHEN** se hace `GET /api/v1/cocina/pedidos` sin JWT
- **THEN** el sistema retorna HTTP 401

---

### Requirement: Avanzar estado desde cocina

El sistema SHALL exponer `PATCH /api/v1/cocina/pedidos/{id}/estado` que permite al rol COCINA ejecutar exclusivamente las transiciones `CONFIRMADO → EN_PREP` y `EN_PREP → EN_CAMINO`. Cualquier otra transición solicitada desde este endpoint MUST ser rechazada con HTTP 422. Al avanzar el estado, se inserta un registro en `HistorialEstadoPedido` (append-only) con `usuario_id` del operador de cocina. El campo `motivo` no es requerido en este endpoint.

#### Scenario: Transición CONFIRMADO a EN_PREP

- **WHEN** un usuario COCINA hace `PATCH /api/v1/cocina/pedidos/{id}/estado` con `nuevo_estado: "EN_PREP"` y el pedido está en CONFIRMADO
- **THEN** el sistema actualiza `Pedido.estado_id`, inserta registro en historial y retorna HTTP 200 con `PedidoRead` actualizado

#### Scenario: Transición EN_PREP a EN_CAMINO

- **WHEN** un usuario COCINA hace `PATCH /api/v1/cocina/pedidos/{id}/estado` con `nuevo_estado: "EN_CAMINO"` y el pedido está en EN_PREP
- **THEN** el sistema actualiza `Pedido.estado_id`, inserta registro en historial y retorna HTTP 200 con `PedidoRead` actualizado

#### Scenario: Transición no permitida para COCINA

- **WHEN** un usuario COCINA intenta transicionar a un estado distinto de EN_PREP o EN_CAMINO (p.ej. CANCELADO, ENTREGADO)
- **THEN** el sistema retorna HTTP 422 con detalle `TRANSICION_NO_PERMITIDA_ROL`

#### Scenario: Transición FSM inválida

- **WHEN** un usuario COCINA intenta transicionar un pedido en estado EN_CAMINO a EN_CAMINO
- **THEN** el sistema retorna HTTP 422 con detalle `TRANSICION_INVALIDA`

#### Scenario: Pedido no encontrado

- **WHEN** el `id` no corresponde a ningún pedido existente
- **THEN** el sistema retorna HTTP 404 con detalle `PEDIDO_NOT_FOUND`

#### Scenario: Acceso denegado a otros roles

- **WHEN** un usuario con rol CLIENT, ADMIN, GESTOR_PEDIDOS o GESTOR_STOCK hace `PATCH /api/v1/cocina/pedidos/{id}/estado`
- **THEN** el sistema retorna HTTP 403

---

### Requirement: WebSocket de cocina — push de nuevos pedidos

El sistema SHALL exponer un endpoint WebSocket en `/api/v1/cocina/ws` que notifica en tiempo real al cliente conectado cada vez que un pedido entra al estado `CONFIRMADO`. La autenticación MUST realizarse mediante el primer mensaje enviado por el cliente al conectarse, que SHALL contener el JWT como texto plano. Si el JWT es inválido o el rol no es COCINA, la conexión MUST cerrarse con código 4001. El mensaje push MUST ser un JSON con los campos del pedido confirmado (`id`, `estado_nombre`, `items`, `created_at`).

#### Scenario: Conexión y autenticación exitosa

- **WHEN** un cliente abre la conexión WS y envía un JWT válido de rol COCINA como primer mensaje
- **THEN** el servidor acepta la conexión y permanece abierto esperando eventos

#### Scenario: Push de nuevo pedido CONFIRMADO

- **WHEN** un pedido transiciona a estado CONFIRMADO (por cualquier actor)
- **THEN** el servidor emite a todos los clientes WS de cocina conectados un JSON con los datos del pedido

#### Scenario: JWT inválido en primer mensaje

- **WHEN** el cliente envía un JWT malformado o expirado como primer mensaje
- **THEN** el servidor cierra la conexión con código WS 4001

#### Scenario: Rol incorrecto en JWT

- **WHEN** el cliente envía un JWT válido pero con rol distinto de COCINA
- **THEN** el servidor cierra la conexión con código WS 4001

#### Scenario: Desconexión limpia

- **WHEN** el cliente cierra la conexión WS
- **THEN** el servidor libera el socket sin errores y no intenta enviar más mensajes a ese cliente
