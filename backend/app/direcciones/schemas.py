from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DireccionCreate(BaseModel):
    calle: str
    numero: str
    piso: Optional[str] = None
    departamento: Optional[str] = None
    ciudad: str
    provincia: str
    codigo_postal: str


class DireccionUpdate(BaseModel):
    calle: Optional[str] = None
    numero: Optional[str] = None
    piso: Optional[str] = None
    departamento: Optional[str] = None
    ciudad: Optional[str] = None
    provincia: Optional[str] = None
    codigo_postal: Optional[str] = None


class DireccionRead(BaseModel):
    id: int
    usuario_id: int
    calle: str
    numero: str
    piso: Optional[str]
    departamento: Optional[str]
    ciudad: str
    provincia: str
    codigo_postal: str
    es_principal: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
