from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import ARRAY, INTEGER
from sqlmodel import Field, Relationship, SQLModel

from app.core.base_model import TimestampMixin

if TYPE_CHECKING:
    from app.pagos.models import Pago


class EstadoPedido(TimestampMixin, table=True):
    __tablename__ = "estados_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=50, unique=True, nullable=False)
    es_terminal: bool = Field(default=False, nullable=False)
    descripcion: Optional[str] = Field(default=None, max_length=255)


class Pedido(TimestampMixin, table=True):
    __tablename__ = "pedidos"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", nullable=False, index=True)
    estado_id: int = Field(foreign_key="estados_pedido.id", nullable=False)
    direccion_id: Optional[int] = Field(
        default=None,
        sa_column=Column(
            Integer,
            ForeignKey("direcciones_entrega.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    total: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    costo_envio: Decimal = Field(max_digits=10, decimal_places=2, default=Decimal("50.00"), nullable=False)
    direccion_snapshot: Optional[str] = Field(default=None)

    detalles: list["DetallePedido"] = Relationship(back_populates="pedido")
    historial: list["HistorialEstadoPedido"] = Relationship(back_populates="pedido")
    pagos: list["Pago"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalles_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", nullable=False, index=True)
    producto_id: int = Field(foreign_key="productos.id", nullable=False)
    nombre_snapshot: str = Field(max_length=200, nullable=False)
    precio_snapshot: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    cantidad: int = Field(nullable=False)
    personalizacion: Optional[list[int]] = Field(
        default=None,
        sa_column=Column(ARRAY(INTEGER), nullable=True),
    )

    pedido: Optional[Pedido] = Relationship(back_populates="detalles")


class HistorialEstadoPedido(SQLModel, table=True):
    __tablename__ = "historial_estados_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", nullable=False, index=True)
    estado_id: int = Field(foreign_key="estados_pedido.id", nullable=False)
    usuario_id: Optional[int] = Field(default=None, foreign_key="usuarios.id")
    estado_desde: Optional[datetime] = Field(default=None, nullable=True)
    creado_en: datetime = Field(nullable=False)
    notas: Optional[str] = Field(default=None, max_length=500)

    pedido: Optional[Pedido] = Relationship(back_populates="historial")
