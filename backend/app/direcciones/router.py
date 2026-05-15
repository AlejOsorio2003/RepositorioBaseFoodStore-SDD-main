from typing import Optional

from fastapi import APIRouter, Depends, status

from app.auth.models import Usuario
from app.core.dependencies import get_current_user, get_uow
from app.core.uow import UnitOfWork
from app.direcciones import service
from app.direcciones.schemas import (
    DireccionCreate,
    DireccionRead,
    DireccionUpdate,
)

router = APIRouter(prefix="/api/v1/direcciones", tags=["direcciones"])


@router.get("/", response_model=list[DireccionRead])
def list_direcciones(
    usuario_id: Optional[int] = None,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_user),
) -> list[DireccionRead]:
    return service.listar(uow, current_user, usuario_id)


@router.post("/", response_model=DireccionRead, status_code=status.HTTP_201_CREATED)
def create_direccion(
    data: DireccionCreate,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_user),
) -> DireccionRead:
    return service.crear(uow, data, current_user)


@router.get("/{id}", response_model=DireccionRead)
def get_direccion(
    id: int,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_user),
) -> DireccionRead:
    return service.obtener(uow, id, current_user)


@router.put("/{id}", response_model=DireccionRead)
def update_direccion(
    id: int,
    data: DireccionUpdate,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_user),
) -> DireccionRead:
    return service.actualizar(uow, id, data, current_user)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_direccion(
    id: int,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_user),
) -> None:
    service.eliminar(uow, id, current_user)


@router.patch("/{id}/principal", response_model=DireccionRead)
def mark_principal(
    id: int,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_user),
) -> DireccionRead:
    return service.marcar_principal(uow, id, current_user)
