from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class TopProductoRead(BaseModel):
    producto_id: int
    nombre: str
    total_vendido: int


class MetricasRead(BaseModel):
    total_ventas: Decimal
    pedidos_por_estado: dict[str, int]
    productos_stock_bajo: int
    top_productos: list[TopProductoRead]


class StockUpdate(BaseModel):
    stock_cantidad: int = Field(..., ge=0)
