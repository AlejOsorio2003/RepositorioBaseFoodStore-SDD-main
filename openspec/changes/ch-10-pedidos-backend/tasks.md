## 1. Seed de EstadoPedido

- [ ] 1.1 Crear función `seed_estados_pedido(session)` en `backend/app/pedidos/models.py` o en `backend/app/core/seed.py` que inserte los 6 estados (PENDIENTE, CONFIRMADO, EN_PREP, EN_CAMINO, ENTREGADO, CANCELADO) con `es_terminal` correcto, de forma idempotente
- [ ] 1.2 Registrar llamada al seed en el evento `startup` de `backend/app/main.py`

## 2. Schemas Pydantic (backend/app/pedidos/schemas.py)

- [ ] 2.1 Crear `ItemPedidoRequest` con campos: `producto_id: int`, `cantidad: int` (≥ 1), `personalizacion: list[int] | None`
- [ ] 2.2 Crear `CrearPedidoRequest` con campos: `items: list[ItemPedidoRequest]` (min_length=1), `direccion_id: int | None`, `notas: str | None`
- [ ] 2.3 Crear `AvanzarEstadoRequest` con campos: `nuevo_estado: str`, `motivo: str | None` — con validador que exija `motivo` cuando `nuevo_estado == "CANCELADO"` (RN-05)
- [ ] 2.4 Crear `DetallePedidoRead` con campos: `producto_id`, `nombre_snapshot`, `precio_snapshot`, `cantidad`, `personalizacion`
- [ ] 2.5 Crear `HistorialRead` con campos: `id`, `estado_nombre: str`, `estado_desde: str | None`, `usuario_id: int | None`, `notas: str | None`, `creado_en: datetime`
- [ ] 2.6 Crear `PedidoRead` con campos: `id`, `estado_nombre: str`, `total`, `costo_envio`, `created_at`
- [ ] 2.7 Crear `PedidoDetail` extendiendo `PedidoRead` con: `items: list[DetallePedidoRead]`, `direccion_snapshot: str | None`, `notas: str | None`
- [ ] 2.8 Crear `PaginatedPedidos` con campos: `items: list[PedidoRead]`, `total: int`, `page: int`, `size: int`

## 3. PedidoRepository (backend/app/pedidos/repository.py)

- [ ] 3.1 Implementar `get_by_id_with_relations(pedido_id: int) -> Pedido | None` con eager-load de `detalles` y `estado` (selectinload)
- [ ] 3.2 Implementar `list_paginated(page, size, usuario_id, estado_nombre) -> tuple[list[Pedido], int]` — filtra por `usuario_id` (None = todos), filtra por estado vía join a `EstadoPedido.nombre`, eager-load de estado
- [ ] 3.3 Implementar `get_historial(pedido_id: int) -> list[HistorialEstadoPedido]` ordenado por `creado_en ASC` con eager-load de `estado`
- [ ] 3.4 Implementar `get_estado_by_nombre(nombre: str) -> EstadoPedido | None` para lookup de estados

## 4. PedidoService (backend/app/pedidos/service.py)

- [ ] 4.1 Definir `TRANSICIONES_VALIDAS: dict[str, list[str]]` con las 6 entradas del FSM
- [ ] 4.2 Implementar helper `_pedido_to_read(pedido: Pedido) -> PedidoRead`
- [ ] 4.3 Implementar helper `_pedido_to_detail(pedido: Pedido) -> PedidoDetail`
- [ ] 4.4 Implementar `crear_pedido(uow, data: CrearPedidoRequest, usuario_id: int) -> PedidoRead`:
  - Iterar ítems: `uow.productos.get_by_id()` → validar `disponible=True`
  - Calcular total como suma de `precio_snapshot × cantidad`
  - Crear `Pedido` con `estado_id` de "PENDIENTE", `costo_envio=50.00`
  - Si `direccion_id` no es None: cargar dirección y serializar snapshot JSON en `direccion_snapshot`
  - Crear `DetallePedido` por cada ítem con `nombre_snapshot` y `precio_snapshot`
  - `uow.session.flush()` → obtener `pedido.id`
  - Crear primer `HistorialEstadoPedido` con `estado_desde=None` (RN-02)
- [ ] 4.5 Implementar `listar_pedidos(uow, usuario_id, rol, page, size, estado) -> PaginatedPedidos`:
  - Si rol es CLIENT: filtrar por `usuario_id`; si es ADMIN/GESTOR_PEDIDOS: sin filtro de usuario
- [ ] 4.6 Implementar `get_pedido(uow, pedido_id: int, usuario_id: int, rol: str) -> PedidoDetail`:
  - Verificar existencia → 404
  - Verificar acceso (propietario o ADMIN/GESTOR_PEDIDOS) → 403
- [ ] 4.7 Implementar `avanzar_estado(uow, pedido_id: int, data: AvanzarEstadoRequest, usuario_id: int) -> PedidoRead`:
  - Cargar pedido → 404
  - Obtener nombre del estado actual via `pedido.estado.nombre`
  - Validar en `TRANSICIONES_VALIDAS` → 422 `TRANSICION_INVALIDA` o `ESTADO_TERMINAL`
  - Lookup de nuevo estado por nombre → 422 si no existe
  - Actualizar `pedido.estado_id`
  - Insertar `HistorialEstadoPedido` con `estado_desde_id=estado_actual.id`, `notas=data.motivo`
- [ ] 4.8 Implementar `get_historial(uow, pedido_id: int, usuario_id: int, rol: str) -> list[HistorialRead]`:
  - Verificar acceso igual que `get_pedido`
- [ ] 4.9 Implementar `cancelar_pedido(uow, pedido_id: int, usuario_id: int) -> PedidoRead`:
  - Verificar propietario → 403
  - Verificar que estado actual es PENDIENTE o CONFIRMADO → 422 `CANCELACION_NO_PERMITIDA`
  - Llamar a `avanzar_estado` internamente con `nuevo_estado="CANCELADO"` y `motivo="Cancelado por el cliente"`

## 5. Router (backend/app/pedidos/router.py)

- [ ] 5.1 Implementar `POST /` → `response_model=PedidoRead`, `status_code=201` → solo CLIENT → delega a `service.crear_pedido()`
- [ ] 5.2 Implementar `GET /` → `response_model=PaginatedPedidos` → CLIENT/ADMIN/GESTOR_PEDIDOS → delega a `service.listar_pedidos()`
- [ ] 5.3 Implementar `GET /{pedido_id}` → `response_model=PedidoDetail` → propietario/ADMIN/GESTOR_PEDIDOS → delega a `service.get_pedido()`
- [ ] 5.4 Implementar `PATCH /{pedido_id}/estado` → `response_model=PedidoRead` → solo ADMIN/GESTOR_PEDIDOS → delega a `service.avanzar_estado()`
- [ ] 5.5 Implementar `GET /{pedido_id}/historial` → `response_model=list[HistorialRead]` → propietario/ADMIN/GESTOR_PEDIDOS → delega a `service.get_historial()`
- [ ] 5.6 Implementar `DELETE /{pedido_id}` → `response_model=PedidoRead` → solo CLIENT propietario → delega a `service.cancelar_pedido()`

## 6. Wiring

- [ ] 6.1 Registrar `pedidos_router` en `backend/app/main.py` con prefix `/api/v1/pedidos` y tag `pedidos`
- [ ] 6.2 Confirmar que `uow.pedidos` está tipado como `PedidoRepository` en `backend/app/core/uow.py` (ya wired desde CH-00, solo verificar)

## 7. Verificación

- [ ] 7.1 Arrancar servidor y confirmar que no hay errores de importación ni de seed
- [ ] 7.2 Probar `POST /api/v1/pedidos` con ítems válidos → HTTP 201 con `estado_nombre: "PENDIENTE"`
- [ ] 7.3 Probar `POST /api/v1/pedidos` con producto no disponible → HTTP 422 `PRODUCTO_NO_DISPONIBLE`
- [ ] 7.4 Probar `GET /api/v1/pedidos` con token CLIENT → solo sus pedidos
- [ ] 7.5 Probar `GET /api/v1/pedidos` con token ADMIN → todos los pedidos
- [ ] 7.6 Probar `GET /api/v1/pedidos/{id}` con propietario → HTTP 200 con `items` y `PedidoDetail`
- [ ] 7.7 Probar `GET /api/v1/pedidos/{id}` con otro CLIENT → HTTP 403
- [ ] 7.8 Probar `PATCH /api/v1/pedidos/{id}/estado` con ADMIN: PENDIENTE → CONFIRMADO → HTTP 200
- [ ] 7.9 Probar `PATCH /api/v1/pedidos/{id}/estado` transición inválida (ENTREGADO → PENDIENTE) → HTTP 422
- [ ] 7.10 Probar `PATCH /api/v1/pedidos/{id}/estado` CANCELADO sin motivo → HTTP 422
- [ ] 7.11 Probar `GET /api/v1/pedidos/{id}/historial` → lista ordenada cronológicamente
- [ ] 7.12 Probar `DELETE /api/v1/pedidos/{id}` con CLIENT propietario en PENDIENTE → HTTP 200 con `estado_nombre: "CANCELADO"`
- [ ] 7.13 Probar `DELETE /api/v1/pedidos/{id}` con pedido en EN_PREP → HTTP 422 `CANCELACION_NO_PERMITIDA`
