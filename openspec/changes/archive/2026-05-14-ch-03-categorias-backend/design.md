## Context

El scaffolding del módulo `categorias/` ya existe desde CH-02 (model, schemas, repository, service, router vacíos). El modelo `Categoria` ya está definido con `parent_id` self-ref y soft delete. El router está registrado en `main.py` con prefix `/api/v1/categorias`. El repositorio está en el UoW como `uow.categorias`.

## Goals / Non-Goals

**Goals:**
- Implementar endpoints CRUD completos para categorías
- Query de árbol completo con CTE recursiva de PostgreSQL
- Soft delete con validación (no eliminar si tiene hijos activos o productos activos)
- RBAC: solo rol ADMIN puede crear, modificar y eliminar
- Prevención de referencias circulares a nivel de servicio

**Non-Goals:**
- Frontend (CH-04)
- Asociación producto-categoría (CH-05)
- Paginación del árbol (retorna árbol completo siempre)

## Decisions

**CTE recursiva en el repositorio**
Se implementa directamente con `text()` de SQLAlchemy para aprovechar `WITH RECURSIVE` de PostgreSQL. Alternativa descartada: reconstruir el árbol en Python iterando — ineficiente para árboles profundos.

**Respuesta como árbol anidado vs lista plana**
`GET /api/v1/categorias` retorna lista plana con `parent_id` incluido. El frontend construye el árbol. Alternativa descartada: árbol anidado en JSON — complica la serialización con Pydantic y no aporta valor para el cliente React.

**Validación de ciclos**
Antes de actualizar `parent_id`, el servicio verifica que el nuevo padre no sea descendiente de la categoría a modificar usando la CTE de descendientes. Alternativa: constraint a nivel de BD — PostgreSQL no soporta constraints de ciclo nativamente.

**Soft delete con bloqueo**
Un DELETE lanza 409 si la categoría tiene hijos activos o productos activos asociados. El frontend debe primero reasignar o eliminar los hijos.

## Risks / Trade-offs

- [CTE con `text()`] Menos type-safe que ORM puro → Mitigación: tests manuales en Swagger antes de integrar con frontend
- [Lista plana] El frontend debe construir el árbol → Mitigación: es el patrón estándar FSD; CH-04 ya lo contempla

## Migration Plan

No requiere migración — la tabla `categorias` ya existe desde CH-00. El seed ya inserta categorías de ejemplo.
