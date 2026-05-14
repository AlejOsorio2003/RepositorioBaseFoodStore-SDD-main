## Why

El sistema necesita un módulo de categorías jerárquicas para organizar el catálogo de productos. Sin categorías funcionales no se puede implementar el catálogo (CH-05) ni los filtros del frontend (CH-04).

## What Changes

- Implementar el modelo `Categoria` con soporte de jerarquía recursiva (`parent_id` self-ref FK)
- Implementar `GET /api/v1/categorias` con árbol completo vía CTE recursiva de PostgreSQL
- Implementar CRUD admin: `POST`, `PATCH`, `DELETE` (soft delete con validación)
- `GET /api/v1/categorias/{id}` — detalle con hijos directos
- Validación de referencias circulares a nivel de servicio
- Soft delete: no eliminar si tiene subcategorías activas o productos asociados activos

## Capabilities

### New Capabilities

- `categorias-backend`: CRUD de categorías jerárquicas con CTE recursiva, soft delete con validación, RBAC (solo ADMIN puede crear/modificar/eliminar)

### Modified Capabilities

## Impact

- `backend/app/categorias/` — completar capas: `schemas.py`, `repository.py`, `service.py`, `router.py` (scaffolding ya existe de CH-02)
- `backend/app/core/uow.py` — el repositorio de categorías ya está registrado
- `backend/app/main.py` — el router ya está incluido con prefix `/api/v1/categorias`
- Sin cambios en frontend (eso es CH-04)
