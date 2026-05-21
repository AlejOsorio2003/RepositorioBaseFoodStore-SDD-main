## ADDED Requirements

### Requirement: Selector de método de pago en PaymentPage
`PaymentPage` SHALL mostrar un selector de método antes de renderizar cualquier brick de pago. Las opciones son "Tarjeta de crédito/débito" y "Pagar con Mercado Pago". Solo cuando el usuario elige una opción se renderiza el brick correspondiente.

#### Scenario: Pantalla inicial muestra el selector
- **WHEN** el usuario navega a `/payment/:pedidoId` en estado idle
- **THEN** se muestran dos botones de selección: "Tarjeta de crédito/débito" y "Pagar con Mercado Pago"; ningún brick está visible todavía

#### Scenario: Elegir tarjeta muestra CardPaymentForm
- **WHEN** el usuario hace click en "Tarjeta de crédito/débito"
- **THEN** se renderiza `CardPaymentForm` (flujo existente CH-13) y el selector desaparece

#### Scenario: Elegir Cuenta MP muestra WalletPaymentForm
- **WHEN** el usuario hace click en "Pagar con Mercado Pago"
- **THEN** se renderiza `WalletPaymentForm` con spinner mientras carga el `preference_id`, y luego el brick `Wallet`

### Requirement: WalletPaymentForm — brick Wallet con preference_id del backend
El sistema SHALL renderizar el brick `<Wallet />` de `@mercadopago/sdk-react` inicializado con un `preference_id` obtenido via `POST /api/v1/pagos/preferencia`. El brick maneja el flujo de pago con cuenta MercadoPago y redirige al usuario a las `back_urls` configuradas en la preferencia.

#### Scenario: Carga exitosa del preference_id
- **WHEN** `WalletPaymentForm` monta y `POST /api/v1/pagos/preferencia` retorna exitosamente
- **THEN** se renderiza `<Wallet initialization={{ preferenceId }} />` sin errores

#### Scenario: Error al crear la preferencia
- **WHEN** `POST /api/v1/pagos/preferencia` falla con 4xx/5xx
- **THEN** se muestra mensaje "No se pudo iniciar el pago. Intentá de nuevo." con botón "Volver"

#### Scenario: Mock mode — botón simulado
- **WHEN** el brick está en mock mode (`VITE_MP_PUBLIC_KEY` vacía o `MP_MOCK_MODE` activo en backend)
- **THEN** en lugar del brick se muestra un botón "Simular pago con MP" que navega a `?resultado=aprobado`

### Requirement: PaymentPage procesa resultado de redirect de MP
`PaymentPage` SHALL leer el query param `?resultado=` al montar y mostrar directamente el panel de resultado, sin pasar por el selector ni el brick.

#### Scenario: Redirect con resultado aprobado
- **WHEN** `PaymentPage` monta con `?resultado=aprobado` en la URL
- **THEN** se muestra directamente el panel de éxito "¡Tu pago fue aprobado!" con botón "Ver mi pedido"

#### Scenario: Redirect con resultado rechazado
- **WHEN** `PaymentPage` monta con `?resultado=rechazado`
- **THEN** se muestra el panel de rechazo con opción de intentar nuevamente (vuelve al selector)

#### Scenario: Redirect con resultado pendiente
- **WHEN** `PaymentPage` monta con `?resultado=pendiente`
- **THEN** se muestra un panel informativo "Tu pago está siendo procesado" con botón "Ver mi pedido"

### Requirement: Función crearPreferencia en entities/pago
El frontend SHALL exponer `crearPreferencia(pedidoId: number): Promise<PreferenciaResponse>` desde `entities/pago/api.ts` que llama a `POST /api/v1/pagos/preferencia` con autenticación JWT.

#### Scenario: Retorna preference_id
- **WHEN** `crearPreferencia(pedidoId)` se llama con un pedidoId válido
- **THEN** retorna `{ preference_id: string }`

#### Scenario: Error de autenticación
- **WHEN** el token JWT expiró
- **THEN** el interceptor de Axios maneja el 401 y redirige a login (comportamiento existente)
