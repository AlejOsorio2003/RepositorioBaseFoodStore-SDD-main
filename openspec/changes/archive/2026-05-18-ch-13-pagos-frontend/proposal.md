## Why

El backend de pagos (CH-12) está operativo pero el flujo de compra termina en `CheckoutPage` sin pasar por ningún formulario de pago — el pedido se crea pero nunca se cobra. CH-13 cierra este gap integrando `@mercadopago/sdk-react` para tokenizar la tarjeta en el frontend y llamar a `POST /api/v1/pagos/crear`.

## What Changes

- **Nueva `PaymentPage`** (`/payment/:pedidoId`): formulario de tarjeta vía `CardPayment` de `@mercadopago/sdk-react`, botón submit, estados approved/rejected/pending con feedback visual.
- **`CheckoutPage` actualizada**: tras crear el pedido, navega a `/payment/:pedidoId` en lugar de `/orders`.
- **Nueva entidad `pago`**: tipos `PagoResponse`, función `crearPago()` que llama `POST /api/v1/pagos/crear`.
- **`paymentStore` integrado**: `setPaymentStatus` llamado con el resultado del pago (approved, rejected, error).
- **`VITE_MP_PUBLIC_KEY`** agregada a `frontend/.env.example` — inicializa el `<Payment>` provider de MP.
- **Ruta `/payment/:pedidoId`** registrada en el router con protección de autenticación.

## Capabilities

### New Capabilities
- `pagos-frontend`: Formulario de pago con `@mercadopago/sdk-react`, entidad pago, integración con paymentStore, PaymentPage con estados visuales de resultado.

### Modified Capabilities
- `checkout-frontend`: Cambio de comportamiento post-checkout — navega a `/payment/:pedidoId` en lugar de `/orders` al crear pedido exitosamente.

## Impact

- **Frontend:**
  - `frontend/src/pages/PaymentPage.tsx` — nueva página
  - `frontend/src/entities/pago/` — nueva entidad
  - `frontend/src/pages/CheckoutPage.tsx` — `onSuccess` actualizado
  - `frontend/src/app/router.tsx` (o equivalente) — nueva ruta
  - `frontend/.env.example` — nueva variable `VITE_MP_PUBLIC_KEY`
- **Backend:** sin cambios (CH-12 ya expone todos los endpoints necesarios)
- **Dependencias:** `@mercadopago/sdk-react@^0.0.18` ya instalada — no requiere cambios en `package.json`
