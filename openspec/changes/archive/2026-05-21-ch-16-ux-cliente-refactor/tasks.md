## 1. Router — Catálogo público

- [x] 1.1 En `router.tsx`: cambiar la ruta `{ path: '/', element: <Navigate to="/login" replace /> }` para que renderice `<CatalogPage />` directamente
- [x] 1.2 En `router.tsx`: cambiar la ruta `{ path: '/catalog', ... }` para que sea `<Navigate to="/" replace />` (mantiene compatibilidad de URLs)

## 2. Header — Contenido condicional

- [x] 2.1 En `Header.tsx`: eliminar el bloque `if (!authStore.user) return null`
- [x] 2.2 En `Header.tsx`: agregar rama para estado anónimo — mostrar nombre del sitio + link "Iniciar sesión" (→ `/login`)
- [x] 2.3 En `Header.tsx`: en la rama autenticada, agregar link "Mis Pedidos" (→ `/orders`) junto al ícono del carrito

## 3. CategoryChips — Nuevo componente

- [x] 3.1 Crear `frontend/src/features/categoria-nav/ui/CategoryChips.tsx` con chips horizontales scrollables, reutilizando `useCategorias()` y el mecanismo `?categoria=` de `CategorySidebar`
- [x] 3.2 Incluir chip "Todas" que limpia `?categoria`, chips por cada categoría, estilo activo con `bg-primary text-white`, skeleton de carga y scroll horizontal sin scrollbar visible
- [x] 3.3 Exportar `CategoryChips` desde `frontend/src/features/categoria-nav/index.ts`

## 4. CatalogPage — Nuevo layout

- [x] 4.1 En `CatalogPage.tsx`: eliminar el `<aside>` con `<CategorySidebar />`
- [x] 4.2 En `CatalogPage.tsx`: agregar `<CategoryChips />` encima de la barra de búsqueda (dentro de `<main>`)
- [x] 4.3 En `CatalogPage.tsx`: ajustar el contenedor principal de `flex` a `block` o `flex-col` (ya no hay sidebar lateral)

## 5. "Volver al catálogo" en páginas de flujo

- [x] 5.1 En `OrdersPage.tsx`: agregar link `<Link to="/">← Volver al catálogo</Link>` en el header de la página
- [x] 5.2 En `PaymentPage.tsx`: agregar link `<Link to="/">← Volver al catálogo</Link>` en el header de la página
- [x] 5.3 En `CartPage.tsx`: en el estado de carrito vacío, agregar link `<Link to="/">← Volver al catálogo</Link>`

## 6. Verificación

- [x] 6.1 Un visitante anónimo puede navegar a `/` y ver el catálogo completo sin ser redirigido
- [x] 6.2 El header anónimo muestra "Iniciar sesión" y no muestra "Mis Pedidos" ni datos de usuario
- [x] 6.3 El header autenticado muestra nombre, carrito, "Mis Pedidos" y "Cerrar sesión"
- [x] 6.4 Los chips de categoría filtran correctamente los productos (misma funcionalidad que el sidebar)
- [x] 6.5 La ruta `/catalog` redirige a `/` sin perder query params
- [x] 6.6 Un usuario anónimo puede agregar al carrito y al hacer click en checkout es redirigido a `/login?redirect=/checkout`
- [x] 6.7 El link "Volver al catálogo" es visible en OrdersPage, PaymentPage y CartPage vacío

> **Nota:** Las tasks 6.x son de verificación manual en navegador. Corré el servidor frontend y comprobá cada escenario.
