## Context

El módulo `app/pagos/` tiene el modelo `Pago` completo (migrado desde CH-00) y el router wired en `main.py`, pero schemas, repository, service y router son stubs vacíos. El SDK `mercadopago` no está en `requirements.txt`. `MP_ACCESS_TOKEN` y `MP_PUBLIC_KEY` ya están en `Settings`; falta `MP_NOTIFICATION_URL`. El `UnitOfWork` no expone `pagos`. El flujo de pago es asíncrono: el backend crea el pago, MercadoPago notifica vía IPN/webhook, y el webhook avanza el pedido.

## Goals / Non-Goals

**Goals:**
- Implementar `POST /pagos/crear` que crea un pago en MercadoPago con `idempotency_key` UUID y registra la fila en `Pago`
- Implementar `POST /pagos/webhook` público que procesa notificaciones IPN de MercadoPago y avanza el pedido a CONFIRMADO si `approved`
- Implementar `GET /pagos/{pedido_id}` que retorna el estado del pago asociado a un pedido
- Registrar `PagoRepository` en `UnitOfWork`
- Agregar campo `pago` a `PedidoDetail`

**Non-Goals:**
- Validación de firma HMAC del webhook (MercadoPago Sandbox no la requiere; se deja para producción)
- Manejo de pagos en efectivo (Rapipago/Pago Fácil) en esta iteración — el flujo es el mismo endpoint, distinto `payment_method_id`
- Refunds / devoluciones
- Tokenización en el frontend (es CH-13)

## Decisions

### D-01: idempotency_key como UUID v4 generado en backend

Genera un UUID v4 nuevo por cada intento de pago. Si el cliente reintenta, el frontend debe llamar a `POST /pagos/crear` nuevamente y el backend genera un nuevo `idempotency_key`. La tabla `Pago` tiene `idempotency_key UNIQUE`, así que si MercadoPago ya procesó ese key, el SDK devuelve el pago existente en lugar de cobrar de nuevo. **Alternativa descartada:** reusar el `idempotency_key` del pedido — viola el principio de un key por intento.

### D-02: external_reference = str(pedido_id)

El campo `external_reference` enviado a MercadoPago identifica el pedido. Se usa `str(pedido_id)` (entero como string) para permitir lookup inverso desde el webhook. La columna ya tiene `UNIQUE`, lo que impide dos pagos aprobados para el mismo pedido. **Alternativa descartada:** UUID del pedido — complica el lookup en el webhook.

### D-03: Webhook procesa topic=payment únicamente

El endpoint `/pagos/webhook` recibe `?topic=payment&id=<mp_payment_id>`. Solo procesa `topic == "payment"`. Otros topics (`merchant_order`, etc.) retornan 200 sin acción. El service llama a `mp.payment().get(id)` para obtener el estado actual. **Alternativa descartada:** procesar el body del IPN directamente — MercadoPago recomienda consultar la API para obtener el estado real.

### D-04: Avance de pedido dentro del webhook via PedidoService

El `PagoService.procesar_webhook` inyecta el `UoW` y llama a `pedido_service.avanzar_estado(pedido_id, "CONFIRMADO", uow)` si `mp_status == "approved"`. Esto reutiliza la FSM existente con toda su validación. **Alternativa descartada:** avanzar directo en el repository — saltea la FSM.

### D-05: forma_pago_id lookup por código en crear_pago

`CrearPagoRequest` recibe `forma_pago_codigo: str`. El service busca `FormaPago` por código en la sesión del UoW antes de crear el pago. Si no existe o está deshabilitada, lanza 422.

## Risks / Trade-offs

- **[Riesgo] Webhook recibe notificación antes de que `crear_pago` termine de commitear** → El webhook intenta buscar el pago por `external_reference` y no lo encuentra. Mitigación: el webhook retorna 200 igualmente (MercadoPago reintentará); al segundo intento el pago ya existe.
- **[Riesgo] MP_ACCESS_TOKEN vacío en `.env`** → El SDK lanzará error en runtime al llamar a MP. Mitigación: el service valida `settings.MP_ACCESS_TOKEN != ""` y lanza 503 si está vacío.
- **[Trade-off] Sin validación de firma del webhook** → Cualquiera que conozca la URL puede llamar al webhook. Aceptable en Sandbox; en producción agregar validación HMAC del header `x-signature`.

## Migration Plan

1. Agregar `mercadopago>=2.3.0` a `requirements.txt` y hacer `pip install`
2. Agregar `MP_NOTIFICATION_URL` a `.env.example` y `config.py`
3. Implementar schemas → repository → service → router en ese orden
4. Registrar `uow.pagos` en `core/uow.py`
5. Actualizar `PedidoDetail` en `pedidos/schemas.py`
6. No requiere nueva migración Alembic — tabla `pagos` ya existe desde CH-00
