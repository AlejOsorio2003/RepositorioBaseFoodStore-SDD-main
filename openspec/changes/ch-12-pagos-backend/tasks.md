## 1. Dependencias y configuración

- [ ] 1.1 Agregar `mercadopago>=2.3.0` a `backend/requirements.txt`
- [ ] 1.2 Agregar `MP_NOTIFICATION_URL: str = ""` a `backend/app/core/config.py` (clase `Settings`)
- [ ] 1.3 Agregar `MP_NOTIFICATION_URL=https://tu-dominio.com/api/v1/pagos/webhook` a `backend/.env.example`

## 2. Schemas

- [ ] 2.1 Crear `CrearPagoRequest(BaseModel)` con campos: `pedido_id: int`, `token: str`, `forma_pago_codigo: str`
- [ ] 2.2 Crear `WebhookIPNPayload(BaseModel)` con campos: `topic: str`, `id: str` (query params del IPN)
- [ ] 2.3 Crear `PagoResponse(BaseModel)` con campos: `id: int`, `pedido_id: int`, `mp_payment_id: int | None`, `mp_status: str | None`, `mp_status_detail: str | None`, `external_reference: str`, `monto: float | None`, `created_at: datetime`

## 3. Repository

- [ ] 3.1 Implementar `PagoRepository.create(pago: Pago) -> Pago` — agrega y hace flush
- [ ] 3.2 Implementar `PagoRepository.get_by_pedido_id(pedido_id: int) -> Pago | None`
- [ ] 3.3 Implementar `PagoRepository.get_by_mp_payment_id(mp_payment_id: int) -> Pago | None`

## 4. Service — crear_pago

- [ ] 4.1 Implementar `PagoService.crear_pago(data: CrearPagoRequest, current_user, uow: UnitOfWork) -> PagoResponse`:
  - Verificar que `settings.MP_ACCESS_TOKEN != ""` — si vacío lanzar `HTTPException(503, "MERCADOPAGO_NO_CONFIGURADO")`
  - Buscar pedido por `data.pedido_id`; verificar que pertenece al `current_user` — 404 si no existe, 403 si no pertenece
  - Buscar `FormaPago` por `data.forma_pago_codigo` con `habilitado=True` — 422 si no existe o está deshabilitada
  - Generar `idempotency_key = uuid.uuid4()`
  - Llamar a `mercadopago.SDK(settings.MP_ACCESS_TOKEN).payment().create(...)` con `token`, `transaction_amount`, `installments=1`, `payment_method_id`, `external_reference=str(pedido_id)`, `notification_url=settings.MP_NOTIFICATION_URL`; header `X-Idempotency-Key: str(idempotency_key)`
  - Crear fila `Pago` con los datos del response de MP y hacer commit vía UoW
  - Retornar `PagoResponse`

## 5. Service — procesar_webhook

- [ ] 5.1 Implementar `PagoService.procesar_webhook(topic: str, mp_id: str, uow: UnitOfWork) -> dict`:
  - Si `topic != "payment"` retornar `{"status": "ignored"}`
  - Consultar MP: `mercadopago.SDK(settings.MP_ACCESS_TOKEN).payment().get(int(mp_id))`
  - Extraer `mp_status`, `external_reference` del response
  - Buscar `Pago` por `mp_payment_id = int(mp_id)` — si no existe retornar `{"status": "not_found"}`
  - Actualizar `pago.mp_status` y hacer flush
  - Si `mp_status == "approved"`: llamar a `avanzar_estado(pedido_id, "CONFIRMADO", uow)` del pedido service
  - Commit y retornar `{"status": "ok"}`

## 6. Service — get_pago_by_pedido

- [ ] 6.1 Implementar `PagoService.get_pago_by_pedido(pedido_id: int, current_user, uow: UnitOfWork) -> PagoResponse`:
  - Verificar que el pedido existe y pertenece al usuario (o es ADMIN) — 403/404 según corresponda
  - Buscar `Pago` por `pedido_id` — 404 `PAGO_NOT_FOUND` si no existe
  - Retornar `PagoResponse`

## 7. Router

- [ ] 7.1 Implementar `POST /` (`/api/v1/pagos/crear`) con `response_model=PagoResponse`, `status_code=201`, `current_user` requerido con rol CLIENT
- [ ] 7.2 Implementar `POST /webhook` (`/api/v1/pagos/webhook`) sin autenticación, query params `topic: str` e `id: str`, retorna `dict`
- [ ] 7.3 Implementar `GET /{pedido_id}` (`/api/v1/pagos/{pedido_id}`) con `response_model=PagoResponse`, `current_user` requerido (CLIENT o ADMIN)

## 8. UnitOfWork y wiring

- [ ] 8.1 Importar `PagoRepository` en `backend/app/core/uow.py` y agregar `self.pagos = PagoRepository(session)` dentro del context manager
- [ ] 8.2 Verificar que `pagos_router` sigue incluido en `main.py` con prefijo `/api/v1/pagos` (ya está — solo confirmar)
- [ ] 8.3 Verificar que `app.pagos.models` está importado en `app/core/all_models.py`

## 9. Actualizar PedidoDetail

- [ ] 9.1 Agregar `from app.pagos.schemas import PagoResponse` en `backend/app/pedidos/schemas.py`
- [ ] 9.2 Agregar campo `pago: PagoResponse | None = None` a la clase `PedidoDetail`
- [ ] 9.3 Actualizar `PedidoService.get_pedido` para incluir el pago asociado en el retorno (`uow.pagos.get_by_pedido_id(pedido.id)`)

## 10. Verificación

- [ ] 10.1 `POST /api/v1/pagos/crear` con tarjeta aprobada sandbox → retorna 201 con `mp_status: "approved"`
- [ ] 10.2 `POST /api/v1/pagos/crear` con tarjeta rechazada sandbox → retorna 201 con `mp_status: "rejected"`
- [ ] 10.3 `POST /api/v1/pagos/webhook?topic=payment&id=<mp_payment_id>` → pedido avanza a CONFIRMADO
- [ ] 10.4 `GET /api/v1/pagos/{pedido_id}` → retorna PagoResponse con estado actualizado
- [ ] 10.5 `GET /api/v1/pedidos/{id}` → `PedidoDetail.pago` incluye el estado del pago
- [ ] 10.6 `POST /api/v1/pagos/webhook?topic=merchant_order&id=1` → retorna `{"status": "ignored"}`
- [ ] 10.7 `POST /api/v1/pagos/crear` con `forma_pago_codigo` inexistente → retorna 422
