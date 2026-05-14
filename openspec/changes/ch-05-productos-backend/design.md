## Context

El módulo `productos/` existe con scaffolding vacío desde CH-02. Los modelos `Producto`, `ProductoCategoria` e `ProductoIngrediente` ya están en BD (migrados en CH-00). Las entidades dependientes (`Categoria`, `Ingrediente`) están completamente implementadas y funcionales. El patrón de capas (Router → Service → UoW → Repository → Model) está establecido en CH-03 y CH-07 como referencia directa.

## Goals / Non-Goals

**Goals:**
- Implementar las 4 capas funcionales del módulo `productos/` siguiendo exactamente el patrón de CH-03/CH-07
- 9 endpoints REST completos con autenticación RBAC (público / ADMIN / ADMIN+STOCK)
- Listado paginado con filtros por categoría, disponibilidad y búsqueda de texto
- Detalle de producto con relaciones eager-loaded (categorías + ingredientes)
- Gestión de ingredientes del producto (asociar / quitar) como sub-recursos

**Non-Goals:**
- Frontend (CH-06)
- Gestión de imágenes (se acepta `imagen_url` como campo libre, sin upload)
- Gestión de precios históricos (el snapshot se hace en el momento del pedido, CH-10)
- `PATCH /stock` independiente — el stock se maneja a través de `disponibilidad` en v1

## Decisions

**D1 — Paginación como helper compartido**
Se reutiliza el mismo patrón de `PaginatedResponse[T]` ya definido en `shared/types/` del frontend y se replica como schema Pydantic en el backend. No se introduce una dependencia externa de paginación — se resuelve con `offset/limit` directos en SQLModel.

**D2 — Filtros en el listado por query params opcionales**
`categoria_id`, `disponible` y `search` son opcionales. El repository construye la query dinámicamente. Alternativa descartada: usar un schema `ProductoFilter` como body — no es RESTful para GET.

**D3 — Eager loading con `selectinload` sobre `joinedload`**
Las relaciones `categorias` e `ingredientes` son listas (N:M). `joinedload` genera un JOIN cartesiano problemático con múltiples relaciones. `selectinload` emite queries separadas y es el patrón recomendado por SQLModel/SQLAlchemy para colecciones.

**D4 — Soft delete con campo `deleted_at`**
`Producto` hereda `SoftDeleteMixin` (ya en el modelo). El repository filtra `deleted_at IS NULL` por defecto. El endpoint `DELETE` asigna `deleted_at = now()` vía service — nunca elimina filas.

**D5 — Disponibilidad como campo independiente del stock**
Según spec v5: `disponible` es un toggle manual. `stock_cantidad` es el conteo numérico. Se pueden tener productos con `stock_cantidad > 0` marcados como no disponibles (ej: temporada). El `PATCH /disponibilidad` solo cambia el campo `disponible`.

**D6 — Asociación ingrediente-producto en sub-ruta**
`POST /productos/{id}/ingredientes` recibe `ingrediente_id` + `es_removible`. Si ya existe la asociación, retorna 409. `DELETE /productos/{id}/ingredientes/{ing_id}` elimina la fila de `producto_ingredientes` (hard delete del pivot, no soft).

## Risks / Trade-offs

- [Filtro search con ILIKE] En PostgreSQL `ILIKE` funciona bien para catálogos pequeños/medianos. Con miles de productos se necesitaría índice GIN o búsqueda full-text. → Aceptado en v1, documentar como deuda técnica.
- [N+1 queries en listado paginado] Con `selectinload`, el listado emite 3 queries (productos + categorías + ingredientes). Aceptable para el volumen esperado. → Monitorear si el listado supera los 100 items por página.
- [slug único] El slug se genera a partir del nombre. Si dos productos tienen el mismo nombre base, se debe agregar sufijo único (ej: `-2`). → El service es responsable de garantizar unicidad antes de insertar.

## Migration Plan

No requiere migraciones Alembic — las tablas `productos`, `producto_categorias` y `producto_ingredientes` ya existen. Solo se activan los endpoints registrando el router en `main.py`.
