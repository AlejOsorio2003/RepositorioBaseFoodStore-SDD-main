from typing import Optional

from sqlalchemy import func, or_
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.auth.models import Rol, Usuario, UsuarioRol
from app.core.repository import BaseRepository


class UsuarioRepository(BaseRepository[Usuario]):

    def get_by_email(self, email: str) -> Optional[Usuario]:
        query = (
            select(Usuario)
            .where(Usuario.email == email)
            .options(selectinload(Usuario.roles).selectinload(UsuarioRol.rol))
        )
        return self.session.exec(query).first()

    def get_by_id_with_roles(self, usuario_id: int) -> Optional[Usuario]:
        query = (
            select(Usuario)
            .where(Usuario.id == usuario_id)
            .options(selectinload(Usuario.roles).selectinload(UsuarioRol.rol))
        )
        return self.session.exec(query).first()

    def list_paginated(
        self,
        page: int,
        size: int,
        search: Optional[str] = None,
        rol: Optional[str] = None,
        activo: Optional[bool] = None,
    ) -> tuple[list[Usuario], int]:
        # Build base query
        query = select(Usuario).where(Usuario.deleted_at.is_(None))

        # Search filter: ILIKE on nombre, apellido, email
        if search:
            query = query.where(
                or_(
                    Usuario.nombre.ilike(f"%{search}%"),
                    Usuario.apellido.ilike(f"%{search}%"),
                    Usuario.email.ilike(f"%{search}%"),
                )
            )

        # Role filter: join via UsuarioRol → Rol
        if rol:
            query = (
                query.join(Usuario.roles)
                .join(UsuarioRol.rol)
                .where(Rol.nombre == rol)
            )

        # Active filter
        if activo is not None:
            query = query.where(Usuario.is_active == activo)

        # Count total (before pagination)
        count_query = select(func.count()).select_from(Usuario)
        # Re-apply same WHERE clauses
        count_query = count_query.where(Usuario.deleted_at.is_(None))
        if search:
            count_query = count_query.where(
                or_(
                    Usuario.nombre.ilike(f"%{search}%"),
                    Usuario.apellido.ilike(f"%{search}%"),
                    Usuario.email.ilike(f"%{search}%"),
                )
            )
        if rol:
            count_query = (
                count_query.join(Usuario.roles)
                .join(UsuarioRol.rol)
                .where(Rol.nombre == rol)
            )
        if activo is not None:
            count_query = count_query.where(Usuario.is_active == activo)

        total = self.session.exec(count_query).one()

        # Apply pagination and eager load roles
        query = query.options(selectinload(Usuario.roles).selectinload(UsuarioRol.rol))
        query = query.offset((page - 1) * size).limit(size)
        items = list(self.session.exec(query).all())

        return items, total
