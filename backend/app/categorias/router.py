from fastapi import APIRouter, Depends, status

from app.categorias import service
from app.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
    CategoriaWithChildren,
)
from app.core.dependencies import get_uow, require_role
from app.core.uow import UnitOfWork

router = APIRouter()


@router.get("/", response_model=list[CategoriaRead])
def list_categorias(uow: UnitOfWork = Depends(get_uow)) -> list[CategoriaRead]:
    return service.list_categorias(uow)


@router.get("/{id}", response_model=CategoriaWithChildren)
def get_categoria(
    id: int,
    uow: UnitOfWork = Depends(get_uow),
) -> CategoriaWithChildren:
    return service.get_categoria(id, uow)


@router.post("/", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def create_categoria(
    data: CategoriaCreate,
    uow: UnitOfWork = Depends(get_uow),
    _admin=Depends(require_role(["ADMIN"])),
) -> CategoriaRead:
    return service.create_categoria(data, uow)


@router.patch("/{id}", response_model=CategoriaRead)
def update_categoria(
    id: int,
    data: CategoriaUpdate,
    uow: UnitOfWork = Depends(get_uow),
    _admin=Depends(require_role(["ADMIN"])),
) -> CategoriaRead:
    return service.update_categoria(id, data, uow)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_categoria(
    id: int,
    uow: UnitOfWork = Depends(get_uow),
    _admin=Depends(require_role(["ADMIN"])),
) -> None:
    service.delete_categoria(id, uow)
