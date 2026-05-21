## Why

El frontend cliente actual tiene dos fricciones que dañan la experiencia de compra: exige login antes de ver el catálogo (barrera innecesaria en un e-commerce) y usa una sidebar de categorías que rompe el patrón visual esperado por el usuario. Además faltan accesos directos evidentes a "Mis Pedidos" y "Volver al catálogo" que el usuario necesita durante el flujo de compra.

## What Changes

- **Catálogo público (lazy auth):** la ruta `/` muestra `CatalogPage` sin requerir autenticación. El login se solicita solo cuando el usuario intenta avanzar con un pedido (carrito → checkout). Se elimina la redirección `/` → `/login`.
- **Reemplazo de sidebar por chips de categoría:** se elimina `CategorySidebar` del layout de `CatalogPage` y se reemplaza por una barra horizontal de chips/tabs filtrables, estilo e-commerce estándar.
- **Botón "Mis Pedidos" en header/nav:** acceso directo a `/orders` desde cualquier parte de la app. Solo visible cuando el usuario está autenticado.
- **Botón "Volver al catálogo":** link de regreso a `/` disponible en `OrdersPage`, `PaymentPage` y `CartPage`.

## Capabilities

### New Capabilities

- `ux-cliente-refactor`: navegación pública del catálogo, chips de categoría horizontales, accesos rápidos en header (Mis Pedidos, Volver al catálogo), flujo lazy-auth.

### Modified Capabilities

- `catalog-page`: la página deja de ser una ruta protegida; el layout elimina la sidebar lateral y adopta chips horizontales de categoría. Requiere ajuste en el guard de ruta.
- `categorias-frontend`: el componente de navegación por categorías cambia de árbol vertical (sidebar) a chips horizontales. La selección por query param `?categoria=` se mantiene.
- `checkout-frontend`: el guard de `CartPage` y `CheckoutPage` ahora redirige a `/login?redirect=...` (ya existente) solo en el momento de ir al checkout, no al entrar al catálogo.

## Impact

- **Frontend — rutas:** `router.tsx` — eliminar guard en ruta `/`; confirmar que `CartPage` y `CheckoutPage` siguen protegidas.
- **Frontend — layout:** `CatalogPage.tsx` — remover `CategorySidebar`, agregar `CategoryChips`; ajustar grid de productos (pasa de sidebar+content a full-width con chips arriba).
- **Frontend — componentes:** crear `features/categoria-nav/ui/CategoryChips.tsx`; deprecar `CategorySidebar.tsx`.
- **Frontend — header:** agregar enlace "Mis Pedidos" (condicional a `isAuthenticated`) y "Volver al catálogo" en páginas indicadas.
- **Sin cambios de backend:** todos los endpoints existentes siguen funcionando igual. El catálogo ya es público (`GET /productos` no requiere auth).
