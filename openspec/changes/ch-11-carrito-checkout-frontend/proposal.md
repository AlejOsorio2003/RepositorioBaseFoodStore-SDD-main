## Why

CH-10 completó el backend de pedidos con FSM de 6 estados y audit trail. CH-11 cierra el flujo de compra del lado del cliente: conecta el catálogo existente con el carrito, el checkout y el seguimiento de pedidos, completando la experiencia end-to-end para el rol CLIENT.

## What Changes

- **CartPage** — página completa con lista de items del carrito, control de cantidades, subtotal, costo de envío fijo ($50) y botón para ir al checkout
- **CheckoutPage** — resumen del pedido, selección de dirección opcional y botón confirmar que llama `POST /api/v1/pedidos`; muestra confirmación o error
- **OrdersPage** — lista de los pedidos del usuario autenticado con polling de 30 segundos para actualizar el estado en tiempo real; incluye panel de detalle con `HistorialTimeline`
- **cartStore** — completar los métodos faltantes: `subtotal()`, `costoEnvio()`, `total()`, `itemCount()`
- **paymentStore** — tipar `status` como union (`idle | processing | approved | rejected | error`), agregar `mpPaymentId` y `statusDetail`
- **uiStore** — agregar `cartOpen`, `openCart()`, `closeCart()` para drawer del carrito
- **ProductoDetailModal** — agregar botón "Agregar al carrito" que invoca `useCartStore().addItem()`
- **entities/pedido/** — crear tipos TypeScript (`PedidoRead`, `PedidoDetail`, `DetallePedidoRead`, `HistorialRead`, `PaginatedPedidos`) y funciones API para todos los endpoints de pedidos
- **features/carrito/** — `CartDrawer` (overlay lateral) y hook `useCart`
- **features/pedidos/** — `PedidosList`, `PedidoCard`, `PedidoDetailPanel`, `HistorialTimeline`

## Capabilities

### New Capabilities

- `carrito-checkout`: CartPage funcional, CheckoutPage con mutación POST /pedidos, CartDrawer y stores actualizados
- `pedidos-frontend`: OrdersPage con lista de pedidos propios, detalle con historial de estados y polling 30s

### Modified Capabilities

- `catalog-page`: `ProductoDetailModal` recibe botón "Agregar al carrito" — nuevo punto de entrada al flujo de compra
- `frontend-infra`: `cart.store.ts`, `payment.store.ts`, `ui.store.ts` reciben métodos y tipos requeridos por la spec

## Impact

- **Frontend:** `CartPage.tsx`, `CheckoutPage.tsx`, `OrdersPage.tsx`, `ProductoDetailModal.tsx` (modificado), stores en `shared/store/`, nueva entity `entities/pedido/`, nuevas features `features/carrito/` y `features/pedidos/`
- **API consumida:** `POST /api/v1/pedidos`, `GET /api/v1/pedidos`, `GET /api/v1/pedidos/{id}`, `GET /api/v1/pedidos/{id}/historial`, `DELETE /api/v1/pedidos/{id}`
- **Dependencias previas requeridas:** CH-06 (CatalogPage con productos), CH-09 (auth con roles), CH-10 (backend pedidos)
- **No modifica backend** — solo consume los endpoints ya implementados
- **Sin integración MercadoPago** en este change — la tokenización de pagos es CH-13
