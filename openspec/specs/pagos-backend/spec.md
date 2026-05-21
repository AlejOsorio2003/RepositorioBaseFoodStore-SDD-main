### Requirement: Crear pago
El sistema SHALL exponer `POST /api/v1/pagos/crear` que acepta `pedido_id`, `token` (card token de MercadoPago), y `forma_pago_codigo`. El backend genera un `idempotency_key` UUID v4 y un `external_reference = str(pedido_id)`, llama al SDK de MercadoPago y registra el resultado en la tabla `Pago`. Solo usuarios con rol CLIENT pueden crear pagos. Si `MP_ACCESS_TOKEN` está vacío retorna 503.

#### Scenario: Pago aprobado
- **WHEN** un CLIENT hace `POST /api/v1/pagos/crear` con un token de tarjeta válida sandbox (4509 9535 6623 3704)
- **THEN** el sistema retorna HTTP 201 con `PagoResponse` incluyendo `mp_status: "approved"` y `mp_payment_id` numérico

#### Scenario: Pago rechazado
- **WHEN** un CLIENT hace `POST /api/v1/pagos/crear` con tarjeta de rechazo sandbox (4000 0000 0000 0002)
- **THEN** el sistema retorna HTTP 201 con `PagoResponse` incluyendo `mp_status: "rejected"` y `mp_status_detail` con el motivo

#### Scenario: forma_pago_codigo inválida
- **WHEN** `forma_pago_codigo` no existe en la tabla `formas_pago` o tiene `habilitado=false`
- **THEN** el sistema retorna HTTP 422 con detalle descriptivo

#### Scenario: pedido_id inexistente
- **WHEN** `pedido_id` no existe o no pertenece al CLIENT autenticado
- **THEN** el sistema retorna HTTP 404

#### Scenario: MP_ACCESS_TOKEN vacío
- **WHEN** la variable de entorno `MP_ACCESS_TOKEN` está vacía
- **THEN** el sistema retorna HTTP 503 con detalle `MERCADOPAGO_NO_CONFIGURADO`

---

### Requirement: Webhook IPN
El sistema SHALL exponer `POST /api/v1/pagos/webhook` como endpoint público (sin autenticación). Acepta query params `topic` e `id`. Solo procesa `topic=payment`. Consulta el estado real del pago en MercadoPago vía SDK usando `id` como `mp_payment_id`. Si `mp_status == "approved"` avanza el pedido identificado por `external_reference` al estado CONFIRMADO. Siempre retorna HTTP 200 para evitar reintentos innecesarios de MercadoPago.

#### Scenario: Pago aprobado via webhook
- **WHEN** MercadoPago hace `POST /api/v1/pagos/webhook?topic=payment&id=<mp_payment_id>` y el pago tiene `status=approved`
- **THEN** el sistema actualiza `Pago.mp_status = "approved"` y avanza el pedido a CONFIRMADO, retornando HTTP 200 `{"status": "ok"}`

#### Scenario: Pago pendiente via webhook
- **WHEN** el webhook llega con `status=pending`
- **THEN** el sistema actualiza `Pago.mp_status = "pending"`, el pedido permanece en PENDIENTE, retorna HTTP 200

#### Scenario: Topic distinto a payment
- **WHEN** el webhook llega con `topic=merchant_order`
- **THEN** el sistema retorna HTTP 200 `{"status": "ignored"}` sin ninguna acción

#### Scenario: Pago no encontrado en BD
- **WHEN** el `mp_payment_id` del webhook no existe aún en la tabla `Pago`
- **THEN** el sistema retorna HTTP 200 `{"status": "not_found"}` sin lanzar excepción (MercadoPago reintentará)

---

### Requirement: Consultar pago por pedido
El sistema SHALL exponer `GET /api/v1/pagos/{pedido_id}` que retorna el `PagoResponse` asociado a un pedido. Solo el propietario del pedido o un ADMIN puede acceder.

#### Scenario: Pago encontrado
- **WHEN** un CLIENT hace `GET /api/v1/pagos/{pedido_id}` siendo propietario del pedido
- **THEN** retorna HTTP 200 con `PagoResponse` completo

#### Scenario: Sin pago registrado
- **WHEN** el pedido existe pero aún no tiene un pago asociado
- **THEN** retorna HTTP 404 con detalle `PAGO_NOT_FOUND`

#### Scenario: Acceso de otro usuario
- **WHEN** un CLIENT intenta consultar el pago de un pedido que no le pertenece
- **THEN** retorna HTTP 403

---

### Requirement: Variable de entorno MP_FRONTEND_URL
El sistema SHALL incluir `MP_FRONTEND_URL: str = "http://localhost:5173"` en `Settings` (core/config.py) y en `.env.example`. Se usa para construir las `back_urls` absolutas de la Payment Preference.

#### Scenario: Valor default en desarrollo
- **WHEN** `MP_FRONTEND_URL` no está seteado en `.env`
- **THEN** el valor default `"http://localhost:5173"` permite que el desarrollo local funcione sin configuración extra

---

### Requirement: Schema CrearPreferenciaRequest y PreferenciaResponse
El módulo de pagos SHALL exponer dos nuevos schemas Pydantic en `pagos/schemas.py`:
- `CrearPreferenciaRequest(pedido_id: int)`
- `PreferenciaResponse(preference_id: str)`

#### Scenario: Serialización correcta
- **WHEN** el endpoint retorna `PreferenciaResponse`
- **THEN** la respuesta JSON tiene exactamente el campo `preference_id: string`

---

### Requirement: Función crear_preferencia en pagos/service.py
El sistema SHALL implementar `crear_preferencia(pedido_id, current_user, uow)` que:
1. Verifica que el pedido existe y pertenece al usuario (misma lógica que `crear_pago`)
2. Crea un registro `Pago(mp_status="pending", external_reference=str(pedido_id))` en BD
3. Llama a `sdk.preference().create(...)` con ítems del pedido, `external_reference` y `back_urls` construidas desde `MP_FRONTEND_URL`
4. Retorna `PreferenciaResponse(preference_id=...)`

En `MP_MOCK_MODE`: omite la llamada al SDK y retorna `preference_id="mock-pref-id"`, marcando el `Pago` como `approved` e invocando `avanzar_estado` a `CONFIRMADO`.

#### Scenario: Preferencia creada exitosamente
- **WHEN** se llama con pedido válido y `MP_ACCESS_TOKEN` configurado
- **THEN** retorna `PreferenciaResponse` con el `preference_id` de MercadoPago y queda un `Pago(mp_status="pending")` en BD

#### Scenario: Pedido no encontrado
- **WHEN** el `pedido_id` no existe en BD
- **THEN** lanza HTTP 404 "Pedido no encontrado"

#### Scenario: Pedido de otro usuario
- **WHEN** el pedido existe pero pertenece a otro usuario
- **THEN** lanza HTTP 403

#### Scenario: Mock mode
- **WHEN** `MP_MOCK_MODE=true`
- **THEN** retorna `PreferenciaResponse(preference_id="mock-pref-id")` y el pedido avanza a `CONFIRMADO`

---

### Requirement: Endpoint POST /pagos/preferencia
El módulo SHALL exponer `POST /api/v1/pagos/preferencia` con `response_model=PreferenciaResponse`, protegido con `require_role(["CLIENT"])`.

#### Scenario: Respuesta exitosa
- **WHEN** CLIENT autenticado hace `POST /pagos/preferencia` con `{ "pedido_id": 1 }`
- **THEN** retorna 201 con `{ "preference_id": "..." }`

#### Scenario: Usuario no autenticado
- **WHEN** request sin JWT válido
- **THEN** retorna 401
