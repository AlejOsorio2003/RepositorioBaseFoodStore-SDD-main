## Context

El módulo `ingredientes/` existe desde CH-02 con modelo completo (`Ingrediente` con `nombre`, `es_alergeno`) y la tabla de join `ProductoIngrediente` (en `productos/models.py`, propietario de la relación). Todas las capas funcionales (schemas, repository, service, router) son stubs vacíos. El router ya está registrado en `main.py`.

**Restricciones heredadas:**
- `Ingrediente` usa `TimestampMixin` (sin `SoftDeleteMixin`) → delete es hard delete
- `ProductoIngrediente.es_removible` es el campo que habilita personalización de pedido — debe quedar intacto para CH-05
- El UoW ya tiene `self.ingredientes: BaseRepository[Ingrediente]` — hay que actualizar el tipo a `IngredienteRepository`

## Goals / Non-Goals

**Goals:**
- Completar las 4 capas de `ingredientes/`: schemas, repository, service, router
- Exponer CRUD REST en `/api/v1/ingredientes` con RBAC correcto
- Actualizar tipo de `uow.ingredientes` a `IngredienteRepository`

**Non-Goals:**
- Endpoints de sub-recurso `/api/v1/productos/{id}/ingredientes` — son scope de CH-05
- Paginación avanzada en listado (se usa `list_all` de `BaseRepository` con skip/limit)
- Frontend — es scope de CH-06 u otro change dedicado

## Decisions

**D1 — Hard delete sin soft delete**
`Ingrediente` no tiene `deleted_at`. Se usa `hard_delete()` de `BaseRepository`. Antes de eliminar, el service verifica que no existan filas en `producto_ingredientes` para ese `ingrediente_id`. Si existen, lanza 409 Conflict.

*Alternativa considerada:* agregar `SoftDeleteMixin` a `Ingrediente`. Descartado: el spec ERD v5 no define `deleted_at` en `ingredientes`, y el badge de alérgenos en UI debe mostrar datos actuales del catálogo.

**D2 — `IngredienteRepository` con método custom `get_by_nombre`**
El control de unicidad de `nombre` se hace en el service consultando por nombre antes de crear/actualizar. El repository expone `get_by_nombre(nombre: str) -> Ingrediente | None` para centralizar esa query.

*Alternativa:* dejar que la BD lance el `UniqueViolation` y capturarlo. Descartado: genera acoplamiento a errores de BD y respuesta menos clara.

**D3 — RBAC**
- `GET /ingredientes` y `GET /ingredientes/{id}` → público (sin auth), consistente con productos y categorías
- `POST`, `PATCH`, `DELETE` → solo `ADMIN`
- `STOCK` puede "ver ingredientes" (RBAC table) → cubierto por los endpoints públicos de lectura

## Risks / Trade-offs

- [Race condition en unicidad] Dos requests concurrentes con mismo `nombre` pueden pasar la validación del service y colisionar en BD → Mitigation: el constraint `UNIQUE` de BD actúa como última defensa; el error de BD se convierte en 409 con handler existente.
- [Ingredientes con productos] Hard delete bloqueado por verificación en service → correcto por diseño; el operador debe primero desasociar el ingrediente de los productos.

## Migration Plan

Sin migración Alembic necesaria — las tablas `ingredientes` y `producto_ingredientes` ya existen desde CH-00. Solo cambios de código Python.

## Open Questions

Ninguna — el scope está completamente definido por el spec v5.
