## 1. Schemas (`backend/app/productos/schemas.py`)

- [x] 1.1 Definir `ProductoCreate`: campos `nombre` (str, max 200), `descripcion` (str|None), `precio_base` (Decimal ≥ 0), `stock_cantidad` (int ≥ 0, default 0), `disponible` (bool, default True), `imagen_url` (str|None), `categoria_ids` (list[int], default []), `ingrediente_ids` (list[int], default [])
- [x] 1.2 Definir `ProductoUpdate`: mismos campos que Create pero todos opcionales (Optional)
- [x] 1.3 Definir `DisponibilidadUpdate`: `disponible: bool`
- [x] 1.4 Definir `IngredienteEnProductoRead`: `id`, `nombre`, `es_alergeno`, `es_removible` (campo del pivot)
- [x] 1.5 Definir `CategoriaEnProductoRead`: `id`, `nombre`
- [x] 1.6 Definir `ProductoRead`: `id`, `nombre`, `slug`, `descripcion`, `precio_base`, `stock_cantidad`, `disponible`, `imagen_url`, `created_at` — sin relaciones
- [x] 1.7 Definir `ProductoDetail`: extiende `ProductoRead` + `categorias: list[CategoriaEnProductoRead]` + `ingredientes: list[IngredienteEnProductoRead]`
- [x] 1.8 Definir `PaginatedProductos`: `items: list[ProductoRead]`, `total: int`, `page: int`, `size: int`
- [x] 1.9 Definir `ProductoIngredienteCreate`: `ingrediente_id: int`, `es_removible: bool` (default False)
- [x] 1.10 Definir `ProductoIngredienteRead`: `producto_id`, `ingrediente_id`, `es_removible`, `ingrediente: IngredienteEnProductoRead`

## 2. Repository (`backend/app/productos/repository.py`)

- [x] 2.1 Importar modelos: `Producto`, `ProductoCategoria`, `ProductoIngrediente`; importar `Ingrediente` de `ingredientes/models.py`; importar `Categoria` de `categorias/models.py`
- [x] 2.2 Implementar `list_paginado(session, *, categoria_id, disponible, search, page, size) → tuple[list[Producto], int]`: construir query con `select(Producto).where(Producto.deleted_at.is_(None))`, aplicar filtros opcionales (JOIN a `ProductoCategoria` si `categoria_id`, `ILIKE` en nombre/descripcion si `search`, `== disponible` si no None), retornar `(items, total)`
- [x] 2.3 Implementar `get_by_id_con_relaciones(session, producto_id) → Producto | None`: query con `selectinload(Producto.categorias).selectinload(ProductoCategoria.categoria)` y `selectinload(Producto.ingredientes).selectinload(ProductoIngrediente.ingrediente)`; filtrar `deleted_at IS NULL`
- [x] 2.4 Implementar `get_by_slug(session, slug) → Producto | None`: query simple por slug con `deleted_at IS NULL`
- [x] 2.5 Implementar `get_pivot_ingrediente(session, producto_id, ingrediente_id) → ProductoIngrediente | None`: busca la fila exacta en el pivot
- [x] 2.6 Implementar `add_ingrediente(session, pivot: ProductoIngrediente) → None`: `session.add(pivot)`
- [x] 2.7 Implementar `remove_ingrediente(session, pivot: ProductoIngrediente) → None`: `session.delete(pivot)`
- [x] 2.8 Implementar `soft_delete(session, producto: Producto) → None`: asignar `producto.deleted_at = datetime.now(UTC)`, `session.add(producto)`

## 3. Service (`backend/app/productos/service.py`)

- [x] 3.1 Implementar `listar_productos(uow, *, categoria_id, disponible, search, page, size) → PaginatedProductos`: llama a `uow.productos.list_paginado(...)`, construye y retorna `PaginatedProductos`
- [x] 3.2 Implementar `get_producto(uow, producto_id) → ProductoDetail`: llama a `get_by_id_con_relaciones`; si None → `HTTPException 404`; construye `ProductoDetail` mapeando relaciones
- [x] 3.3 Implementar `crear_producto(uow, data: ProductoCreate) → ProductoRead`: generar slug único desde `data.nombre` (slugify + sufijo numérico si conflicto), verificar slug con `get_by_slug` → 409 si existe, crear `Producto`, crear entradas `ProductoCategoria` para cada `categoria_id`, `session.add(producto)`, retornar `ProductoRead`
- [x] 3.4 Implementar `actualizar_producto(uow, producto_id, data: ProductoUpdate) → ProductoRead`: buscar con `get_by_id_con_relaciones` → 404 si no existe; aplicar campos no-None de `data` al objeto; si `nombre` cambia, regenerar slug y verificar unicidad; retornar `ProductoRead`
- [x] 3.5 Implementar `cambiar_disponibilidad(uow, producto_id, disponible: bool) → ProductoRead`: buscar → 404; asignar `producto.disponible = disponible`; retornar `ProductoRead`
- [x] 3.6 Implementar `eliminar_producto(uow, producto_id) → None`: buscar → 404; llamar a `uow.productos.soft_delete(...)`
- [x] 3.7 Implementar `listar_ingredientes_producto(uow, producto_id) → list[IngredienteEnProductoRead]`: buscar con relaciones → 404; mapear `producto.ingredientes` a lista de `IngredienteEnProductoRead`
- [x] 3.8 Implementar `asociar_ingrediente(uow, producto_id, data: ProductoIngredienteCreate) → ProductoIngredienteRead`: verificar producto existe → 404; verificar ingrediente existe (`uow.ingredientes.get_by_id(...)`) → 404; verificar pivot no existe → 409; crear `ProductoIngrediente`, `add_ingrediente`; retornar `ProductoIngredienteRead`
- [x] 3.9 Implementar `quitar_ingrediente(uow, producto_id, ingrediente_id) → None`: verificar producto existe → 404; buscar pivot → 404 si no existe; llamar a `remove_ingrediente`

## 4. Router (`backend/app/productos/router.py`)

- [x] 4.1 Crear `router = APIRouter(prefix="/productos", tags=["Productos"])`
- [x] 4.2 `GET /` → `listar_productos` — público, query params: `categoria_id`, `disponible`, `search`, `page=1`, `size=20`; `response_model=PaginatedProductos`
- [x] 4.3 `GET /{producto_id}` → `get_producto` — público; `response_model=ProductoDetail`
- [x] 4.4 `POST /` → `crear_producto` — `Depends(require_role("ADMIN"))`; `response_model=ProductoRead`, status 201
- [x] 4.5 `PUT /{producto_id}` → `actualizar_producto` — `Depends(require_role("ADMIN"))`; `response_model=ProductoRead`
- [x] 4.6 `PATCH /{producto_id}/disponibilidad` → `cambiar_disponibilidad` — `Depends(require_role("ADMIN", "STOCK"))`; body `DisponibilidadUpdate`; `response_model=ProductoRead`
- [x] 4.7 `DELETE /{producto_id}` → `eliminar_producto` — `Depends(require_role("ADMIN"))`; status 204
- [x] 4.8 `GET /{producto_id}/ingredientes` → `listar_ingredientes_producto` — público; `response_model=list[IngredienteEnProductoRead]`
- [x] 4.9 `POST /{producto_id}/ingredientes` → `asociar_ingrediente` — `Depends(require_role("ADMIN"))`; `response_model=ProductoIngredienteRead`, status 201
- [x] 4.10 `DELETE /{producto_id}/ingredientes/{ingrediente_id}` → `quitar_ingrediente` — `Depends(require_role("ADMIN"))`; status 204

## 5. Integración UoW y main.py

- [x] 5.1 En `backend/app/core/uow.py`: importar `ProductoRepository` e inyectarlo como `self.productos: ProductoRepository`
- [x] 5.2 En `backend/app/main.py`: importar `router as productos_router` desde `app.productos.router`; registrar con `app.include_router(productos_router, prefix="/api/v1")`

## 6. Verificación de endpoints

- [ ] 6.1 Reiniciar servidor uvicorn y verificar que no hay errores de importación
- [ ] 6.2 `GET /api/v1/productos` → 200 con lista paginada (puede ser vacía si no hay datos de seed)
- [ ] 6.3 `POST /api/v1/productos` sin token → 401
- [ ] 6.4 `POST /api/v1/productos` con token ADMIN → 201 con producto creado
- [ ] 6.5 `GET /api/v1/productos/{id}` con id creado → 200 con `ProductoDetail`
- [ ] 6.6 `GET /api/v1/productos/9999` → 404
- [ ] 6.7 `PATCH /api/v1/productos/{id}/disponibilidad` con token STOCK → 200
- [ ] 6.8 `POST /api/v1/productos/{id}/ingredientes` con ingrediente válido → 201
- [ ] 6.9 `POST /api/v1/productos/{id}/ingredientes` con mismo ingrediente → 409
- [ ] 6.10 `DELETE /api/v1/productos/{id}` → 204; luego `GET` → 404
