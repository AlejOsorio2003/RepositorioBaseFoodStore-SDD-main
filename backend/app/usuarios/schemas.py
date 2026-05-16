from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class UsuarioRead(BaseModel):
    id: int
    nombre: str
    apellido: str
    email: str
    telefono: Optional[str] = None
    is_active: bool
    roles: list[str] = []
    created_at: datetime


class UsuarioCreate(BaseModel):
    pass


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    telefono: Optional[str] = None
    roles: Optional[list[str]] = None


class UsuarioUpdateEstado(BaseModel):
    activo: bool


class PerfilUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    telefono: Optional[str] = None


class CambiarPasswordRequest(BaseModel):
    password_actual: str
    password_nueva: str = Field(min_length=8)


class PaginatedUsuarios(BaseModel):
    items: list[UsuarioRead]
    total: int
    page: int
    size: int
