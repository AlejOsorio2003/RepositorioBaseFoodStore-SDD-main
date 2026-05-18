## 1. Schemas

- [ ] 1.1 Reemplazar `MetricasRead(BaseModel): pass` en `backend/app/admin/schemas.py` con `TopProductoRead` (producto_id, nombre, total_vendido) y `MetricasRead` (total_ventas, pedidos_por_estado, productos_stock_bajo, top_productos)
- [ ] 1.2 Agregar `StockUpdate(BaseModel)` con campo `stock_cantidad: int` y validación `ge=0`

## 2. Repository

- [ ] 2.1 Implementar `AdminRepository.__init__(self, session)` en `backend/app/admin/repository.py` (clase standalone, no hereda BaseRepository)
- [ ] 2.2 Implementar `get_total_ventas(self) -> Decimal` — `SELECT SUM(monto) FROM pago WHERE estado = 'approved'`
- [ ] 2.3 Implementar `get_pedidos_por_estado(self) -> dict[str, int]` — `SELECT estado_codigo, COUNT(*) FROM pedido GROUP BY estado_codigo`
- [ ] 2.4 Implementar `get_productos_stock_bajo(self, threshold: int = 5) -> int` — `SELECT COUNT(*) FROM producto WHERE stock_cantidad < threshold AND deleted_at IS NULL`
- [ ] 2.5 Implementar `get_top_productos(self, limit: int = 5) -> list[dict]` — JOIN entre `detalle_pedido` y `producto`, GROUP BY producto_id, ORDER BY SUM(cantidad) DESC, LIMIT

## 3. Service

- [ ] 3.1 Implementar función `get_metricas(uow: UnitOfWork) -> MetricasRead` en `backend/app/admin/service.py` — llama a los 4 métodos del repository y construye `MetricasRead`
- [ ] 3.2 Implementar función `actualizar_stock(uow: UnitOfWork, producto_id: int, data: StockUpdate) -> ProductoRead` — obtiene producto con `uow.productos.get_by_id()`, lanza 404 si no existe, actualiza `stock_cantidad`, llama `uow.productos.update()`

## 4. Router

- [ ] 4.1 Implementar `GET /` con `response_model=MetricasRead` en `backend/app/admin/router.py`, protegido con `require_role(["ADMIN"])`, delega a `service.get_metricas(uow)`
- [ ] 4.2 Implementar `PATCH /productos/{producto_id}/stock` con `response_model=ProductoRead`, protegido con `require_role(["ADMIN", "STOCK"])`, delega a `service.actualizar_stock(uow, producto_id, data)`

## 5. Wiring

- [ ] 5.1 Agregar `uow.admin: AdminRepository` en `backend/app/core/uow.py` → importar `AdminRepository` y asignar en `_init_repositories`
- [ ] 5.2 Registrar `admin_router` en `backend/app/main.py` con prefijo `/api/v1/admin` y tag `admin`

## 6. Verificación

- [ ] 6.1 `GET /api/v1/admin/metricas` con token ADMIN → HTTP 200 con `total_ventas`, `pedidos_por_estado`, `productos_stock_bajo`, `top_productos`
- [ ] 6.2 `GET /api/v1/admin/metricas` con token CLIENT → HTTP 403
- [ ] 6.3 `PATCH /api/v1/admin/productos/{id}/stock` con `{"stock_cantidad": 50}` y token STOCK → HTTP 200 con campo actualizado
- [ ] 6.4 `PATCH /api/v1/admin/productos/{id}/stock` con `{"stock_cantidad": -1}` → HTTP 422
- [ ] 6.5 `PATCH /api/v1/admin/productos/9999/stock` con token ADMIN → HTTP 404
- [ ] 6.6 `PATCH /api/v1/admin/productos/{id}/stock` con token CLIENT → HTTP 403
