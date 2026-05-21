## 1. Router — Catálogo público

- [ ] 1.1 En `router.tsx`: cambiar la ruta `{ path: '/', element: <Navigate to="/login" replace /> }` para que renderice `<CatalogPage />` directamente
- [ ] 1.2 En `router.tsx`: cambiar la ruta `{ path: '/catalog', ... }` para que sea `<Navigate to="/" replace />` (mantiene compatibilidad de URLs)

## 2. Header — Contenido condicional

- [ ] 2.1 En `Header.tsx`: eliminar el bloque `if (!authStore.user) return null`
- [ ] 2.2 En `Header.tsx`: agregar rama para estado anónimo — mostrar nombre del sitio + link "Iniciar sesión" (→ `/login`)
- [ ] 2.3 En `Header.tsx`: en la rama autenticada, agregar link "Mis Pedidos" (→ `/orders`) junto al ícono del carrito

## 3. CategoryChips — Nuevo componente

- [ ] 3.1 Crear `frontend/src/features/categoria-nav/ui/CategoryChips.tsx` con chips horizontales scrollables, reutilizando `useCategorias()` y el mecanismo `?categoria=` de `CategorySidebar`
- [ ] 3.2 Incluir chip "Todas" que limpia `?categoria`, chips por cada categoría, estilo activo con `bg-primary text-white`, skeleton de carga y scroll horizontal sin scrollbar visible
- [ ] 3.3 Exportar `CategoryChips` desde `frontend/src/features/categoria-nav/index.ts`

## 4. CatalogPage — Nuevo layout

- [ ] 4.1 En `CatalogPage.tsx`: eliminar el `<aside>` con `<CategorySidebar />`
- [ ] 4.2 En `CatalogPage.tsx`: agregar `<CategoryChips />` encima de la barra de búsqueda (dentro de `<main>`)
- [ ] 4.3 En `CatalogPage.tsx`: ajustar el contenedor principal de `flex` a `block` o `flex-col` (ya no hay sidebar lateral)

## 5. "Volver al catálogo" en páginas de flujo

- [ ] 5.1 En `OrdersPage.tsx`: agregar link `<Link to="/">← Volver al catálogo</Link>` en el header de la página
- [ ] 5.2 En `PaymentPage.tsx`: agregar link `<Link to="/">← Volver al catálogo</Link>` en el header de la página
- [ ] 5.3 En `CartPage.tsx`: en el estado de carrito vacío, agregar link `<Link to="/">← Volver al catálogo</Link>`

## 6. Verificación

- [ ] 6.1 Un visitante anónimo puede navegar a `/` y ver el catálogo completo sin ser redirigido
- [ ] 6.2 El header anónimo muestra "Iniciar sesión" y no muestra "Mis Pedidos" ni datos de usuario
- [ ] 6.3 El header autenticado muestra nombre, carrito, "Mis Pedidos" y "Cerrar sesión"
- [ ] 6.4 Los chips de categoría filtran correctamente los productos (misma funcionalidad que el sidebar)
- [ ] 6.5 La ruta `/catalog` redirige a `/` sin perder query params
- [ ] 6.6 Un usuario anónimo puede agregar al carrito y al hacer click en checkout es redirigido a `/login?redirect=/checkout`
- [ ] 6.7 El link "Volver al catálogo" es visible en OrdersPage, PaymentPage y CartPage vacío
