## Context

El frontend sigue Feature-Sliced Design. `entities/categoria/` y `features/categoria-nav/` son la referencia directa: tipos en entity, hooks + UI en feature. El cliente HTTP (`shared/api/axios.ts`) ya maneja JWT automáticamente. TanStack Query está configurado con `staleTime: 60_000`. La `CatalogPage` tiene el sidebar de categorías funcionando (CH-04) pero el área de contenido es un placeholder — sólo muestra el nombre de la categoría activa.

El backend de productos (CH-05) expone:
- `GET /api/v1/productos` — listado paginado con filtros `categoria_id`, `disponible`, `search`, `page`, `size`
- `GET /api/v1/productos/{id}` — detalle con relaciones (categorías + ingredientes)

## Goals / Non-Goals

**Goals:**
- Tipo TypeScript `Producto`, `ProductoDetail`, `PaginatedProductos` en `entities/producto/`
- Funciones API y hooks TanStack Query (`useProductos`, `useProducto`) en `features/producto-list/`
- Componentes `ProductoCard` y `ProductoGrid` en `features/producto-list/ui/`
- Modal de detalle `ProductoDetailModal` en `features/producto-detail/`
- Extensión de `CatalogPage`: integrar `ProductoGrid` + barra de búsqueda con query param `?q`
- Nueva `ProductoDetailPage` para navegación directa a `/productos/:id`
- Ruta `/productos/:id` en el router

**Non-Goals:**
- CRUD de productos desde frontend (CH-15 Admin)
- Carrito de compras (CH-11)
- Filtro por disponibilidad manual en UI pública (siempre se muestra `disponible=true`)
- Imágenes con upload (se usa `imagen_url` tal como viene del backend)
- Paginación infinita (scroll) — se implementa paginación clásica con botones

## Decisions

### D1 — Tipos en `entities/producto/`, hooks + UI en `features/producto-list/`

Mismo patrón que `entities/categoria/` / `features/categoria-nav/`. El tipo `Producto` puede ser importado por futuras features (carrito, pedidos) sin depender de la feature de listado.

**Alternativa descartada:** colocar todo en `features/producto-list/` — viola FSD cuando `features/carrito/` necesite importar el tipo `Producto`.

### D2 — Filtros de búsqueda y categoría en la URL (`?q=` y `?categoria=`)

`useSearchParams` de React Router gestiona ambos query params como fuente de verdad. La URL es linkeable, funciona con el historial del browser y no requiere estado adicional.

**Alternativa descartada:** estado local en `useState` — no persiste al recargar ni al compartir la URL.

### D3 — `disponible=true` fijo en la query pública

En la vista de catálogo público sólo tienen sentido los productos disponibles. El filtro `disponible` no se expone en la UI; se pasa fijo como `true` desde el hook `useProductos`.

**Alternativa descartada:** exponer el filtro al usuario — no es un caso de uso de la página de catálogo.

### D4 — Paginación clásica (page/size) con `page` en URL (`?page=`)

Consistente con la paginación del backend (offset/limit). Se agrega `?page=` como tercer query param. TanStack Query cachea cada página por separado con `queryKey: ['productos', { page, size, categoria_id, search }]`.

**Alternativa descartada:** TanStack Query `useInfiniteQuery` con scroll infinito — más complejo, requiere scroll detection y no mejora el UX para un catálogo de comida donde el usuario suele filtrar por categoría.

### D5 — Detalle de producto: modal desde CatalogPage + página standalone

Cuando el usuario hace click en una `ProductoCard` desde el catálogo, se abre un `ProductoDetailModal` (sin cambio de ruta). La ruta `/productos/:id` existe para deep-linking y OG-tags. Ambos usan el mismo hook `useProducto(id)`.

**Alternativa descartada:** navegar siempre a la página de detalle — rompe el flujo de exploración cuando el usuario quiere ver detalles y volver sin perder el scroll/filtro.

### D6 — `ProductoCard` muestra imagen, nombre, precio y botón "Ver detalle"

No se agrega el botón "Agregar al carrito" (eso es CH-11). El componente queda listo para recibir una prop `onAddToCart` en CH-11 sin necesidad de refactor.

## Risks / Trade-offs

- [Carga de página grande] Con `size=20` (default) y `selectinload` en backend, la primera carga trae 20 productos con relaciones. Aceptable para el volumen esperado. → Monitorear si el tiempo de respuesta supera 500ms en producción.
- [Imagen rota] Si `imagen_url` es null o retorna 404, la card debe mostrar un fallback visual. → Manejar con `onError` en el `<img>` tag y un placeholder de color sólido.
- [Debounce en búsqueda] Sin debounce, cada keystroke dispara una request. → Implementar debounce de 300ms antes de actualizar el query param `?q`.
