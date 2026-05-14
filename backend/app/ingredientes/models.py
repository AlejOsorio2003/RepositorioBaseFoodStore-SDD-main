from typing import Optional

from sqlmodel import Field, Relationship

from app.core.base_model import TimestampMixin


class Ingrediente(TimestampMixin, table=True):
    __tablename__ = "ingredientes"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100, unique=True, nullable=False)
    es_alergeno: bool = Field(default=False, nullable=False)

    productos: list["ProductoIngrediente"] = Relationship(back_populates="ingrediente")  # noqa: F821
