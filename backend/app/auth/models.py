from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from app.core.base_model import SoftDeleteMixin, TimestampMixin

# Compatibilidad temporal — RefreshToken se movió a app.refreshtokens.models
from app.refreshtokens.models import RefreshToken  # noqa: F401


class Rol(TimestampMixin, table=True):
    __tablename__ = "roles"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=50, unique=True, nullable=False)
    descripcion: Optional[str] = Field(default=None, max_length=255)

    usuarios: list["UsuarioRol"] = Relationship(back_populates="rol")


class UsuarioRol(SQLModel, table=True):
    __tablename__ = "usuario_roles"

    usuario_id: Optional[int] = Field(
        default=None, foreign_key="usuarios.id", primary_key=True
    )
    rol_id: Optional[int] = Field(
        default=None, foreign_key="roles.id", primary_key=True
    )

    usuario: Optional["Usuario"] = Relationship(back_populates="roles")
    rol: Optional[Rol] = Relationship(back_populates="usuarios")


class Usuario(TimestampMixin, SoftDeleteMixin, table=True):
    __tablename__ = "usuarios"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(max_length=255, unique=True, nullable=False, index=True)
    password_hash: str = Field(max_length=255, nullable=False)
    nombre: str = Field(max_length=100, nullable=False)
    apellido: str = Field(max_length=100, nullable=False)
    telefono: Optional[str] = Field(default=None, max_length=20)
    is_active: bool = Field(default=True, nullable=False)

    roles: list[UsuarioRol] = Relationship(back_populates="usuario")

