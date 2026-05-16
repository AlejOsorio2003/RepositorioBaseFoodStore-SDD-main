from fastapi import APIRouter, Depends

from app.core.dependencies import get_uow, require_role
from app.core.uow import UnitOfWork
from app.usuarios.schemas import (
    PaginatedUsuarios,
    UsuarioRead,
    UsuarioUpdate,
    UsuarioUpdateEstado,
)
from app.usuarios.service import UsuarioService

router = APIRouter()


@router.get("/", response_model=PaginatedUsuarios)
def list_usuarios(
    page: int = 1,
    size: int = 20,
    search: str | None = None,
    rol: str | None = None,
    activo: bool | None = None,
    uow: UnitOfWork = Depends(get_uow),
    current_user: None = Depends(require_role(["ADMIN"])),
):
    return UsuarioService.list_usuarios(uow, page, size, search, rol, activo)


@router.put("/{usuario_id}", response_model=UsuarioRead)
def update_usuario(
    usuario_id: int,
    data: UsuarioUpdate,
    uow: UnitOfWork = Depends(get_uow),
    current_user=Depends(require_role(["ADMIN"])),
):
    return UsuarioService.update_usuario(uow, usuario_id, data, current_user.id)


@router.patch("/{usuario_id}/estado", response_model=UsuarioRead)
def toggle_estado(
    usuario_id: int,
    data: UsuarioUpdateEstado,
    uow: UnitOfWork = Depends(get_uow),
    current_user=Depends(require_role(["ADMIN"])),
):
    return UsuarioService.toggle_estado(uow, usuario_id, data, current_user.id)
