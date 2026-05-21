## Context

El módulo de pagos usa `mercadopago.SDK` ya instanciado en `service.py`. El flujo actual es: card token (generado por el brick en el frontend) → `sdk.payment().create(...)` → respuesta inmediata con `mp_status`. Para el Wallet brick el flujo es distinto: el backend genera una **Payment Preference** primero, el frontend la pasa al brick, el usuario paga en MP, y el resultado llega por redirect URL + IPN webhook.

`settings` ya tiene `MP_ACCESS_TOKEN`, `MP_MOCK_MODE` y `MP_NOTIFICATION_URL`. Falta `MP_FRONTEND_URL` para construir las `back_urls` de la preference (MP necesita URLs absolutas).

El modelo `Pago` existente tiene `mp_payment_id`, `mp_status`, `external_reference` e `idempotency_key`. El flujo Wallet requiere crear el `Pago` con `mp_status="pending"` al generar la preferencia, y actualizarlo cuando llega el IPN.

## Goals / Non-Goals

**Goals:**
- Selector UI en `PaymentPage`: el usuario elige antes de renderizar cualquier brick
- Flujo Wallet completo: preference → brick → redirect → panel de resultado
- El webhook IPN existente actualiza correctamente pagos Wallet (correlación por `external_reference`)
- Mock mode: cuando `MP_MOCK_MODE=true`, `crear_preferencia` devuelve un `preference_id` falso y el pago se simula como aprobado

**Non-Goals:**
- Soporte multi-método simultáneo (ej: mostrar ambos bricks a la vez)
- Cuotas o planes de pago en el Wallet brick
- Notificaciones en tiempo real post-pago (el usuario recarga `/orders` manualmente)

## Decisions

### D-1: Crear registro `Pago` pendiente al generar la preferencia
**Decisión:** `crear_preferencia()` inserta `Pago(mp_status="pending", external_reference=str(pedido_id))` antes de llamar a `sdk.preference().create()`. Esto asegura que el webhook IPN pueda encontrar el registro por `external_reference` cuando el `mp_payment_id` aún no se conoce.

**Alternativa descartada:** crear el `Pago` recién cuando llega el IPN. Requiere lógica de "insert-or-update" en `procesar_webhook`, más compleja y propensa a race conditions.

### D-2: `back_urls` apuntan a `/payment/:pedidoId?resultado=<status>`
**Decisión:** `MP_FRONTEND_URL` + `/payment/{pedido_id}?resultado=aprobado|rechazado|pendiente`. `PaymentPage` lee el query param `?resultado=` al montar y salta directo al panel de resultado correspondiente (sin mostrar el selector de método).

**Alternativa descartada:** URLs de retorno a una ruta nueva `/payment/result`. Agrega una ruta extra sin beneficio; reutilizar `PaymentPage` es más simple.

### D-3: `MP_FRONTEND_URL` como nueva variable de entorno
**Decisión:** agregar `MP_FRONTEND_URL: str = "http://localhost:5173"` a `Settings`. Valor default funciona en desarrollo. Para producción el deploy lo sobreescribe.

**Alternativa descartada:** hardcodear el host en `back_urls`. No es portable entre entornos.

### D-4: Selector de método como estado local en PaymentPage
**Decisión:** `const [method, setMethod] = useState<'card' | 'wallet' | null>(null)`. No se guarda en `paymentStore` — es solo UI transitoria. El store sigue guardando el resultado final.

### D-5: `WalletPaymentForm` — fetch de preference_id al montar
**Decisión:** el componente `WalletPaymentForm` llama a `crearPreferencia(pedidoId)` en un `useEffect` al montar (o con `useQuery` de TanStack Query). Muestra spinner mientras carga, el brick aparece solo cuando el `preference_id` está disponible.

## Risks / Trade-offs

- **Doble registro de pago:** si el usuario visita `PaymentPage` con Wallet, va al selector, genera una preferencia (→ crea un `Pago` pendiente), cambia de opinión y elige tarjeta → queda un `Pago` pendiente huérfano. Mitigación v1: aceptar estos huérfanos (no afectan integridad); el `Pago` aprobado de tarjeta sobreescribe el estado del pedido correctamente. Si es un problema, se pueden limpiar con un job de expiración en v2.
- **Redirect de MP puede llegar antes que el IPN:** el usuario ve el panel de "aprobado" pero el pedido aún no está `CONFIRMADO`. Mitigación: en el panel de resultado approved, mostrar un spinner/polling breve antes de navegar a `/orders`.
- **`MP_MOCK_MODE` con Wallet:** cuando `MP_MOCK_MODE=true`, retornar `{ preference_id: "mock-pref-id" }` y marcar el `Pago` como `approved` inmediatamente. El brick no se renderiza en mock mode — se muestra un botón fake "Simular pago con MP" que setea `?resultado=aprobado` en la URL.

## Migration Plan

Sin migraciones de BD. Cambios aditivos:
1. Backend: agregar `MP_FRONTEND_URL` a `config.py` + `.env.example`
2. Backend: agregar schemas, función service, endpoint router
3. Frontend: actualizar `entities/pago`, crear `WalletPaymentForm`, actualizar `PaymentPage`
4. No hay datos existentes que migrar.
