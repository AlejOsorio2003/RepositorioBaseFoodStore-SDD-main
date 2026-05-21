## ADDED Requirements

### Requirement: Variable de entorno MP_FRONTEND_URL
El sistema SHALL incluir `MP_FRONTEND_URL: str = "http://localhost:5173"` en `Settings` (core/config.py) y en `.env.example`. Se usa para construir las `back_urls` absolutas de la Payment Preference.

#### Scenario: Valor default en desarrollo
- **WHEN** `MP_FRONTEND_URL` no está seteado en `.env`
- **THEN** el valor default `"http://localhost:5173"` permite que el desarrollo local funcione sin configuración extra

### Requirement: Schema CrearPreferenciaRequest y PreferenciaResponse
El módulo de pagos SHALL exponer dos nuevos schemas Pydantic en `pagos/schemas.py`:
- `CrearPreferenciaRequest(pedido_id: int)`
- `PreferenciaResponse(preference_id: str)`

#### Scenario: Serialización correcta
- **WHEN** el endpoint retorna `PreferenciaResponse`
- **THEN** la respuesta JSON tiene exactamente el campo `preference_id: string`

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

### Requirement: Endpoint POST /pagos/preferencia
El módulo SHALL exponer `POST /api/v1/pagos/preferencia` con `response_model=PreferenciaResponse`, protegido con `require_role(["CLIENT"])`.

#### Scenario: Respuesta exitosa
- **WHEN** CLIENT autenticado hace `POST /pagos/preferencia` con `{ "pedido_id": 1 }`
- **THEN** retorna 201 con `{ "preference_id": "..." }`

#### Scenario: Usuario no autenticado
- **WHEN** request sin JWT válido
- **THEN** retorna 401
