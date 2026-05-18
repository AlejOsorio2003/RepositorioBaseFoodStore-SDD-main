## Context

El SDK `@mercadopago/sdk-react@^0.0.18` ya está instalado en el frontend. El `paymentStore` (Zustand) ya tiene el tipo `PaymentStatus` y las acciones `setPaymentStatus` / `reset`. El `CheckoutPage` actual crea el pedido y navega a `/orders` directamente, saltando el paso de pago.

El backend expone `POST /api/v1/pagos/crear` que recibe `{ pedido_id, token, forma_pago_codigo }`. El `token` es generado por el SDK de MP (PCI-compliant — el número de tarjeta nunca llega al backend del proyecto).

## Goals / Non-Goals

**Goals:**
- Tokenizar la tarjeta usando `CardPayment` de `@mercadopago/sdk-react` — nunca manejar datos de tarjeta raw
- Llamar a `POST /api/v1/pagos/crear` con el token obtenido y reflejar el resultado (approved/rejected/pending) visualmente
- Actualizar el `paymentStore` con el estado del pago
- Modificar `CheckoutPage` para redirigir a `/payment/:pedidoId` tras crear el pedido

**Non-Goals:**
- Pagos en efectivo (Rapipago / Pago Fácil) — requieren flujo diferente, se postulan para CH-14+
- Reintentos automáticos de pago rechazado — el usuario puede volver a intentarlo manualmente
- Guardado de tarjetas — fuera de scope de esta versión

## Decisions

### 1. `CardPayment` brick de `@mercadopago/sdk-react` (vs formulario custom)

El brick `CardPayment` de MP maneja internamente la validación, el campo CVV seguro y la tokenización. Un formulario custom requeriría gestionar el ciclo de vida del `cardTokenId` manualmente, además de cumplir PCI DSS nivel más alto. Se usa el brick.

**Alternativa descartada:** formulario propio con `mercadopago.createCardToken()` — más control pero mayor complejidad de compliance.

### 2. Flujo: CheckoutPage crea pedido → navega a PaymentPage (vs todo en una pantalla)

Separar la creación de pedido del pago permite que el pedido quede registrado en estado PENDIENTE antes de intentar el cobro. Si el pago falla, el pedido existe y el usuario puede reintentar. Una pantalla única crearía ambigüedad si el pedido se crea pero el token falla.

### 3. `forma_pago_codigo` extraído del callback del brick

El brick `CardPayment` llama a `onSubmit` con `{ token, payment_method_id, ... }`. Se usa `payment_method_id` directamente como `forma_pago_codigo`, ya que MP lo provee en el mismo callback (visa, master, amex, etc.). No se necesita un selector separado.

### 4. `PaymentPage` como página independiente (no modal/drawer)

La tokenización requiere que el componente del brick esté montado con su `publicKey`. Usar una página dedicada garantiza ciclo de vida limpio y URL propia (`/payment/:pedidoId`) para deep linking y navegación con botón atrás.

## Risks / Trade-offs

- **[Risk] Entorno sandbox sin `VITE_MP_PUBLIC_KEY`** → El brick no renderiza y lanza error de inicialización. Mitigación: mostrar mensaje de error claro si la variable está vacía; agregar a `.env.example`.
- **[Risk] Pedido creado pero pago rechazado** → El pedido queda en PENDIENTE indefinidamente. Mitigación: el usuario puede reintentar desde `PaymentPage` o cancelar desde `OrdersPage` (funcionalidad ya existente de CH-11).
- **[Risk] El brick `CardPayment` puede cambiar de API** → `@mercadopago/sdk-react@0.0.18` es pre-1.0, la API no está estabilizada. Mitigación: encapsular el brick en `features/pagos/ui/CardPaymentForm.tsx` para aislar cambios.
- **[Trade-off] `paymentStore` no persiste** → Si el usuario recarga `/payment/:pedidoId`, `paymentStore.status` vuelve a `idle`. Esto es aceptable — el estado real está en el backend.

## Migration Plan

1. Agregar `VITE_MP_PUBLIC_KEY` a `.env.example` y al `.env` local para sandbox
2. Crear entidad `pago`, `PaymentPage`, feature `pagos`
3. Registrar ruta `/payment/:pedidoId` en el router
4. Actualizar `CheckoutPage.onSuccess` para navegar a `/payment/:pedidoId`
5. No hay rollback necesario — `CheckoutPage` anterior sigue funcionando si se revierte el `onSuccess`
