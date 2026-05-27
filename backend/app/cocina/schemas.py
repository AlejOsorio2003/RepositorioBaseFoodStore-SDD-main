from datetime import datetime

from pydantic import BaseModel


class ItemCocinaRead(BaseModel):
    nombre_snapshot: str
    cantidad: int
    personalizacion: list[int] | None = None


class PedidoCocinaSummary(BaseModel):
    id: int
    estado_nombre: str
    items: list[ItemCocinaRead]
    created_at: datetime
    tiempo_desde_confirmado: int  # segundos


class CocinaEstadoRequest(BaseModel):
    nuevo_estado: str
