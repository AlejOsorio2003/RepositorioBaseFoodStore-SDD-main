## Why

El flujo de pago actual solo admite tarjeta de crédito/débito vía el brick `CardPayment`. Agregar el pago con cuenta MercadoPago amplía las opciones del cliente sin modificar el módulo de pagos existente: reutiliza el mismo webhook IPN, el mismo `Pago` en BD y el mismo `paymentStore`.

## What Changes

- **Backend — nuevo endpoint `POST /pagos/preferencia`:** crea una Payment Preference en MercadoPago (ítems del pedido, monto, URLs de retorno) y un registro `Pago` pendiente en BD. Retorna el `preference_id` para que el frontend inicialice el brick Wallet.
- **Backend — `procesar_webhook` actualizado:** cuando llega el IPN con `mp_payment_id` de un pago Wallet, el handler ya existente busca el `Pago` por `mp_payment_id`. Requiere que el webhook incluya el `mp_payment_id` para poder correlacionarlo con el registro creado por preferencia. Se agrega correlación por `external_reference` como fallback.
- **Frontend — selector de método de pago:** `PaymentPage` muestra dos opciones antes de renderizar el formulario: "Tarjeta de crédito/débito" (flujo actual) y "Pagar con Mercado Pago" (flujo Wallet). La elección determina qué brick se renderiza.
- **Frontend — `WalletPaymentForm`:** nuevo componente que obtiene el `preference_id` via `POST /pagos/preferencia` y renderiza `<Wallet initialization={{ preferenceId }} />`. Las `back_urls` apuntan a `/payment/:pedidoId?resultado=aprobado|rechazado|pendiente`. Al montar, si hay query param `?resultado=`, `PaymentPage` muestra directamente el panel de resultado sin pasar por el formulario.

## Capabilities

### New Capabilities

- `pagos-mp-wallet`: selector de método de pago, `WalletPaymentForm`, endpoint de preferencia backend, correlación por `external_reference` en webhook.

### Modified Capabilities

- `pagos-backend`: nuevo endpoint `POST /pagos/preferencia` y nueva función `crear_preferencia` en service. El schema agrega `CrearPreferenciaRequest` y `PreferenciaResponse`.
- `pagos-frontend`: `PaymentPage` agrega el selector de método y el estado de resultado por redirect. La spec de `PaymentPage — formulario de tarjeta` se extiende con la rama Wallet.

## Impact

- **Backend:** `pagos/schemas.py` (+2 schemas), `pagos/service.py` (+función `crear_preferencia`), `pagos/router.py` (+endpoint `POST /preferencia`). Sin migraciones: el modelo `Pago` ya tiene todos los campos necesarios.
- **Frontend:** `pages/PaymentPage.tsx` (agrega selector + lógica de redirect), `features/pagos/ui/WalletPaymentForm.tsx` (nuevo), `entities/pago/api.ts` (+función `crearPreferencia`), `entities/pago/types.ts` (+tipos).
- **Variables de entorno:** `MP_FRONTEND_URL` (o equivalente) para construir las `back_urls` de la preference — se agrega a `.env.example` y `core/config.py`.
- **Sin cambios de BD:** el modelo `Pago` existente cubre todos los campos necesarios.
