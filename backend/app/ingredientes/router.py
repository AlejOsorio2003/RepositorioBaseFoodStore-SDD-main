from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_uow, require_role
from app.core.uow import UnitOfWork
from app.ingredientes import service
from app.ingredientes.schemas import (
    IngredienteCreate,
    IngredienteRead,
    IngredienteUpdate,
)

router = APIRouter(prefix="/api/v1/ingredientes", tags=["ingredientes"])


@router.get("/", response_model=list[IngredienteRead])
def list_ingredientes(
    skip: int = 0,
    limit: int = 100,
    solo_alergenos: bool = False,
    uow: UnitOfWork = Depends(get_uow),
) -> list[IngredienteRead]:
    if solo_alergenos:
        return service.listar_alergenos(uow)
    return service.listar(uow, skip, limit)


@router.get("/{id}", response_model=IngredienteRead)
def get_ingrediente(
    id: int,
    uow: UnitOfWork = Depends(get_uow),
) -> IngredienteRead:
    return service.obtener(uow, id)


@router.post("/", response_model=IngredienteRead, status_code=status.HTTP_201_CREATED)
def create_ingrediente(
    data: IngredienteCreate,
    uow: UnitOfWork = Depends(get_uow),
    _admin=Depends(require_role(["ADMIN"])),
) -> IngredienteRead:
    return service.crear(uow, data)


@router.patch("/{id}", response_model=IngredienteRead)
def update_ingrediente(
    id: int,
    data: IngredienteUpdate,
    uow: UnitOfWork = Depends(get_uow),
    _admin=Depends(require_role(["ADMIN"])),
) -> IngredienteRead:
    return service.actualizar(uow, id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ingrediente(
    id: int,
    uow: UnitOfWork = Depends(get_uow),
    _admin=Depends(require_role(["ADMIN"])),
) -> None:
    service.eliminar(uow, id)
