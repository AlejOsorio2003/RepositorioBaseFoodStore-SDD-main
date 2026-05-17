## Context

CH-10 entregó el backend de pedidos completo. El frontend tiene el catálogo funcional (CH-06) y los stores scaffoldeados pero incompletos. Las tres páginas destino (CartPage, CheckoutPage, OrdersPage) son placeholders. El `cart.store.ts` tiene operaciones básicas pero le faltan los computed values (`subtotal`, `costoEnvio`, `total`, `itemCount`). `payment.store.ts` tiene tipos demasiado genéricos. `ProductoDetailModal` no conecta con el carrito.

## Goals / Non-Goals

**Goals:**
- Flujo de compra end-to-end: catálogo → carrito → checkout → confirmación
- OrdersPage con lista de pedidos propios y historial de estados con polling 30s
- Stores completados según spec del Integrador (subtotal, total, itemCount, status tipado)
- Conexión real al backend: `POST /api/v1/pedidos`, `GET /api/v1/pedidos`, `GET /api/v1/pedidos/{id}/historial`

**Non-Goals:**
- Integración con MercadoPago (es CH-13)
- Cambio de estado por parte del gestor (es CH-14/CH-15)
- Formulario de direcciones dentro del checkout (puede usar dirección existente o retiro en local)
- Notificaciones push / WebSockets (se resuelve con polling 30s)

## Decisions

### D-01: cartStore como fuente de verdad del carrito (no TanStack Query)
El carrito es estado del **cliente** (no es una entidad del servidor hasta que se confirma el checkout). Por lo tanto vive en Zustand con `persist`, no en TanStack Query. TanStack Query solo entra cuando se hace el `POST /pedidos`.

**Alternativa descartada:** Sincronizar el carrito con el servidor en tiempo real — agrega latencia innecesaria y complejidad antes de que el usuario confirme.

### D-02: Checkout sin MercadoPago en CH-11
El `POST /api/v1/pedidos` no requiere `forma_pago_codigo` (el backend implementado no lo tiene). El flujo en CH-11 es: confirmar pedido → HTTP 201 → redirigir a OrdersPage. El pago se integra en CH-13.

**Alternativa descartada:** Bloquear CH-11 hasta tener CH-13 — alarga el camino crítico innecesariamente.

### D-03: Polling de 30s con `refetchInterval` de TanStack Query
Para mostrar actualizaciones de estado en OrdersPage usamos `useQuery({ refetchInterval: 30_000 })` en el hook del detalle de pedido. Esto es simple, robusto y no requiere WebSockets.

**Alternativa descartada:** SSE o WebSockets — overhead de infraestructura desproporcionado para el alcance del proyecto.

### D-04: FSD estricto — cartStore en `shared/store`, features en `features/`
- `shared/store/cart.store.ts` — store Zustand (shared porque múltiples features lo usan)
- `features/carrito/` — CartDrawer, hook useCart
- `features/pedidos/` — PedidosList, PedidoCard, PedidoDetailPanel, HistorialTimeline
- `entities/pedido/` — tipos TypeScript + funciones API (capa de datos pura)

### D-05: CartDrawer como overlay lateral, CartPage como vista full
Ambos coexisten: el CartDrawer (triggered desde header) da acceso rápido al carrito; la CartPage es la vista completa antes de ir al checkout. Comparten el mismo `useCartStore`.

## Risks / Trade-offs

- [Riesgo] El polling de 30s genera una llamada HTTP por usuario activo cada 30s → **Mitigación:** solo activo cuando el usuario está en OrdersPage o en el panel de detalle; `enabled: !!pedidoId`
- [Riesgo] El carrito persiste en localStorage — si el backend cambia precios, el snapshot del store queda desactualizado → **Mitigación:** al iniciar checkout, re-validar productos via `GET /api/v1/productos/{id}` antes de confirmar (o aceptar el mismatch y dejar que el backend tome el snapshot en el momento del POST)
- [Trade-off] Sin MercadoPago en CH-11, el flujo de pago queda incompleto — el usuario puede crear el pedido pero no pagarlo hasta CH-13. Aceptado: el objetivo de CH-11 es el flujo de pedido, no el de pago.
