## MODIFIED Requirements

### Requirement: Confirmar y crear pedido
El sistema SHALL exponer `CheckoutPage` en `/checkout` como ruta protegida. Muestra el resumen del carrito (ítems, subtotal, costo de envío, total) y un botón "Confirmar pedido". Al confirmar, llama a `POST /api/v1/pedidos`. En caso de éxito, limpia el carrito y navega a `/payment/:pedidoId` para continuar con el pago. Solo usuarios autenticados con rol CLIENT pueden acceder.

#### Scenario: Confirmación exitosa
- **WHEN** el usuario hace clic en "Confirmar pedido" con items válidos en el carrito
- **THEN** se crea el pedido vía `POST /api/v1/pedidos`, se limpia el carrito y se navega a `/payment/:pedidoId`

#### Scenario: Producto no disponible
- **WHEN** uno de los ítems tiene `disponible=false` al momento de confirmar
- **THEN** el sistema muestra mensaje "Uno o más productos ya no están disponibles. Revisá tu carrito." y no limpia el carrito

#### Scenario: Carrito vacío
- **WHEN** el usuario llega a `/checkout` con el carrito vacío
- **THEN** el botón "Confirmar pedido" está deshabilitado

#### Scenario: Usuario no autenticado
- **WHEN** un usuario no autenticado intenta acceder a `/checkout`
- **THEN** es redirigido a `/login`
