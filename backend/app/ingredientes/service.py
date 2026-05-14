from fastapi import HTTPException, status

from app.core.uow import UnitOfWork
from app.ingredientes.models import Ingrediente
from app.ingredientes.repository import IngredienteRepository
from app.ingredientes.schemas import (
    IngredienteCreate,
    IngredienteRead,
    IngredienteUpdate,
)


def _get_repo(uow: UnitOfWork) -> IngredienteRepository:
    """Helper para obtener el repositorio tipado."""
    repo: IngredienteRepository = uow.ingredientes  # type: ignore[assignment]
    return repo


def listar(uow: UnitOfWork, skip: int = 0, limit: int = 100) -> list[IngredienteRead]:
    repo = _get_repo(uow)
    ingredientes = repo.list_all(skip, limit)
    return [_to_read(i) for i in ingredientes]


def listar_alergenos(uow: UnitOfWork) -> list[IngredienteRead]:
    repo = _get_repo(uow)
    ingredientes = repo.list_alergenos()
    return [_to_read(i) for i in ingredientes]


def obtener(uow: UnitOfWork, id: int) -> IngredienteRead:
    repo = _get_repo(uow)
    ingrediente = repo.get_by_id(id)
    if not ingrediente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingrediente no encontrado",
        )
    return _to_read(ingrediente)


def crear(uow: UnitOfWork, data: IngredienteCreate) -> IngredienteRead:
    repo = _get_repo(uow)

    existing = repo.get_by_nombre(data.nombre)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un ingrediente con el nombre '{data.nombre}'",
        )

    ingrediente = Ingrediente(nombre=data.nombre, es_alergeno=data.es_alergeno)
    repo.create(ingrediente)
    return _to_read(ingrediente)


def actualizar(uow: UnitOfWork, id: int, data: IngredienteUpdate) -> IngredienteRead:
    repo = _get_repo(uow)

    ingrediente = repo.get_by_id(id)
    if not ingrediente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingrediente no encontrado",
        )

    update_data = data.model_dump(exclude_unset=True)

    # Validar nombre único si se está actualizando
    if "nombre" in update_data:
        existing = repo.get_by_nombre(update_data["nombre"])
        if existing and existing.id != id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe otro ingrediente con el nombre '{update_data['nombre']}'",
            )

    updated = repo.update(id, update_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingrediente no encontrado",
        )
    return _to_read(updated)


def eliminar(uow: UnitOfWork, id: int) -> None:
    repo = _get_repo(uow)

    ingrediente = repo.get_by_id(id)
    if not ingrediente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingrediente no encontrado",
        )

    if repo.has_productos_asociados(id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar el ingrediente porque tiene productos asociados",
        )

    repo.hard_delete(id)


def _to_read(i: Ingrediente) -> IngredienteRead:
    return IngredienteRead(
        id=i.id,
        nombre=i.nombre,
        es_alergeno=i.es_alergeno,
        created_at=i.created_at,
    )
