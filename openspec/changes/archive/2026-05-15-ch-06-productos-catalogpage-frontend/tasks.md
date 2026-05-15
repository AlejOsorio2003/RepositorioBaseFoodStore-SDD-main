## 1. Entity — tipos y API client (`entities/producto/`)

- [x] 1.1 Crear `frontend/src/entities/producto/types.ts` con tipos `CategoriaEnProducto` (`id`, `nombre`), `IngredienteEnProducto` (`id`, `nombre`, `es_alergeno`, `es_removible`), `Producto` (campos planos de `ProductoRead`), `ProductoDetail` (extiende `Producto` + `categorias` + `ingredientes`), `PaginatedProductos` (`items`, `total`, `page`, `size`)
- [x] 1.2 Crear `frontend/src/entities/producto/api.ts` con función `fetchProductos(params: { page?: number; size?: number; categoria_id?: number | null; search?: string; disponible?: boolean }) → Promise<PaginatedProductos>` que llama a `GET /api/v1/productos`
- [x] 1.3 Agregar función `fetchProducto(id: number) → Promise<ProductoDetail>` en el mismo `api.ts` que llama a `GET /api/v1/productos/{id}`
- [x] 1.4 Crear `frontend/src/entities/producto/index.ts` re-exportando todos los tipos y funciones API
- [x] 1.5 Agregar re-export en `frontend/src/entities/index.ts` (o crearlo si no existe)

## 2. Feature — hooks TanStack Query (`features/producto-list/hooks/`)

- [x] 2.1 Crear `frontend/src/features/producto-list/hooks/useProductos.ts` con `useProductos({ page, size, categoria_id, search })` — siempre pasa `disponible: true`; `queryKey: ['productos', { page, size, categoria_id, search }]`; `staleTime: 60_000`
- [x] 2.2 Crear `frontend/src/features/producto-list/hooks/useProducto.ts` con `useProducto(id: number | null)` — `enabled: !!id`; `queryKey: ['producto', id]`
- [x] 2.3 Crear `frontend/src/features/producto-list/hooks/index.ts` re-exportando los hooks

## 3. Feature — componentes de listado (`features/producto-list/ui/`)

- [x] 3.1 Crear `frontend/src/features/producto-list/ui/ProductoCard.tsx` con props `producto: Producto` y `onSelect: (p: Producto) => void`; mostrar imagen con fallback (placeholder de color sólido si `imagen_url` es null o imagen falla con `onError`); mostrar nombre, descripción (truncada), precio formateado como moneda; botón "Ver detalle" que llama `onSelect`
- [x] 3.2 Crear `frontend/src/features/producto-list/ui/ProductoGrid.tsx` que recibe `params` de filtro y `onSelect`; usa `useProductos(params)`; muestra skeletons en estado de carga; muestra mensaje "No se encontraron productos" en estado vacío; renderiza grid de `ProductoCard` y controles de paginación (botones anterior/siguiente) cuando `total > size`
- [x] 3.3 Crear `frontend/src/features/producto-list/ui/index.ts` re-exportando `ProductoCard` y `ProductoGrid`
- [x] 3.4 Crear `frontend/src/features/producto-list/index.ts` re-exportando hooks y componentes

## 4. Feature — modal de detalle (`features/producto-detail/`)

- [x] 4.1 Crear `frontend/src/features/producto-detail/hooks/useProductoDetail.ts` que re-exporta `useProducto` desde `features/producto-list/hooks/useProducto` (o reusar directamente — no duplicar lógica)
- [x] 4.2 Crear `frontend/src/features/producto-detail/ui/ProductoDetailModal.tsx` con props `productoId: number | null` y `onClose: () => void`; usa `useProducto(productoId)`; muestra overlay con overlay oscuro, imagen grande, nombre, descripción completa, precio, lista de ingredientes marcando alérgenos visualmente; botón de cierre y click fuera para cerrar
- [x] 4.3 Crear `frontend/src/features/producto-detail/ui/index.ts` y `frontend/src/features/producto-detail/index.ts` con re-exports

## 5. Page — extensión de `CatalogPage`

- [x] 5.1 Agregar barra de búsqueda en `frontend/src/pages/CatalogPage.tsx`; leer `?q` con `useSearchParams`; controlar el input con estado local; aplicar debounce de 300ms antes de actualizar el query param `?q`
- [x] 5.2 Integrar `ProductoGrid` en el área de contenido de `CatalogPage`; pasarle `categoria_id` desde `?categoria`, `search` desde `?q`, `page` desde `?page` (default 1) y `size=12`
- [x] 5.3 Manejar el cambio de página: actualizar `?page` en la URL cuando `ProductoGrid` emite el evento de cambio de página
- [x] 5.4 Al cambiar la categoría activa, resetear `?page` y `?q` en la URL
- [x] 5.5 Agregar estado local `selectedProductoId: number | null` en `CatalogPage`; pasar `onSelect` a `ProductoGrid` para setear el id seleccionado; renderizar `ProductoDetailModal` con ese id y `onClose` que limpia el estado

## 6. Page — `ProductoDetailPage` y ruta

- [x] 6.1 Crear `frontend/src/pages/ProductoDetailPage.tsx` que lee `:id` de `useParams`, llama `useProducto(Number(id))`; muestra el detalle completo (misma info que el modal pero en página completa); en estado de error 404 muestra "Producto no encontrado" con enlace a `/catalog`
- [x] 6.2 Agregar ruta `{ path: '/productos/:id', element: <ProductoDetailPage /> }` en `frontend/src/app/router.tsx` e importar el componente

## 7. Verificación

- [ ] 7.1 Navegar a `/catalog` y confirmar que se muestra la grilla de productos del seed (debería haber productos cargados)
- [ ] 7.2 Seleccionar una categoría en el sidebar y confirmar que la grilla se filtra y la URL incluye `?categoria={id}`
- [ ] 7.3 Escribir en la barra de búsqueda y confirmar que la URL incluye `?q=<texto>` después de 300ms y la grilla se actualiza
- [ ] 7.4 Navegar a la página 2 y confirmar que la URL incluye `?page=2` y persiste al recargar
- [ ] 7.5 Cambiar de categoría y confirmar que `?page` y `?q` se resetean
- [ ] 7.6 Hacer click en una card y confirmar que se abre el `ProductoDetailModal` con los ingredientes del producto
- [ ] 7.7 Cerrar el modal y confirmar que el listado, categoría y búsqueda se mantienen
- [ ] 7.8 Navegar directamente a `/productos/1` y confirmar que `ProductoDetailPage` carga el producto correctamente
- [ ] 7.9 Navegar a `/productos/9999` y confirmar que se muestra el mensaje de error con enlace al catálogo
