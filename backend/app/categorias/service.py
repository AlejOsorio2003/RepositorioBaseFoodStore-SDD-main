from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.categorias.models import Categoria
from app.categorias.repository import CategoriaRepository
from app.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
    CategoriaWithChildren,
)
from app.core.uow import UnitOfWork


def _get_repo(uow: UnitOfWork) -> CategoriaRepository:
    """Helper para obtener el repositorio tipado."""
    repo: CategoriaRepository = uow.categorias  # type: ignore[assignment]
    return repo


def list_categorias(uow: UnitOfWork) -> list[CategoriaRead]:
    repo = _get_repo(uow)
    categorias = repo.get_all_active()
    return [_categoria_to_read(c) for c in categorias]


def get_categoria(id: int, uow: UnitOfWork) -> CategoriaWithChildren:
    repo = _get_repo(uow)
    categoria = repo.get_active_by_id(id)
    if not categoria:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")

    hijos = repo.get_children(id)
    return CategoriaWithChildren(
        id=categoria.id,
        nombre=categoria.nombre,
        slug=categoria.slug,
        parent_id=categoria.parent_id,
        created_at=categoria.created_at,
        hijos=[_categoria_to_read(h) for h in hijos],
    )


def create_categoria(data: CategoriaCreate, uow: UnitOfWork) -> CategoriaRead:
    repo = _get_repo(uow)

    # Validar slug único
    existing = repo.get_by_slug(data.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe una categoría con el slug '{data.slug}'",
        )

    # Validar que parent_id existe si se especifica
    if data.parent_id is not None:
        parent = repo.get_active_by_id(data.parent_id)
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"La categoría padre con id {data.parent_id} no existe",
            )

    categoria = Categoria(
        nombre=data.nombre,
        slug=data.slug,
        parent_id=data.parent_id,
    )
    repo.create(categoria)
    return _categoria_to_read(categoria)


def update_categoria(id: int, data: CategoriaUpdate, uow: UnitOfWork) -> CategoriaRead:
    repo = _get_repo(uow)

    categoria = repo.get_active_by_id(id)
    if not categoria:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")

    update_data = data.model_dump(exclude_unset=True)

    # Validar slug único si se está actualizando
    if "slug" in update_data:
        existing = repo.get_by_slug(update_data["slug"])
        if existing and existing.id != id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe otra categoría con el slug '{update_data['slug']}'",
            )

    # Validar parent_id si se está actualizando
    if "parent_id" in update_data and update_data["parent_id"] is not None:
        parent = repo.get_active_by_id(update_data["parent_id"])
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"La categoría padre con id {update_data['parent_id']} no existe",
            )

        # Validar anti-ciclo: el nuevo padre no puede ser descendiente de esta categoría
        descendants = repo.get_descendants(id)
        descendant_ids = {d.id for d in descendants}
        if update_data["parent_id"] in descendant_ids:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No se puede asignar como padre un descendiente de la propia categoría (referencia circular)",
            )

    updated = repo.update(id, update_data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    return _categoria_to_read(updated)


def delete_categoria(id: int, uow: UnitOfWork) -> None:
    repo = _get_repo(uow)

    categoria = repo.get_active_by_id(id)
    if not categoria:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")

    # Validar que no tenga hijos activos
    children = repo.get_children(id)
    if children:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar la categoría porque tiene subcategorías activas",
        )

    # Validar que no tenga productos activos asociados
    if repo.has_active_products(id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar la categoría porque tiene productos activos asociados",
        )

    repo.soft_delete(id)


def _categoria_to_read(c: Categoria) -> CategoriaRead:
    return CategoriaRead(
        id=c.id,
        nombre=c.nombre,
        slug=c.slug,
        parent_id=c.parent_id,
        created_at=c.created_at,
    )
