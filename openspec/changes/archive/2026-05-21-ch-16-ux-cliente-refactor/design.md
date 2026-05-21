## Context

El frontend cliente actual fuerza login antes de ver el catálogo (`router.tsx` línea 50: `{ path: '/', element: <Navigate to="/login" replace /> }`). El `Header` retorna `null` si no hay usuario autenticado (línea 22–24 de `Header.tsx`), lo que hace invisible la navegación para visitantes anónimos. La navegación por categorías vive en `CategorySidebar.tsx`, un árbol vertical de 64px de ancho que ocupa espacio lateral y no es idiomático en e-commerce.

El flujo de lazy auth en `CartPage` ya está parcialmente implementado: `handleCheckout()` redirige a `/login?redirect=/checkout` si no hay usuario. `CheckoutPage` tiene su propio guard via `useEffect`. Estos no cambian.

## Goals / Non-Goals

**Goals:**
- Catálogo visible sin autenticación (`GET /productos` ya es público en el backend)
- Header siempre visible, con contenido condicional según estado de auth
- `CategoryChips` horizontal reemplaza `CategorySidebar` sin romper el mecanismo de query params `?categoria=`
- "Mis Pedidos" en header cuando el usuario está autenticado
- "Volver al catálogo" en `OrdersPage`, `PaymentPage` y la sección de carrito vacío de `CartPage`

**Non-Goals:**
- Cambios de backend (el endpoint `GET /productos` ya es público)
- Subcategorías anidadas en chips (se muestran todas las categorías flat — raíces y hojas como chips independientes)
- Persistir la categoría seleccionada entre sesiones
- Rediseño del flujo de autenticación (`LoginPage`, `RegisterPage`)

## Decisions

### D-1: Ruta `/` → CatalogPage directa
**Decisión:** cambiar `{ path: '/', element: <Navigate to="/login" replace /> }` por `{ path: '/', element: <CatalogPage /> }`. La ruta `/catalog` pasa a ser `<Navigate to="/" replace />` para mantener compatibilidad de URLs existentes.

**Alternativa descartada:** mantener `/catalog` como ruta principal y cambiar solo el redirect. Se prefiere `/` porque es la URL canónica de un e-commerce y el `AuthInitializer` ya existe en providers para restaurar sesión sin bloquear la carga.

### D-2: Header siempre visible con contenido condicional
**Decisión:** eliminar el `if (!authStore.user) return null` del `Header`. El header se divide en dos estados:
- **Anónimo:** logo/nombre del sitio + botón "Iniciar sesión" (link a `/login`) + ícono carrito (el carrito ya funciona sin auth)
- **Autenticado:** estado actual + nuevo link "Mis Pedidos" → `/orders`

**Alternativa descartada:** crear un `HeaderPublico` separado. Una sola vista condicional es más simple y evita duplicar el `CartDrawer`.

### D-3: CategoryChips — chips horizontales scrollables
**Decisión:** nuevo componente `features/categoria-nav/ui/CategoryChips.tsx`. Reutiliza el mismo hook `useCategorias()` y el mismo mecanismo `?categoria=`. Muestra todas las categorías (raíces + hojas) como chips horizontales scrollables. El chip "Todas" equivale a `categoriaId = null`.

**Alternativa descartada:** mostrar solo raíces y expandir hijos al hacer click (dropdown). Agrega complejidad sin valor claro para un catálogo pequeño.

### D-4: Layout CatalogPage — full-width sin aside
**Decisión:** eliminar el `<aside>` de `CatalogPage.tsx`. Los chips van en una barra horizontal sobre la barra de búsqueda. El grid de productos toma el 100% del ancho disponible.

### D-5: "Volver al catálogo" — link simple, no botón de navegación del browser
**Decisión:** usar `<Link to="/">` en vez de `navigate(-1)`. Garantiza que el destino siempre sea el catálogo, independientemente del historial de navegación.

## Risks / Trade-offs

- **Header anónimo con carrito visible:** un usuario sin sesión puede agregar al carrito. Al intentar checkout se redirige a login. Los ítems del carrito persisten en `localStorage` via Zustand persist — el usuario no pierde lo que agregó. Esto es comportamiento esperado y deseable.
- **`/catalog` redirigiendo a `/`:** si hay links hardcodeados internos a `/catalog`, pasarán por un redirect. Son pocos y controlados.
- **`OrdersPage` y `PaymentPage` siguen siendo rutas protegidas:** el link "Volver al catálogo" en esas páginas es visible solo cuando el usuario ya está autenticado (condición de acceso a esas rutas), por lo que no hay incoherencia.

## Migration Plan

Sin cambios de backend ni base de datos. El cambio es pure frontend:

1. Modificar `router.tsx` (ruta `/` y `/catalog`)
2. Modificar `Header.tsx` (remover null-return, agregar condicional auth, agregar link Mis Pedidos)
3. Crear `CategoryChips.tsx` (misma lógica de selección que `CategorySidebar`)
4. Modificar `CatalogPage.tsx` (remover aside, agregar CategoryChips)
5. Agregar "Volver al catálogo" en `OrdersPage`, `PaymentPage`, `CartPage` (cuando carrito vacío)
6. Actualizar barrel `features/categoria-nav/index.ts` (exportar CategoryChips, mantener CategorySidebar para no romper imports indirectos)

Rollback: revertir los 6 archivos. No hay migración de datos.
