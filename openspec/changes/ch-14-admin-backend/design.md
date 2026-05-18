## Context

El módulo `backend/app/admin/` existe desde CH-02 (reestructuración) como stub vacío: `schemas.py` tiene solo `MetricasRead(BaseModel): pass`, `service.py` tiene `AdminService: pass`, `repository.py` tiene `AdminRepository: pass`, y `router.py` solo declara `router = APIRouter()`. CH-14 lo implementa completamente.

El UoW ya tiene acceso a todos los repositorios necesarios (`uow.pedidos`, `uow.pagos`, `uow.productos`, `uow.usuarios`). Las queries de métricas leen cross-módulo a través del UoW sin romper el flujo unidireccional.

## Goals / Non-Goals

**Goals:**
- Implementar `GET /api/v1/admin/metricas` que agregue KPIs desde pedidos, pagos y productos.
- Implementar `PATCH /api/v1/admin/productos/{id}/stock` para que el rol STOCK actualice `stock_cantidad`.
- Agregar `uow.admin: AdminRepository` al UoW.
- Registrar `admin_router` en `main.py`.

**Non-Goals:**
- No se crean modelos nuevos ni migraciones Alembic.
- No se implementa paginación en métricas (respuesta única).
- No se crea lógica de pedidos ni de pagos adicional — se reutilizan los repos existentes.
- CH-15 (frontend dashboard) queda fuera de scope.

## Decisions

**D1 — AdminRepository con queries raw SQL via `text()`**

Las métricas requieren agregaciones multi-tabla (SUM, COUNT, GROUP BY). Hacerlo con SQLModel ORM implica múltiples queries y joins complejos. Se opta por queries SQL con `sqlalchemy.text()` ejecutadas desde `AdminRepository`, consistente con el patrón del proyecto (el repositorio es la única capa que toca BD).

Alternativa descartada: queries ORM en el service — viola la regla de acceso a BD solo en repository.

**D2 — Un único endpoint `GET /admin/metricas`**

Se devuelve un único `MetricasRead` con todos los KPIs en lugar de endpoints separados (metricas/ventas, metricas/stock, etc.). El frontend consume todo en una llamada para el dashboard. Si en el futuro se necesita granularidad, se puede extender el schema.

**D3 — `PATCH /admin/productos/{id}/stock` en admin module**

El endpoint de stock no se añade al router de productos (módulo CH-05 ya archivado) sino al admin module, que es el responsable de las operaciones de gestión. Usa `uow.productos.get_by_id()` + update directo en service — el ProductoRepository ya tiene `update()` heredado de BaseRepository.

**D4 — AdminRepository no hereda BaseRepository[T]**

El AdminRepository no es un repositorio de una entidad única (es read-only, cross-module). Tiene solo métodos de query de agregación y no necesita los métodos CRUD genéricos. Se define como clase standalone con `session` inyectado por constructor.

## Risks / Trade-offs

- [Queries raw SQL frágiles ante renombrado de tablas] → Mitigación: los nombres de tabla en SQLModel son estables y están definidos en `__tablename__`; documentar en los queries cuál tabla referencian.
- [Métricas no paginadas pueden ser lentas con muchos datos] → Mitigación: scope del proyecto es académico con datos seed; en producción se agregarían filtros de rango de fechas.
- [stock_cantidad puede quedar negativo si no se valida] → Mitigación: el schema de request valida `ge=0`.
