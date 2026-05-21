## 1. Backend — Config y Schemas

- [x] 1.1 En `core/config.py`: agregar `MP_FRONTEND_URL: str = "http://localhost:5173"` a la clase `Settings`
- [x] 1.2 En `.env.example`: agregar `MP_FRONTEND_URL=http://localhost:5173`
- [x] 1.3 En `pagos/schemas.py`: agregar `CrearPreferenciaRequest(pedido_id: int)` y `PreferenciaResponse(preference_id: str)`

## 2. Backend — Service

- [x] 2.1 En `pagos/service.py`: implementar `crear_preferencia(pedido_id, current_user, uow)` — verificar pedido + propiedad, crear `Pago(mp_status="pending")` en BD, llamar a `sdk.preference().create(...)` con ítems del pedido, `external_reference` y `back_urls` usando `MP_FRONTEND_URL`
- [x] 2.2 En `crear_preferencia`: agregar rama `MP_MOCK_MODE` que omite el SDK, setea `mp_status="approved"` e invoca `avanzar_estado` a `CONFIRMADO`

## 3. Backend — Router

- [x] 3.1 En `pagos/router.py`: agregar `POST /preferencia` con `response_model=PreferenciaResponse`, `status_code=201`, `require_role(["CLIENT"])`, delegando a `service.crear_preferencia`

## 4. Frontend — Entity pago

- [x] 4.1 En `entities/pago/types.ts`: agregar `PreferenciaResponse { preference_id: string }` y `CrearPreferenciaRequest { pedido_id: number }`
- [x] 4.2 En `entities/pago/api.ts`: agregar función `crearPreferencia(pedido_id: number): Promise<PreferenciaResponse>` que llama a `POST /api/v1/pagos/preferencia`
- [x] 4.3 Exportar los nuevos tipos y función desde el barrel `entities/pago/index.ts`

## 5. Frontend — WalletPaymentForm

- [x] 5.1 Crear `features/pagos/ui/WalletPaymentForm.tsx`: recibe `pedidoId: number`, llama a `crearPreferencia` al montar (con TanStack Query o useEffect), muestra spinner durante la carga
- [x] 5.2 En `WalletPaymentForm`: cuando `preference_id` está disponible, renderizar `<Wallet initialization={{ preferenceId }} />` de `@mercadopago/sdk-react`
- [x] 5.3 En `WalletPaymentForm`: manejar error de `crearPreferencia` mostrando mensaje con botón "Volver"
- [x] 5.4 En `WalletPaymentForm`: en mock mode (sin public key), mostrar botón "Simular pago con MP" que navega a `?resultado=aprobado`
- [x] 5.5 Exportar `WalletPaymentForm` desde `features/pagos/index.ts`

## 6. Frontend — PaymentPage

- [x] 6.1 En `PaymentPage.tsx`: agregar lectura de `?resultado=` al montar — si existe, saltar directamente al panel de resultado correspondiente (aprobado / rechazado / pendiente)
- [x] 6.2 En `PaymentPage.tsx`: agregar estado `method: 'card' | 'wallet' | null` (inicialmente `null`)
- [x] 6.3 En `PaymentPage.tsx`: cuando `method === null` y no hay `?resultado`, renderizar el selector de método con los dos botones
- [x] 6.4 En `PaymentPage.tsx`: cuando `method === 'wallet'`, renderizar `<WalletPaymentForm pedidoId={...} />`
- [x] 6.5 En `PaymentPage.tsx`: en el panel de rechazo, el botón "Intentar de nuevo" resetea `method` a `null` (vuelve al selector)
- [x] 6.6 En `PaymentPage.tsx`: agregar panel "pendiente" — "Tu pago está siendo procesado" + botón "Ver mi pedido" → `/orders`

## 7. Verificación

- [ ] 7.1 `GET /` anónimo → catálogo visible (regresión CH-16)
- [ ] 7.2 `POST /pagos/preferencia` con JWT CLIENT válido → 201 `{ preference_id: "..." }`
- [ ] 7.3 `POST /pagos/preferencia` sin JWT → 401
- [ ] 7.4 `POST /pagos/preferencia` con pedido de otro usuario → 403
- [ ] 7.5 En el browser: navegar a `/payment/:pedidoId` → ver selector de dos métodos
- [ ] 7.6 En el browser: elegir "Tarjeta" → brick `CardPayment` visible (flujo CH-13 sin regresión)
- [ ] 7.7 En el browser: elegir "Cuenta MP" → spinner → brick `Wallet` visible
- [ ] 7.8 En el browser: `/payment/:pedidoId?resultado=aprobado` → panel de éxito directo sin selector
