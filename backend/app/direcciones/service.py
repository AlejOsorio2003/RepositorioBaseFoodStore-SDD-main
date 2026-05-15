from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status

from app.auth.models import Usuario
from app.core.uow import UnitOfWork
from app.direcciones.models import DireccionEntrega
from app.direcciones.repository import DireccionRepository
from app.direcciones.schemas import (
    DireccionCreate,
    DireccionRead,
    DireccionUpdate,
)


def _get_repo(uow: UnitOfWork) -> DireccionRepository:
    """Helper para obtener el repositorio tipado."""
    repo: DireccionRepository = uow.direcciones  # type: ignore[assignment]
    return repo


def _to_read(dir: DireccionEntrega) -> DireccionRead:
    return DireccionRead(
        id=dir.id,
        usuario_id=dir.usuario_id,
        calle=dir.calle,
        numero=dir.numero,
        piso=dir.piso,
        departamento=dir.departamento,
        ciudad=dir.ciudad,
        provincia=dir.provincia,
        codigo_postal=dir.codigo_postal,
        es_principal=dir.es_principal,
        created_at=dir.created_at,
    )


def listar(
    uow: UnitOfWork,
    current_user: Usuario,
    usuario_id_param: Optional[int] = None,
) -> list[DireccionRead]:
    repo = _get_repo(uow)
    is_admin = current_user.rol == "ADMIN" if hasattr(current_user, "rol") else False
    if is_admin and usuario_id_param is not None:
        direcciones = repo.list_by_usuario(usuario_id_param)
    else:
        direcciones = repo.list_by_usuario(current_user.id)
    return [_to_read(d) for d in direcciones]


def obtener(uow: UnitOfWork, id: int, current_user: Usuario) -> DireccionRead:
    repo = _get_repo(uow)
    direccion = repo.get_by_id(id)
    if not direccion or direccion.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dirección no encontrada",
        )
    is_admin = current_user.rol == "ADMIN" if hasattr(current_user, "rol") else False
    if direccion.usuario_id != current_user.id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para acceder a esta dirección",
        )
    return _to_read(direccion)


def crear(
    uow: UnitOfWork,
    data: DireccionCreate,
    current_user: Usuario,
) -> DireccionRead:
    repo = _get_repo(uow)
    es_principal = repo.count_activas(current_user.id) == 0
    direccion = DireccionEntrega(
        usuario_id=current_user.id,
        calle=data.calle,
        numero=data.numero,
        piso=data.piso,
        departamento=data.departamento,
        ciudad=data.ciudad,
        provincia=data.provincia,
        codigo_postal=data.codigo_postal,
        es_principal=es_principal,
    )
    repo.create(direccion)
    return _to_read(direccion)


def actualizar(
    uow: UnitOfWork,
    id: int,
    data: DireccionUpdate,
    current_user: Usuario,
) -> DireccionRead:
    repo = _get_repo(uow)
    direccion = repo.get_by_id(id)
    if not direccion or direccion.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dirección no encontrada",
        )
    is_admin = current_user.rol == "ADMIN" if hasattr(current_user, "rol") else False
    if direccion.usuario_id != current_user.id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para actualizar esta dirección",
        )
    update_data = data.model_dump(exclude_unset=True)
    updated = repo.update(id, update_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dirección no encontrada",
        )
    return _to_read(updated)


def eliminar(uow: UnitOfWork, id: int, current_user: Usuario) -> None:
    repo = _get_repo(uow)
    direccion = repo.get_by_id(id)
    if not direccion or direccion.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dirección no encontrada",
        )
    is_admin = current_user.rol == "ADMIN" if hasattr(current_user, "rol") else False
    if direccion.usuario_id != current_user.id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar esta dirección",
        )
    if direccion.es_principal:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No se puede eliminar la dirección principal",
        )
    direccion.deleted_at = datetime.now(timezone.utc)
    uow.session.add(direccion)


def marcar_principal(
    uow: UnitOfWork,
    id: int,
    current_user: Usuario,
) -> DireccionRead:
    repo = _get_repo(uow)
    direccion = repo.get_by_id(id)
    if not direccion or direccion.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dirección no encontrada",
        )
    is_admin = current_user.rol == "ADMIN" if hasattr(current_user, "rol") else False
    if direccion.usuario_id != current_user.id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar esta dirección",
        )
    repo.clear_principal(current_user.id)
    direccion.es_principal = True
    uow.session.add(direccion)
    return _to_read(direccion)
