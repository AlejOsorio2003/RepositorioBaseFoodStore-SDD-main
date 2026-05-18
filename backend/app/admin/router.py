from fastapi import APIRouter, Depends

from app.admin.schemas import MetricasRead, StockUpdate
from app.admin.service import actualizar_stock, get_metricas
from app.core.dependencies import get_uow, require_role
from app.core.uow import UnitOfWork
from app.productos.schemas import ProductoRead

router = APIRouter()


@router.get("/metricas", response_model=MetricasRead)
def obtener_metricas(
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN"])),
):
    return get_metricas(uow)


@router.patch("/productos/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock_endpoint(
    producto_id: int,
    data: StockUpdate,
    uow: UnitOfWork = Depends(get_uow),
    _=Depends(require_role(["ADMIN", "STOCK"])),
):
    return actualizar_stock(uow, producto_id, data)
