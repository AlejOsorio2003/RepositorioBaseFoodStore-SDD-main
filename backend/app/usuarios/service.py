from fastapi import HTTPException, status
from sqlmodel import select

from app.auth.models import Rol, Usuario, UsuarioRol
from app.core.security import hash_password, verify_password
from app.core.uow import UnitOfWork
from app.refreshtokens.models import RefreshToken
from app.usuarios.schemas import (
    CambiarPasswordRequest,
    PaginatedUsuarios,
    PerfilUpdate,
    UsuarioRead,
    UsuarioUpdate,
    UsuarioUpdateEstado,
)


class UsuarioService:

    @staticmethod
    def get_me(uow: UnitOfWork, usuario_id: int) -> UsuarioRead:
        usuario = uow.usuarios.get_by_id_with_roles(usuario_id)
        if not usuario or usuario.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        return _usuario_to_read(usuario)

    @staticmethod
    def update_me(uow: UnitOfWork, usuario_id: int, data: PerfilUpdate) -> UsuarioRead:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if not usuario or usuario.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            result = uow.usuarios.update(usuario_id, update_data)
            if not result:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

        # Recargar con roles
        usuario_actualizado = uow.usuarios.get_by_id_with_roles(usuario_id)
        return _usuario_to_read(usuario_actualizado)

    @staticmethod
    def change_password(uow: UnitOfWork, usuario_id: int, data: CambiarPasswordRequest) -> None:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if not usuario or usuario.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

        if not verify_password(data.password_actual, usuario.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="INVALID_CURRENT_PASSWORD",
            )

        # Hashear nueva contraseña
        uow.usuarios.update(usuario_id, {"password_hash": hash_password(data.password_nueva)})

        # Invalidar todos los refresh tokens del usuario
        _invalidar_refresh_tokens(uow, usuario_id)

    @staticmethod
    def list_usuarios(
        uow: UnitOfWork,
        page: int = 1,
        size: int = 20,
        search: str | None = None,
        rol: str | None = None,
        activo: bool | None = None,
    ) -> PaginatedUsuarios:
        items, total = uow.usuarios.list_paginated(page, size, search, rol, activo)
        return PaginatedUsuarios(
            items=[_usuario_to_read(u) for u in items],
            total=total,
            page=page,
            size=size,
        )

    @staticmethod
    def update_usuario(
        uow: UnitOfWork,
        usuario_id: int,
        data: UsuarioUpdate,
        current_user_id: int,
    ) -> UsuarioRead:
        usuario = uow.usuarios.get_by_id_with_roles(usuario_id)
        if not usuario or usuario.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

        update_data = data.model_dump(exclude_unset=True)
        roles_nuevos = update_data.pop("roles", None)

        # Actualizar datos básicos
        if update_data:
            uow.usuarios.update(usuario_id, update_data)

        # Actualizar roles si se especificaron
        if roles_nuevos is not None:
            _actualizar_roles(uow, usuario, roles_nuevos, current_user_id)
            # Invalidar refresh tokens si los roles cambiaron
            _invalidar_refresh_tokens(uow, usuario_id)

        uow.session.expire_all()
        usuario_actualizado = uow.usuarios.get_by_id_with_roles(usuario_id)
        return _usuario_to_read(usuario_actualizado)

    @staticmethod
    def toggle_estado(
        uow: UnitOfWork,
        usuario_id: int,
        data: UsuarioUpdateEstado,
        current_user_id: int,
    ) -> UsuarioRead:
        usuario = uow.usuarios.get_by_id_with_roles(usuario_id)
        if not usuario or usuario.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

        # Si se desactiva, verificar LAST_ADMIN
        if not data.activo and _es_admin(usuario):
            _verificar_last_admin(uow, usuario_id, current_user_id)

        uow.usuarios.update(usuario_id, {"is_active": data.activo})

        # Invalidar refresh tokens si se desactiva
        if not data.activo:
            _invalidar_refresh_tokens(uow, usuario_id)

        usuario_actualizado = uow.usuarios.get_by_id_with_roles(usuario_id)
        return _usuario_to_read(usuario_actualizado)


# --- Helper functions ---

def _usuario_to_read(usuario: Usuario) -> UsuarioRead:
    return UsuarioRead(
        id=usuario.id,
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        email=usuario.email,
        telefono=usuario.telefono,
        is_active=usuario.is_active,
        roles=[ur.rol.nombre for ur in usuario.roles if ur.rol],
        created_at=usuario.created_at,
    )


def _invalidar_refresh_tokens(uow: UnitOfWork, usuario_id: int) -> None:
    """Elimina todos los refresh tokens activos de un usuario."""
    activos = uow.session.exec(
        select(RefreshToken).where(
            RefreshToken.usuario_id == usuario_id,
            RefreshToken.revoked_at.is_(None),
        )
    ).all()
    for t in activos:
        uow.session.delete(t)
    uow.session.flush()


def _actualizar_roles(uow: UnitOfWork, usuario: Usuario, roles_nuevos: list[str], current_user_id: int) -> None:
    """Reemplaza los roles del usuario con los nuevos."""
    # Verificar LAST_ADMIN si se está removiendo rol ADMIN de este usuario
    if _es_admin(usuario) and "ADMIN" not in roles_nuevos:
        _verificar_last_admin(uow, usuario.id, current_user_id)

    # Eliminar roles actuales
    for ur in list(usuario.roles):
        uow.session.delete(ur)
    uow.session.flush()

    # Asignar nuevos roles
    for nombre_rol in roles_nuevos:
        rol = uow.session.exec(
            select(Rol).where(Rol.nombre == nombre_rol)
        ).first()
        if rol:
            nuevo_ur = UsuarioRol(usuario_id=usuario.id, rol_id=rol.id)
            uow.session.add(nuevo_ur)
    uow.session.flush()


def _es_admin(usuario: Usuario) -> bool:
    return any(ur.rol.nombre == "ADMIN" for ur in usuario.roles if ur.rol)


def _verificar_last_admin(uow: UnitOfWork, usuario_id: int, current_user_id: int) -> None:
    """Verifica que no sea el último ADMIN. Si es self-desactivación, error."""
    if usuario_id == current_user_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="LAST_ADMIN",
        )

    # Contar cuántos admins activos hay
    from sqlmodel import func
    from app.auth.models import UsuarioRol, Rol

    count_admin = uow.session.exec(
        select(func.count(Rol.id)).where(
            Rol.nombre == "ADMIN",
            UsuarioRol.rol_id == Rol.id,
            UsuarioRol.usuario_id.isnot(None),
        )
    ).one()

    if count_admin <= 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="LAST_ADMIN",
        )
