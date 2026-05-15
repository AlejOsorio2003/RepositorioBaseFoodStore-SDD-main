from typing import Optional

from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import get_uow, require_role
from app.core.uow import UnitOfWork
from app.productos import service
from app.productos.schemas import (
    DisponibilidadUpdate,
    IngredienteEnProductoRead,
    PaginatedProductos,
    ProductoCreate,
    ProductoDetail,
    ProductoIngredienteCreate,
    ProductoIngredienteRead,
    ProductoRead,
    ProductoUpdate,
)

router = APIRouter()


@router.get("/", response_model=PaginatedProductos)
def listar_productos(
    categoria_id: Optional[int] = Query(None),
    disponible: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    uow: UnitOfWork = Depends(get_uow),
) -> PaginatedProductos:
    return service.listar_productos(
        uow,
        categoria_id=categoria_id,
        disponible=disponible,
        search=search,
        page=page,
        size=size,
    )


@router.get("/{producto_id}", response_model=ProductoDetail)
def get_producto(
    producto_id: int,
    uow: UnitOfWork = Depends(get_uow),
) -> ProductoDetail:
    return service.get_producto(uow, producto_id)


@router.post("/", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(
    data: ProductoCreate,
    uow: UnitOfWork = Depends(get_uow),
    _admin=Depends(require_role(["ADMIN"])),
) -> ProductoRead:
    return service.crear_producto(uow, data)


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int,
    data: ProductoUpdate,
    uow: UnitOfWork = Depends(get_uow),
    _admin=Depends(require_role(["ADMIN"])),
) -> ProductoRead:
    return service.actualizar_producto(uow, producto_id, data)


@router.patch("/{producto_id}/disponibilidad", response_model=ProductoRead)
def cambiar_disponibilidad(
    producto_id: int,
    data: DisponibilidadUpdate,
    uow: UnitOfWork = Depends(get_uow),
    _admin_stock=Depends(require_role(["ADMIN", "STOCK"])),
) -> ProductoRead:
    return service.cambiar_disponibilidad(uow, producto_id, data)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _admin=Depends(require_role(["ADMIN"])),
) -> None:
    service.eliminar_producto(uow, producto_id)


@router.get("/{producto_id}/ingredientes", response_model=list[IngredienteEnProductoRead])
def listar_ingredientes_producto(
    producto_id: int,
    uow: UnitOfWork = Depends(get_uow),
) -> list[IngredienteEnProductoRead]:
    return service.listar_ingredientes_producto(uow, producto_id)


@router.post(
    "/{producto_id}/ingredientes",
    response_model=ProductoIngredienteRead,
    status_code=status.HTTP_201_CREATED,
)
def asociar_ingrediente(
    producto_id: int,
    data: ProductoIngredienteCreate,
    uow: UnitOfWork = Depends(get_uow),
    _admin=Depends(require_role(["ADMIN"])),
) -> ProductoIngredienteRead:
    return service.asociar_ingrediente(uow, producto_id, data)


@router.delete(
    "/{producto_id}/ingredientes/{ingrediente_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def quitar_ingrediente(
    producto_id: int,
    ingrediente_id: int,
    uow: UnitOfWork = Depends(get_uow),
    _admin=Depends(require_role(["ADMIN"])),
) -> None:
    service.quitar_ingrediente(uow, producto_id, ingrediente_id)
