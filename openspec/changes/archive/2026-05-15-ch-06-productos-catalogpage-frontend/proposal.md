## Why

CH-05 entregó el backend completo de productos (`GET /productos`, `GET /productos/{id}`, paginación, filtros). La `CatalogPage` existe pero sólo muestra la navegación de categorías (CH-04) — el listado de productos es un placeholder vacío. Este change conecta el frontend con la API de productos para que los usuarios puedan explorar el catálogo, filtrar por categoría y ver el detalle de cada producto.

## What Changes

- **`entities/producto/`** — tipos TypeScript `Producto`, `ProductoDetail`, `PaginatedProductos`, `ProductoIngrediente` + funciones de API (nuevo módulo entity).
- **`features/producto-list/`** — hooks TanStack Query (`useProductos`, `useProducto`) + componentes `ProductoCard`, `ProductoGrid` (nueva feature).
- **`features/producto-detail/`** — hook `useProducto` y modal/drawer `ProductoDetailModal` con detalle completo de producto (nueva feature).
- **`pages/CatalogPage.tsx`** — extensión: reemplaza el placeholder con `ProductoGrid` conectado al query param `?categoria` y búsqueda por texto. Agrega barra de búsqueda y estado vacío.
- **`pages/ProductoDetailPage.tsx`** — nueva página de detalle standalone para navegación directa a `/productos/:id`.

## Capabilities

### New Capabilities

- `productos-frontend`: Tipos TypeScript, funciones API y hooks TanStack Query para el catálogo de productos. Listado paginado con filtros (categoría, búsqueda de texto, disponibilidad). Detalle de producto con ingredientes y categorías.
- `catalog-page`: Extensión de `CatalogPage` con `ProductoGrid` funcional, barra de búsqueda, estados de carga/vacío, y navegación al detalle.

### Modified Capabilities

- `categorias-frontend`: La `CatalogPage` pasa el `categoriaId` como filtro al listado de productos (integración entre feature de categorías y feature de productos). No cambia el comportamiento de la feature de categorías en sí.

## Impact

**Frontend:**
- `frontend/src/entities/producto/` — nuevo módulo (types + api)
- `frontend/src/features/producto-list/` — nueva feature (hooks + componentes)
- `frontend/src/features/producto-detail/` — nueva feature (hook + modal)
- `frontend/src/pages/CatalogPage.tsx` — modificado (agrega ProductoGrid + búsqueda)
- `frontend/src/pages/ProductoDetailPage.tsx` — nueva página
- `frontend/src/app/router.tsx` — agrega ruta `/productos/:id`

**Dependencias npm:** ninguna nueva — TanStack Query, Axios y Tailwind ya están instalados.

**Backend:** ningún cambio — consume endpoints existentes de CH-05.
