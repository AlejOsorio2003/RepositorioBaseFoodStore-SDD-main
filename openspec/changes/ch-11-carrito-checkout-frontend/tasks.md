## 1. Stores — completar cart, payment y ui

- [ ] 1.1 Agregar `subtotal(): number` a `cart.store.ts` — suma de `precioUnitario * cantidad` por item
- [ ] 1.2 Agregar `costoEnvio(): number` a `cart.store.ts` — $50 si hay items, $0 si vacío
- [ ] 1.3 Agregar `total(): number` a `cart.store.ts` — `subtotal() + costoEnvio()`
- [ ] 1.4 Agregar `itemCount(): number` a `cart.store.ts` — suma de todas las `cantidad`
- [ ] 1.5 Reescribir `payment.store.ts` — tipar `status` como `'idle' | 'processing' | 'approved' | 'rejected' | 'error'`, agregar `mpPaymentId: string | null`, `statusDetail: string | null`, actualizar `setPaymentStatus` y `reset`
- [ ] 1.6 Agregar `cartOpen: boolean`, `openCart()`, `closeCart()` a `ui.store.ts`

## 2. Entity pedido

- [ ] 2.1 Crear `frontend/src/entities/pedido/types.ts` con interfaces: `ItemPedidoRequest`, `CrearPedidoRequest`, `DetallePedidoRead`, `HistorialRead`, `PedidoRead`, `PedidoDetail`, `PaginatedPedidos`
- [ ] 2.2 Crear `frontend/src/entities/pedido/api.ts` con funciones: `crearPedido(data: CrearPedidoRequest)`, `listarPedidos(params?)`, `getPedido(id: number)`, `getHistorial(id: number)`, `cancelarPedido(id: number)`
- [ ] 2.3 Crear `frontend/src/entities/pedido/index.ts` que re-exporta types y api
- [ ] 2.4 Agregar `export * from './pedido'` en `frontend/src/entities/index.ts`

## 3. Feature carrito — CartDrawer y hooks

- [ ] 3.1 Crear directorio `frontend/src/features/carrito/`
- [ ] 3.2 Crear `features/carrito/hooks/useCart.ts` — wrapper sobre `useCartStore` que expone items, subtotal, costoEnvio, total, itemCount, addItem, removeItem, updateQuantity, clearCart
- [ ] 3.3 Crear `features/carrito/ui/CartDrawer.tsx` — panel lateral con lista de items, botones "Ver carrito" y "Ir al checkout", mensaje si está vacío; se controla con `useUiStore().cartOpen`
- [ ] 3.4 Crear `features/carrito/index.ts` barril

## 4. Feature pedidos — lista, detalle e historial

- [ ] 4.1 Crear directorio `frontend/src/features/pedidos/`
- [ ] 4.2 Crear `features/pedidos/hooks/usePedidos.ts` — `useQuery` sobre `listarPedidos()` con `refetchInterval: 30_000`
- [ ] 4.3 Crear `features/pedidos/hooks/usePedidoDetail.ts` — `useQuery` sobre `getPedido(id)` y `getHistorial(id)` con `refetchInterval: 30_000`; `enabled: !!id`
- [ ] 4.4 Crear `features/pedidos/hooks/useCancelarPedido.ts` — `useMutation` sobre `cancelarPedido(id)` con `onSuccess: invalidateQueries(['pedidos'])`
- [ ] 4.5 Crear `features/pedidos/ui/PedidoCard.tsx` — card con id, estado (badge de color), total y fecha
- [ ] 4.6 Crear `features/pedidos/ui/PedidoDetailPanel.tsx` — panel con items del pedido, subtotal, costo envío, total, notas y sección de historial
- [ ] 4.7 Crear `features/pedidos/ui/HistorialTimeline.tsx` — lista vertical con cada entrada del historial: estado, fecha/hora formateada y notas (si tiene)
- [ ] 4.8 Crear `features/pedidos/index.ts` barril

## 5. CartPage

- [ ] 5.1 Implementar `frontend/src/pages/CartPage.tsx` — lista de items del carrito con control de cantidad (+ / -) y botón eliminar por item
- [ ] 5.2 Agregar panel de totales: subtotal, costo de envío y total usando `useCart()`
- [ ] 5.3 Agregar botón "Ir al Checkout" — deshabilitado si el carrito está vacío; redirige a `/login?redirect=/checkout` si no hay sesión
- [ ] 5.4 Mostrar mensaje "Tu carrito está vacío" con enlace al catálogo cuando no hay items

## 6. CheckoutPage

- [ ] 6.1 Implementar `frontend/src/pages/CheckoutPage.tsx` — ruta protegida (redirige a `/login` si no autenticado)
- [ ] 6.2 Mostrar resumen del pedido: lista de items, subtotal, costo de envío, total (desde `useCart()`)
- [ ] 6.3 Crear `useMutation` para `crearPedido` — en `onSuccess`: limpiar carrito (`clearCart()`), redirigir a `/orders`; en `onError`: mostrar mensaje de error sin limpiar carrito
- [ ] 6.4 Agregar botón "Confirmar pedido" — deshabilitado mientras `isPending`; muestra spinner durante envío
- [ ] 6.5 Mostrar mensaje de error específico si el backend responde `PRODUCTO_NO_DISPONIBLE`

## 7. OrdersPage

- [ ] 7.1 Implementar `frontend/src/pages/OrdersPage.tsx` — ruta protegida
- [ ] 7.2 Integrar `usePedidos()` para listar pedidos con polling 30s; mostrar skeleton durante `isLoading`
- [ ] 7.3 Mostrar lista de `PedidoCard` — al hacer click en una card mostrar `PedidoDetailPanel` (panel lateral o sección expandible)
- [ ] 7.4 En `PedidoDetailPanel` integrar `usePedidoDetail(id)` con polling 30s
- [ ] 7.5 Mostrar `HistorialTimeline` dentro del panel de detalle
- [ ] 7.6 Mostrar botón "Cancelar pedido" solo si `estado_nombre` es `PENDIENTE` o `CONFIRMADO`; al confirmar ejecutar `useCancelarPedido`
- [ ] 7.7 Mostrar mensaje "No tenés pedidos aún" con enlace al catálogo si la lista está vacía

## 8. Integrar CartDrawer en el Header

- [ ] 8.1 En el componente `Header` (o equivalente), agregar ícono de carrito con badge que muestra `itemCount()` usando `useCartStore`
- [ ] 8.2 Conectar click del ícono con `useUiStore().openCart()`
- [ ] 8.3 Montar `<CartDrawer />` en el árbol de componentes global (en `App.tsx` o en el layout principal)

## 9. ProductoDetailModal — botón Agregar al carrito

- [ ] 9.1 En `frontend/src/features/producto-detail/ui/ProductoDetailModal.tsx`, agregar botón "Agregar al carrito"
- [ ] 9.2 El botón llama `useCartStore().addItem({ productoId, nombre, precioUnitario: precio_base, imagenUrl: imagen_url })`
- [ ] 9.3 Deshabilitar el botón si `producto.disponible === false`
- [ ] 9.4 Al agregar exitosamente: mostrar feedback visual (cambio de texto a "¡Agregado!" por 1.5s o toast) y cerrar el modal

## 10. Verificación

- [ ] 10.1 Abrir el catálogo, hacer click en un producto y agregarlo al carrito → badge del header se actualiza
- [ ] 10.2 Abrir CartPage → se ven los items, totales correctos, botón "Ir al Checkout" habilitado
- [ ] 10.3 Ir al Checkout → confirmar pedido → carrito se limpia → redirige a OrdersPage
- [ ] 10.4 En OrdersPage → aparece el pedido recién creado con estado PENDIENTE
- [ ] 10.5 Hacer click en el pedido → se muestra el detalle con items y HistorialTimeline
- [ ] 10.6 Cancelar el pedido desde el detalle → estado cambia a CANCELADO en la UI
- [ ] 10.7 Intentar ir a `/checkout` sin login → redirige a `/login`
- [ ] 10.8 CartDrawer se abre desde el header y muestra los items del carrito
