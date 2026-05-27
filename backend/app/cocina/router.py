from fastapi import APIRouter, Depends

from app.auth.models import Usuario
from app.cocina import service
from app.cocina.schemas import CocinaEstadoRequest, PedidoCocinaSummary
from app.core.dependencies import get_uow, require_role
from app.core.uow import UnitOfWork
from app.pedidos.schemas import PedidoRead

router = APIRouter()


@router.get("/pedidos", response_model=list[PedidoCocinaSummary])
def listar_pedidos_cocina(
    current_user: Usuario = Depends(require_role(["COCINA"])),
    uow: UnitOfWork = Depends(get_uow),
) -> list[PedidoCocinaSummary]:
    return service.listar_pedidos(uow)


@router.patch("/pedidos/{pedido_id}/estado", response_model=PedidoRead)
def avanzar_estado_cocina(
    pedido_id: int,
    data: CocinaEstadoRequest,
    current_user: Usuario = Depends(require_role(["COCINA"])),
    uow: UnitOfWork = Depends(get_uow),
) -> PedidoRead:
    return service.avanzar_estado_cocina(pedido_id, data, uow, current_user.id)
