from decimal import Decimal
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from app.core.base_model import SoftDeleteMixin, TimestampMixin
from app.ingredientes.models import Ingrediente  # noqa: F401


class Producto(TimestampMixin, SoftDeleteMixin, table=True):
    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=200, nullable=False)
    slug: str = Field(max_length=220, unique=True, nullable=False, index=True)
    descripcion: Optional[str] = Field(default=None, max_length=1000)
    precio_base: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    stock_cantidad: int = Field(default=0, nullable=False)
    disponible: bool = Field(default=True, nullable=False)
    imagen_url: Optional[str] = Field(default=None, max_length=500)

    categorias: list["ProductoCategoria"] = Relationship(back_populates="producto")
    ingredientes: list["ProductoIngrediente"] = Relationship(back_populates="producto")


class ProductoCategoria(SQLModel, table=True):
    __tablename__ = "producto_categorias"

    producto_id: Optional[int] = Field(
        default=None, foreign_key="productos.id", primary_key=True
    )
    categoria_id: Optional[int] = Field(
        default=None, foreign_key="categorias.id", primary_key=True
    )

    producto: Optional[Producto] = Relationship(back_populates="categorias")
    categoria: Optional["Categoria"] = Relationship(back_populates="productos")  # type: ignore[name-defined]


class ProductoIngrediente(SQLModel, table=True):
    __tablename__ = "producto_ingredientes"

    producto_id: Optional[int] = Field(
        default=None, foreign_key="productos.id", primary_key=True
    )
    ingrediente_id: Optional[int] = Field(
        default=None, foreign_key="ingredientes.id", primary_key=True
    )
    es_removible: bool = Field(default=False, nullable=False)

    producto: Optional[Producto] = Relationship(back_populates="ingredientes")
    ingrediente: Optional[Ingrediente] = Relationship(back_populates="productos")


class FormaPago(TimestampMixin, table=True):
    __tablename__ = "formas_pago"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100, unique=True, nullable=False)
    codigo: str = Field(max_length=50, unique=True, nullable=False)
    habilitado: bool = Field(default=True, nullable=False)
