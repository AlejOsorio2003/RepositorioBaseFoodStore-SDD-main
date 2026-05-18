## ADDED Requirements

### Requirement: Admin puede consultar métricas del dashboard
El sistema SHALL exponer `GET /api/v1/admin/metricas` accesible solo para el rol ADMIN, que devuelva un objeto `MetricasRead` con KPIs agregados del negocio.

El schema `MetricasRead` SHALL incluir:
- `total_ventas: Decimal` — suma de `monto` de todos los pagos con `estado = "approved"`.
- `pedidos_por_estado: dict[str, int]` — count de pedidos agrupados por `estado_codigo`.
- `productos_stock_bajo: int` — cantidad de productos con `stock_cantidad < 5` y `deleted_at IS NULL`.
- `top_productos: list[TopProductoRead]` — top 5 productos más vendidos (por suma de `cantidad` en `DetallePedido`), con `producto_id`, `nombre` y `total_vendido: int`.

`TopProductoRead` SHALL incluir campos: `producto_id: int`, `nombre: str`, `total_vendido: int`.

#### Scenario: ADMIN obtiene métricas con datos
- **WHEN** un usuario con rol ADMIN hace `GET /api/v1/admin/metricas`
- **THEN** el sistema devuelve HTTP 200 con `MetricasRead` con todos los campos poblados

#### Scenario: Usuario sin rol ADMIN es rechazado
- **WHEN** un usuario con rol CLIENT, STOCK o PEDIDOS hace `GET /api/v1/admin/metricas`
- **THEN** el sistema devuelve HTTP 403 Forbidden

#### Scenario: Sin datos de ventas aún
- **WHEN** no hay pagos approved y se consultan métricas
- **THEN** `total_ventas` es `0`, `pedidos_por_estado` puede ser vacío o con estados en 0, `top_productos` es lista vacía

---

### Requirement: Gestor de Stock puede actualizar stock_cantidad
El sistema SHALL exponer `PATCH /api/v1/admin/productos/{id}/stock` accesible para roles ADMIN y STOCK, que actualice el campo `stock_cantidad` del producto.

El body SHALL ser `StockUpdate` con campo `stock_cantidad: int` con validación `ge=0`.
La respuesta SHALL ser HTTP 200 con `ProductoRead`.
Si el producto no existe SHALL devolver HTTP 404.

#### Scenario: STOCK actualiza stock_cantidad exitosamente
- **WHEN** un usuario con rol STOCK hace `PATCH /api/v1/admin/productos/{id}/stock` con `{"stock_cantidad": 20}`
- **THEN** el sistema actualiza el campo y devuelve HTTP 200 con el producto actualizado

#### Scenario: ADMIN actualiza stock_cantidad exitosamente
- **WHEN** un usuario con rol ADMIN hace `PATCH /api/v1/admin/productos/{id}/stock` con `{"stock_cantidad": 0}`
- **THEN** el sistema actualiza el campo y devuelve HTTP 200 con `stock_cantidad: 0`

#### Scenario: stock_cantidad negativo es rechazado
- **WHEN** se envía `{"stock_cantidad": -1}`
- **THEN** el sistema devuelve HTTP 422 Unprocessable Entity

#### Scenario: Producto no existe
- **WHEN** se hace PATCH sobre un `id` inexistente
- **THEN** el sistema devuelve HTTP 404 Not Found

#### Scenario: CLIENT intenta actualizar stock
- **WHEN** un usuario con rol CLIENT hace la petición
- **THEN** el sistema devuelve HTTP 403 Forbidden
