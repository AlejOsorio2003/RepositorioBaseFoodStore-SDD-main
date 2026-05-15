from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class IngredienteEnProductoRead(BaseModel):
    id: int
    nombre: str
    es_alergeno: bool
    es_removible: bool


class CategoriaEnProductoRead(BaseModel):
    id: int
    nombre: str


class ProductoRead(BaseModel):
    id: int
    nombre: str
    slug: str
    descripcion: Optional[str] = None
    precio_base: Decimal
    stock_cantidad: int
    disponible: bool
    imagen_url: Optional[str] = None
    created_at: datetime


class ProductoDetail(ProductoRead):
    categorias: list[CategoriaEnProductoRead] = []
    ingredientes: list[IngredienteEnProductoRead] = []


class ProductoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio_base: Decimal
    stock_cantidad: int = 0
    disponible: bool = True
    imagen_url: Optional[str] = None
    categoria_ids: list[int] = []
    ingrediente_ids: list[int] = []


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio_base: Optional[Decimal] = None
    stock_cantidad: Optional[int] = None
    disponible: Optional[bool] = None
    imagen_url: Optional[str] = None
    categoria_ids: Optional[list[int]] = None
    ingrediente_ids: Optional[list[int]] = None


class DisponibilidadUpdate(BaseModel):
    disponible: bool


class PaginatedProductos(BaseModel):
    items: list[ProductoRead]
    total: int
    page: int
    size: int


class ProductoIngredienteCreate(BaseModel):
    ingrediente_id: int
    es_removible: bool = False


class ProductoIngredienteRead(BaseModel):
    producto_id: int
    ingrediente_id: int
    es_removible: bool
    ingrediente: IngredienteEnProductoRead
