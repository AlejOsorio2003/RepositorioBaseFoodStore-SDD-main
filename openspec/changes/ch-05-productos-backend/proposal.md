## Why

El catálogo de productos es el núcleo del e-commerce: sin él no hay carrito, pedidos ni checkout. CH-03 (categorías) y CH-07 (ingredientes) ya están archivados, desbloqueando CH-05 como el paso inmediatamente necesario para habilitar CH-06 (CatalogPage) y toda la cadena de ventas (CH-10→CH-12).

## What Changes

- Implementar `schemas.py` completo: `ProductoCreate`, `ProductoUpdate`, `ProductoRead`, `ProductoDetail`, `PaginatedProductos`, `ProductoIngredienteCreate`, `ProductoIngredienteRead`
- Implementar `ProductoRepository` con búsqueda paginada (filtros: categoria, disponible, search), eager-load de categorías e ingredientes, y lookup por slug/id
- Implementar `ProductoService` con CRUD completo, manejo de relaciones N:M (categorías e ingredientes), toggle de disponibilidad, y gestión de stock (`PATCH /disponibilidad`)
- Implementar `router.py` con 9 endpoints según spec v5.0:
  - `GET /productos` (público, paginado, filtros)
  - `GET /productos/{id}` (público, detalle con relaciones)
  - `POST /productos` (ADMIN)
  - `PUT /productos/{id}` (ADMIN)
  - `PATCH /productos/{id}/disponibilidad` (ADMIN, STOCK)
  - `DELETE /productos/{id}` (ADMIN, soft delete)
  - `GET /productos/{id}/ingredientes` (público)
  - `POST /productos/{id}/ingredientes` (ADMIN)
  - `DELETE /productos/{id}/ingredientes/{ing_id}` (ADMIN)
- Integrar `uow.productos` como `ProductoRepository` tipado en `core/uow.py`
- Registrar el router en `main.py`

## Capabilities

### New Capabilities

- `productos-backend`: CRUD completo del catálogo de productos — listado paginado con filtros, detalle con ingredientes y categorías, gestión de stock/disponibilidad, y asociación de ingredientes. Base para pedidos y catálogo frontend.

### Modified Capabilities

- `ingredientes-backend`: se agrega la relación inversa — el endpoint `GET /productos/{id}/ingredientes` consume `ProductoIngrediente` junto con datos de `Ingrediente`. No cambia comportamiento existente de `/ingredientes`, solo se usa el modelo de join ya migrado.

## Impact

- **Backend:** `backend/app/productos/` — los 4 archivos de scaffolding (`schemas.py`, `repository.py`, `service.py`, `router.py`) pasan de placeholder a implementación completa
- **UoW:** `backend/app/core/uow.py` — agregar atributo `productos: ProductoRepository`
- **main.py:** registrar `productos_router` con prefix `/api/v1/productos`
- **Dependencias:** ninguna nueva en `requirements.txt` (FastAPI, SQLModel, Pydantic ya presentes)
- **Migrations:** no requeridas — `Producto`, `ProductoCategoria`, `ProductoIngrediente` ya están en BD (CH-00)
