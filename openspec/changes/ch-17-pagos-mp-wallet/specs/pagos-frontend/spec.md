## MODIFIED Requirements

### Requirement: PaymentPage — formulario de tarjeta
El sistema SHALL exponer la ruta `/payment/:pedidoId` con una página protegida (`PaymentPage`) que, en estado idle sin query params de resultado, renderiza primero un **selector de método de pago** ("Tarjeta" o "Cuenta MP"). Solo al elegir "Tarjeta" se renderiza `CardPaymentForm`. Al elegir "Cuenta MP" se renderiza `WalletPaymentForm`. Si la URL incluye `?resultado=<valor>`, se muestra directamente el panel de resultado correspondiente.

#### Scenario: Usuario no autenticado accede a /payment
- **WHEN** un usuario no autenticado navega a `/payment/1`
- **THEN** es redirigido a `/login`

#### Scenario: Estado idle muestra el selector de método
- **WHEN** el usuario llega a `/payment/:pedidoId` sin query param `?resultado`
- **THEN** se muestra el selector con dos opciones: "Tarjeta de crédito/débito" y "Pagar con Mercado Pago"

#### Scenario: Pago aprobado con tarjeta
- **WHEN** el usuario elige tarjeta, completa el brick y el resultado es `approved`
- **THEN** se muestra el panel "¡Tu pago fue aprobado!" con botón "Ver mi pedido"

#### Scenario: Pago rechazado con tarjeta
- **WHEN** el usuario elige tarjeta y el resultado es `rejected`
- **THEN** se muestra panel de rechazo con opción "Intentar de nuevo" (vuelve al selector)

#### Scenario: Resultado aprobado por redirect de MP
- **WHEN** `PaymentPage` monta con `?resultado=aprobado`
- **THEN** se muestra directamente el panel de éxito, sin selector

#### Scenario: Resultado rechazado por redirect de MP
- **WHEN** `PaymentPage` monta con `?resultado=rechazado`
- **THEN** se muestra el panel de rechazo, sin selector

#### Scenario: Error de servidor (503 MP no configurado)
- **WHEN** el backend retorna 503
- **THEN** `paymentStore.status = "error"` y se muestra "El sistema de pagos no está disponible"

#### Scenario: Estado aprobado — botón ver pedido
- **WHEN** el pago fue aprobado y el usuario hace clic en "Ver mi pedido"
- **THEN** navega a `/orders`

#### Scenario: `VITE_MP_PUBLIC_KEY` vacía
- **WHEN** la variable de entorno `VITE_MP_PUBLIC_KEY` es cadena vacía
- **THEN** `CardPaymentForm` muestra "Pagos no disponibles en este entorno"
