from fastapi import HTTPException, status

from app.admin.repository import AdminRepository
from app.admin.schemas import MetricasRead, StockUpdate, TopProductoRead
from app.core.uow import UnitOfWork


def get_metricas(uow: UnitOfWork) -> MetricasRead:
    admin_repo: AdminRepository = uow.admin  # type: ignore[assignment]
    total_ventas = admin_repo.get_total_ventas()
    pedidos_por_estado = admin_repo.get_pedidos_por_estado()
    productos_stock_bajo = admin_repo.get_productos_stock_bajo()
    top_productos_raw = admin_repo.get_top_productos()

    top_productos = [TopProductoRead(**p) for p in top_productos_raw]

    return MetricasRead(
        total_ventas=total_ventas,
        pedidos_por_estado=pedidos_por_estado,
        productos_stock_bajo=productos_stock_bajo,
        top_productos=top_productos,
    )


def actualizar_stock(uow: UnitOfWork, producto_id: int, data: StockUpdate) -> "ProductoRead":
    from app.productos.schemas import ProductoRead

    producto = uow.productos.get_by_id(producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    updated = uow.productos.update(producto_id, {"stock_cantidad": data.stock_cantidad})
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    return ProductoRead.model_validate(updated, from_attributes=True)
