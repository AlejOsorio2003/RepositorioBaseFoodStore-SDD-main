from fastapi import APIRouter, Depends, Query, status

from app.auth.models import Usuario
from app.core.dependencies import get_uow, require_role
from app.core.uow import UnitOfWork
from app.pedidos import service
from app.pedidos.schemas import (
    AvanzarEstadoRequest,
    CrearPedidoRequest,
    HistorialRead,
    PaginatedPedidos,
    PedidoDetail,
    PedidoRead,
)

router = APIRouter()


@router.post("/", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: CrearPedidoRequest,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(require_role(["CLIENTE"])),
) -> PedidoRead:
    return service.crear_pedido(uow, data, current_user.id)


@router.get("/", response_model=PaginatedPedidos)
def listar_pedidos(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    estado: str | None = None,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(require_role(["CLIENTE", "ADMIN", "GESTOR_PEDIDOS"])),
) -> PaginatedPedidos:
    user_roles = {ur.rol.nombre for ur in current_user.roles if ur.rol}
    rol = "CLIENTE"
    if "ADMIN" in user_roles:
        rol = "ADMIN"
    elif "GESTOR_PEDIDOS" in user_roles:
        rol = "GESTOR_PEDIDOS"
    return service.listar_pedidos(uow, current_user.id, rol, page, size, estado)


@router.get("/{pedido_id}", response_model=PedidoDetail)
def get_pedido(
    pedido_id: int,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(require_role(["CLIENTE", "ADMIN", "GESTOR_PEDIDOS"])),
) -> PedidoDetail:
    user_roles = {ur.rol.nombre for ur in current_user.roles if ur.rol}
    rol = "CLIENTE"
    if "ADMIN" in user_roles:
        rol = "ADMIN"
    elif "GESTOR_PEDIDOS" in user_roles:
        rol = "GESTOR_PEDIDOS"
    return service.get_pedido(uow, pedido_id, current_user.id, rol)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def avanzar_estado(
    pedido_id: int,
    data: AvanzarEstadoRequest,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(require_role(["ADMIN", "GESTOR_PEDIDOS"])),
) -> PedidoRead:
    return service.avanzar_estado(uow, pedido_id, data, current_user.id)


@router.get("/{pedido_id}/historial", response_model=list[HistorialRead])
def get_historial(
    pedido_id: int,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(require_role(["CLIENTE", "ADMIN", "GESTOR_PEDIDOS"])),
) -> list[HistorialRead]:
    user_roles = {ur.rol.nombre for ur in current_user.roles if ur.rol}
    rol = "CLIENTE"
    if "ADMIN" in user_roles:
        rol = "ADMIN"
    elif "GESTOR_PEDIDOS" in user_roles:
        rol = "GESTOR_PEDIDOS"
    return service.get_historial(uow, pedido_id, current_user.id, rol)


@router.delete("/{pedido_id}", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(require_role(["CLIENTE"])),
) -> PedidoRead:
    return service.cancelar_pedido(uow, pedido_id, current_user.id)
