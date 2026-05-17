from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator
from pydantic.functional_validators import ValidationInfo


class ItemPedidoRequest(BaseModel):
    producto_id: int
    cantidad: int = Field(ge=1)
    personalizacion: list[int] | None = None


class CrearPedidoRequest(BaseModel):
    items: list[ItemPedidoRequest] = Field(min_length=1)
    direccion_id: int | None = None
    notas: str | None = None


class AvanzarEstadoRequest(BaseModel):
    nuevo_estado: str
    motivo: str | None = None

    @field_validator("motivo")
    @classmethod
    def motivo_requerido_si_cancelado(cls, v: str | None, info: ValidationInfo) -> str | None:
        if info.data.get("nuevo_estado") == "CANCELADO" and not v:
            raise ValueError("motivo es requerido cuando nuevo_estado es CANCELADO (RN-05)")
        return v


class DetallePedidoRead(BaseModel):
    producto_id: int
    nombre_snapshot: str
    precio_snapshot: Decimal
    cantidad: int
    personalizacion: list[int] | None = None


class HistorialRead(BaseModel):
    id: int
    estado_nombre: str
    estado_desde: str | None = None
    usuario_id: int | None = None
    notas: str | None = None
    creado_en: datetime


class PedidoRead(BaseModel):
    id: int
    estado_nombre: str
    total: Decimal
    costo_envio: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}


class PedidoDetail(PedidoRead):
    items: list[DetallePedidoRead]
    direccion_snapshot: str | None = None
    notas: str | None = None


class PaginatedPedidos(BaseModel):
    items: list[PedidoRead]
    total: int
    page: int
    size: int
