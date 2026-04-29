from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from app.core.base_model import SoftDeleteMixin, TimestampMixin


class Categoria(TimestampMixin, SoftDeleteMixin, table=True):
    __tablename__ = "categorias"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100, nullable=False)
    slug: str = Field(max_length=120, unique=True, nullable=False, index=True)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    parent_id: Optional[int] = Field(
        default=None, foreign_key="categorias.id", nullable=True
    )
    orden: int = Field(default=0, nullable=False)

    productos: list["ProductoCategoria"] = Relationship(back_populates="categoria")  # type: ignore[name-defined]
