## Why

El flujo de compra (CH-11) permite confirmar pedidos desde el frontend, pero el backend aún no tiene integración real con MercadoPago: los pagos no se procesan, los pedidos no avanzan a CONFIRMADO automáticamente y no existe un webhook IPN para confirmar pagos asincrónicos. Sin esta pieza, el ciclo de venta no cierra.

## What Changes

- Implementar `schemas.py` en `app/pagos/` — `CrearPagoRequest`, `WebhookIPNPayload`, `PagoResponse`
- Implementar `PagoRepository` — `create`, `get_by_pedido_id`, `get_by_mp_payment_id`
- Implementar `PagoService` — `crear_pago` (llama al SDK MP con `idempotency_key` UUID), `procesar_webhook` (valida topic, avanza pedido a CONFIRMADO si `approved`), `get_pago_by_pedido`
- Implementar `router.py` — 3 endpoints: `POST /pagos/crear`, `POST /pagos/webhook` (público), `GET /pagos/{pedido_id}`
- Agregar `mercadopago>=2.3.0` a `requirements.txt`
- Registrar `PagoRepository` en `UnitOfWork` como `uow.pagos`
- Agregar `MP_NOTIFICATION_URL` a `Settings` y `.env.example`

## Capabilities

### New Capabilities

- `pagos-backend`: Integración MercadoPago Checkout API — crear pago con idempotency_key, webhook IPN que avanza el pedido a CONFIRMADO, y consulta de pago por pedido.

### Modified Capabilities

- `pedidos-backend`: El schema `PedidoDetail` debe incluir el campo `pago: PagoResponse | None` para exponer el estado del pago al frontend.

## Impact

- `backend/app/pagos/schemas.py` — reescritura completa
- `backend/app/pagos/repository.py` — implementación completa
- `backend/app/pagos/service.py` — implementación completa
- `backend/app/pagos/router.py` — 3 endpoints
- `backend/app/core/uow.py` — agregar `uow.pagos`
- `backend/app/pedidos/schemas.py` — agregar campo `pago` a `PedidoDetail`
- `backend/requirements.txt` — agregar `mercadopago>=2.3.0`
- `backend/.env.example` — agregar `MP_NOTIFICATION_URL`
- `backend/app/core/config.py` — agregar `MP_NOTIFICATION_URL`
