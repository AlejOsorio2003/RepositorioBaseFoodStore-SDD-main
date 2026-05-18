from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, model_validator

from app.pagos.schemas import PagoResponse


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

    @model_validator(mode="after")
    def motivo_requerido_si_cancelado(self) -> "AvanzarEstadoRequest":
        if self.nuevo_estado == "CANCELADO" and not self.motivo:
            raise ValueError("motivo es requerido cuando nuevo_estado es CANCELADO (RN-05)")
        return self


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
    pago: PagoResponse | None = None


class PaginatedPedidos(BaseModel):
    items: list[PedidoRead]
    total: int
    page: int
    size: int
