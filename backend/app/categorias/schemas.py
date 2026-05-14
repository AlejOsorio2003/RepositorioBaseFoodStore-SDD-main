from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CategoriaCreate(BaseModel):
    nombre: str
    slug: str
    parent_id: Optional[int] = None


class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = None
    slug: Optional[str] = None
    parent_id: Optional[int] = None


class CategoriaRead(BaseModel):
    id: int
    nombre: str
    slug: str
    parent_id: Optional[int] = None
    created_at: datetime


class CategoriaWithChildren(CategoriaRead):
    hijos: list[CategoriaRead] = []
