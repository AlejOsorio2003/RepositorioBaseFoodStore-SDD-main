from typing import Optional

from sqlmodel import Field, SQLModel

from app.core.base_model import SoftDeleteMixin, TimestampMixin


class DireccionEntrega(TimestampMixin, SoftDeleteMixin, table=True):
    __tablename__ = "direcciones_entrega"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", nullable=False, index=True)
    calle: str = Field(max_length=255, nullable=False)
    numero: str = Field(max_length=20, nullable=False)
    piso: Optional[str] = Field(default=None, max_length=10)
    departamento: Optional[str] = Field(default=None, max_length=10)
    ciudad: str = Field(max_length=100, nullable=False)
    provincia: str = Field(max_length=100, nullable=False)
    codigo_postal: str = Field(max_length=10, nullable=False)
    es_principal: bool = Field(default=False, nullable=False)
