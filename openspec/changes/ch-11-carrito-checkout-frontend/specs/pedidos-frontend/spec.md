## ADDED Requirements

### Requirement: OrdersPage — lista de pedidos del usuario
La OrdersPage SHALL mostrar la lista paginada de pedidos del usuario autenticado, obtenida vía `GET /api/v1/pedidos`. Cada pedido SHALL mostrar: id, estado actual, total y fecha de creación. La lista SHALL actualizarse automáticamente cada 30 segundos mediante `refetchInterval`. SHALL mostrar un skeleton loader durante la carga inicial. Si no hay pedidos, SHALL mostrar un mensaje con enlace al catálogo.

#### Scenario: Lista de pedidos con items
- **WHEN** el usuario autenticado navega a `/orders`
- **THEN** el sistema muestra la lista de sus pedidos con id, estado, total y fecha, con polling cada 30s

#### Scenario: Sin pedidos
- **WHEN** el usuario no tiene pedidos
- **THEN** la página muestra "No tenés pedidos aún" y un enlace "Ver catálogo"

#### Scenario: Skeleton durante carga inicial
- **WHEN** la query de pedidos está en estado `pending`
- **THEN** se muestran skeleton cards en lugar de datos reales

#### Scenario: Acceso sin autenticación
- **WHEN** un usuario no autenticado navega a `/orders`
- **THEN** el sistema redirige a `/login`

---

### Requirement: PedidoDetailPanel — detalle del pedido con historial
Al seleccionar un pedido de la lista, el sistema SHALL mostrar el detalle completo: items (nombre, cantidad, precio), subtotal, dirección (si aplica) y el historial de estados. El historial SHALL mostrar cada transición con estado, fecha/hora y notas. Los datos SHALL obtenerse vía `GET /api/v1/pedidos/{id}` y `GET /api/v1/pedidos/{id}/historial` con `refetchInterval: 30_000`.

#### Scenario: Seleccionar un pedido de la lista
- **WHEN** el usuario hace clic en un pedido de la lista en OrdersPage
- **THEN** se muestra el panel de detalle con items del pedido, total y sección de historial

#### Scenario: HistorialTimeline con múltiples estados
- **WHEN** el pedido pasó por PENDIENTE → CONFIRMADO → EN_PREP
- **THEN** el historial muestra 3 entradas en orden cronológico ascendente, cada una con estado y fecha

#### Scenario: Polling actualiza el estado
- **WHEN** el backend cambia el estado del pedido mientras el usuario está en la página
- **THEN** en el próximo ciclo de 30s la UI refleja el nuevo estado automáticamente

---

### Requirement: Cancelar pedido propio desde OrdersPage
El sistema SHALL mostrar un botón "Cancelar pedido" en el detalle del pedido cuando el estado es PENDIENTE o CONFIRMADO. Al confirmarlo, SHALL llamar `DELETE /api/v1/pedidos/{id}` y actualizar la UI. Si el pedido ya no puede cancelarse (422 `CANCELACION_NO_PERMITIDA`), SHALL mostrar un mensaje de error.

#### Scenario: Cancelación exitosa
- **WHEN** el usuario hace clic en "Cancelar pedido" en un pedido PENDIENTE y confirma
- **THEN** el sistema llama `DELETE /api/v1/pedidos/{id}`, y al recibir HTTP 200 actualiza el estado a CANCELADO en la UI

#### Scenario: Botón no visible para estados no cancelables
- **WHEN** el pedido está en estado EN_PREP, EN_CAMINO, ENTREGADO o CANCELADO
- **THEN** el botón "Cancelar pedido" no se muestra

#### Scenario: Error al cancelar
- **WHEN** el backend responde 422 con `CANCELACION_NO_PERMITIDA`
- **THEN** la UI muestra un mensaje de error y no modifica el estado visible

---

### Requirement: entity pedido — tipos TypeScript y funciones API
El sistema SHALL tener en `entities/pedido/` los tipos TypeScript alineados con los schemas del backend: `PedidoRead`, `PedidoDetail`, `DetallePedidoRead`, `HistorialRead`, `PaginatedPedidos`, `CrearPedidoRequest`, `ItemPedidoRequest`. SHALL exponer funciones API: `crearPedido(data)`, `listarPedidos(params)`, `getPedido(id)`, `getHistorial(id)`, `cancelarPedido(id)`.

#### Scenario: Tipos alineados con backend
- **WHEN** se construye `CrearPedidoRequest` para el frontend
- **THEN** los campos coinciden con el backend: `items: ItemPedidoRequest[]`, `direccion_id: number | null`, `notas: string | null`

#### Scenario: Función crearPedido
- **WHEN** se llama `crearPedido({ items, direccion_id: null })` desde el hook de checkout
- **THEN** realiza `POST /api/v1/pedidos` con el body correcto y retorna `PedidoRead`
