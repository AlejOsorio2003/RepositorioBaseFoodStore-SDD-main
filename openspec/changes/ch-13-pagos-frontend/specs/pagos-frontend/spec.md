## ADDED Requirements

### Requirement: Entidad pago frontend
El frontend SHALL exponer desde `entities/pago/` los tipos `PagoResponse` y la función `crearPago(data: CrearPagoRequest): Promise<PagoResponse>` que llama a `POST /api/v1/pagos/crear` con autenticación JWT.

#### Scenario: Pago creado exitosamente
- **WHEN** `crearPago()` se llama con `pedido_id`, `token` y `forma_pago_codigo` válidos
- **THEN** retorna un objeto `PagoResponse` con `mp_status: "approved"` o `"rejected"` y el `mp_payment_id` numérico

#### Scenario: Error de red o servidor
- **WHEN** `crearPago()` falla por error HTTP (4xx / 5xx)
- **THEN** lanza el error para que el caller lo maneje, sin alterar el `paymentStore`

---

### Requirement: PaymentPage — formulario de tarjeta
El sistema SHALL exponer la ruta `/payment/:pedidoId` con una página protegida (`PaymentPage`) que renderiza el brick `CardPayment` de `@mercadopago/sdk-react`, inicializado con `VITE_MP_PUBLIC_KEY`. El formulario llama a `crearPago()` con el token devuelto por el brick y actualiza el `paymentStore` con el resultado.

#### Scenario: Usuario no autenticado accede a /payment
- **WHEN** un usuario no autenticado navega a `/payment/1`
- **THEN** es redirigido a `/login`

#### Scenario: Pago aprobado
- **WHEN** el usuario completa el formulario con tarjeta sandbox válida y confirma
- **THEN** el sistema llama a `POST /api/v1/pagos/crear`, actualiza `paymentStore.status = "approved"` y muestra el panel de éxito con mensaje "¡Tu pago fue aprobado!"

#### Scenario: Pago rechazado
- **WHEN** el usuario completa el formulario con tarjeta sandbox rechazada y confirma
- **THEN** el sistema llama a `POST /api/v1/pagos/crear`, actualiza `paymentStore.status = "rejected"` y muestra panel de error con `mp_status_detail` y opción "Intentar con otra tarjeta"

#### Scenario: Error de servidor (503 MP no configurado)
- **WHEN** el backend retorna 503 `MERCADOPAGO_NO_CONFIGURADO`
- **THEN** `paymentStore.status = "error"` y se muestra mensaje "El sistema de pagos no está disponible en este momento"

#### Scenario: Estado aprobado — botón ver pedido
- **WHEN** el pago fue aprobado y el usuario hace clic en "Ver mi pedido"
- **THEN** navega a `/orders`

#### Scenario: `VITE_MP_PUBLIC_KEY` vacía
- **WHEN** la variable de entorno `VITE_MP_PUBLIC_KEY` es cadena vacía o no está definida
- **THEN** en lugar del brick se muestra el mensaje "Pagos no disponibles en este entorno"

---

### Requirement: paymentStore resetea al montar PaymentPage
El sistema SHALL llamar a `paymentStore.reset()` al montar `PaymentPage` para limpiar cualquier estado de pago previo.

#### Scenario: Usuario navega a PaymentPage por segunda vez
- **WHEN** el usuario llega a `/payment/:pedidoId` habiendo realizado un pago anterior en la sesión
- **THEN** el formulario aparece en estado inicial (no muestra resultado del pago anterior)
