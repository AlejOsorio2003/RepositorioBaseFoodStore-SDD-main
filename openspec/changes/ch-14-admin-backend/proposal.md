## Why

Con CH-10 (pedidos FSM), CH-12 (pagos MercadoPago) y CH-09 (usuarios CRUD) implementados, el sistema ya genera datos de ventas, pedidos y stock. CH-14 agrega el módulo admin backend que expone esos datos como métricas consolidadas para el dashboard y añade el único endpoint pendiente del rol STOCK: actualizar `stock_cantidad` de productos.

## What Changes

- Implementar `backend/app/admin/` (schemas, repository, service, router) — actualmente son stubs vacíos.
- `GET /api/v1/admin/metricas` (ADMIN): devuelve KPIs agregados — ingresos totales, pedidos por estado, productos con stock bajo, top 5 productos más vendidos.
- `PATCH /api/v1/admin/productos/{id}/stock` (ADMIN, STOCK): actualiza `stock_cantidad` de un producto. Cubre el caso de uso de Gestor de Stock (spec §3 — "actualizar stock_cantidad y disponible") que quedó fuera de CH-05.
- Registrar `admin_router` en `main.py` con prefijo `/api/v1/admin`.

## Capabilities

### New Capabilities

- `admin-backend`: Módulo admin del backend — métricas de dashboard (ventas, pedidos, stock crítico, top productos) y actualización de stock_cantidad para el rol STOCK.

### Modified Capabilities

## Impact

- `backend/app/admin/schemas.py` — reemplazar stub `MetricasRead` con schemas completos
- `backend/app/admin/repository.py` — reemplazar stub con queries de agregación
- `backend/app/admin/service.py` — reemplazar stub con funciones de negocio
- `backend/app/admin/router.py` — implementar 2 endpoints
- `backend/app/core/uow.py` — agregar `admin: AdminRepository`
- `backend/app/main.py` — registrar `admin_router`
- No requiere migración Alembic (no hay modelos nuevos)
- No hay cambios breaking en APIs existentes
