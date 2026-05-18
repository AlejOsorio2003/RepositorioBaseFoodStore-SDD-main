## 1. Configuración de entorno

- [ ] 1.1 Agregar `VITE_MP_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` a `frontend/.env.example`

## 2. Entidad pago

- [ ] 2.1 Crear `frontend/src/entities/pago/types.ts` con interfaz `PagoResponse` (`id`, `pedido_id`, `mp_payment_id`, `mp_status`, `mp_status_detail`, `external_reference`, `monto`, `created_at`) e interfaz `CrearPagoRequest` (`pedido_id`, `token`, `forma_pago_codigo`)
- [ ] 2.2 Crear `frontend/src/entities/pago/api.ts` con función `crearPago(data: CrearPagoRequest): Promise<PagoResponse>` que llama `POST /api/v1/pagos/crear` con `axiosInstance`
- [ ] 2.3 Crear `frontend/src/entities/pago/index.ts` que reexporta tipos y `crearPago`
- [ ] 2.4 Agregar `export * from './pago'` en `frontend/src/entities/index.ts`

## 3. Feature pagos — CardPaymentForm

- [ ] 3.1 Crear `frontend/src/features/pagos/ui/CardPaymentForm.tsx` que:
  - Inicializa `<Payment>` de `@mercadopago/sdk-react` con `initialization={{ publicKey: import.meta.env.VITE_MP_PUBLIC_KEY }}`
  - Si `VITE_MP_PUBLIC_KEY` está vacía, muestra mensaje "Pagos no disponibles en este entorno"
  - Recibe prop `onSubmit: (token: string, paymentMethodId: string) => void`
  - En el callback `onSubmit` del brick extrae `formData.token` y `formData.payment_method_id` y llama al prop
- [ ] 3.2 Crear `frontend/src/features/pagos/index.ts` que reexporta `CardPaymentForm`

## 4. PaymentPage

- [ ] 4.1 Crear `frontend/src/pages/PaymentPage.tsx` que:
  - Extrae `pedidoId` de `useParams()`
  - Redirige a `/login` si usuario no autenticado (igual que `CheckoutPage`)
  - Llama a `usePaymentStore()` y ejecuta `reset()` en `useEffect` al montar
  - Renderiza `<CardPaymentForm>` cuando `paymentStore.status === "idle"` o `"processing"`
  - En `onSubmit` del form: llama `setPaymentStatus("processing")`, luego `crearPago({ pedido_id: Number(pedidoId), token, forma_pago_codigo: paymentMethodId })`, y según `mp_status` llama `setPaymentStatus("approved" | "rejected", mp_payment_id, mp_status_detail)`
  - Si `mp_status === "approved"`: muestra panel de éxito con mensaje "¡Tu pago fue aprobado!" y botón "Ver mi pedido" que navega a `/orders`
  - Si `mp_status === "rejected"`: muestra panel de error con `statusDetail` y botón "Intentar con otra tarjeta" que llama `reset()`
  - Si `status === "error"`: muestra "El sistema de pagos no está disponible en este momento"
  - Maneja error HTTP 503 con `paymentStatus("error")`

## 5. Router y CheckoutPage

- [ ] 5.1 Importar `PaymentPage` en `frontend/src/app/router.tsx` y agregar ruta `{ path: '/payment/:pedidoId', element: <PaymentPage /> }`
- [ ] 5.2 Actualizar `CheckoutPage.tsx`: en `onSuccess` del mutation cambiar `navigate('/orders')` por `navigate(\`/payment/\${data.id}\`)` (donde `data` es el `PedidoRead` retornado por `crearPedido`)

## 6. Verificación

- [ ] 6.1 Con `VITE_MP_PUBLIC_KEY` de sandbox configurada: completar CheckoutPage → navega a `/payment/:pedidoId` con el formulario MP renderizado
- [ ] 6.2 Ingresar tarjeta aprobada sandbox (`4509 9535 6623 3704`, vto futuro, CVV cualquiera) → muestra "¡Tu pago fue aprobado!" + botón "Ver mi pedido"
- [ ] 6.3 Ingresar tarjeta rechazada sandbox (`4000 0000 0000 0002`) → muestra panel de error con motivo
- [ ] 6.4 Hacer clic en "Intentar con otra tarjeta" → vuelve al formulario en estado idle
- [ ] 6.5 Sin `VITE_MP_PUBLIC_KEY`: muestra "Pagos no disponibles en este entorno" en lugar del brick
- [ ] 6.6 CH-12 task 10.1: `POST /api/v1/pagos/crear` con token sandbox aprobado → backend retorna 201 con `mp_status: "approved"`
- [ ] 6.7 CH-12 task 10.2: `POST /api/v1/pagos/crear` con token sandbox rechazado → backend retorna 201 con `mp_status: "rejected"`
- [ ] 6.8 CH-12 task 10.7: `POST /api/v1/pagos/crear` con `forma_pago_codigo` inexistente → backend retorna 422
