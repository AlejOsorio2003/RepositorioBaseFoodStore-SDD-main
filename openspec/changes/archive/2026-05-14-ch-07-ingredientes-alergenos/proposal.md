## Why

El módulo `ingredientes/` fue scaffoldeado en CH-02 con el modelo `Ingrediente` y la tabla asociativa `ProductoIngrediente`, pero todas las capas funcionales (schemas, repository, service, router) están vacías. CH-05 (Productos Backend) depende de esta fundación para asociar ingredientes a productos y exponer el campo `es_alergeno`.

## What Changes

- Completar `ingredientes/schemas.py`: `IngredienteCreate`, `IngredienteUpdate`, `IngredienteRead`, `ProductoIngredienteRead`
- Completar `ingredientes/repository.py`: `IngredienteRepository` con `get_by_nombre`, `list_alergenos`
- Completar `ingredientes/service.py`: CRUD con validaciones 404 / 409 (nombre duplicado) / 422 (eliminación con productos asociados)
- Completar `ingredientes/router.py`: 4 endpoints REST bajo `/api/v1/ingredientes`
- Actualizar `core/uow.py`: tipar `self.ingredientes` como `IngredienteRepository` (actualmente `BaseRepository[Ingrediente]`)

## Capabilities

### New Capabilities

- `ingredientes-backend`: CRUD REST `/api/v1/ingredientes` con campo `es_alergeno`, protección de eliminación cuando hay productos asociados, y acceso diferenciado por rol (público lectura, ADMIN escritura, STOCK lectura).

### Modified Capabilities

- `ingredientes-module`: El scaffold existente pasa de placeholder a implementación completa. Sin cambios de requirements de negocio, solo implementación de la capa funcional.

## Impact

- `backend/app/ingredientes/schemas.py` — reescritura completa
- `backend/app/ingredientes/repository.py` — agregar métodos custom
- `backend/app/ingredientes/service.py` — implementar lógica de negocio
- `backend/app/ingredientes/router.py` — agregar los 4 endpoints
- `backend/app/core/uow.py` — actualizar tipo de `self.ingredientes`
- `backend/app/main.py` — ya incluye el router (sin cambio necesario)
- Alembic: no se requiere nueva migración (tablas `ingredientes` y `producto_ingredientes` ya existen)
