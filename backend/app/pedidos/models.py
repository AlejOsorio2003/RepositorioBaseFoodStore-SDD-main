from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional, List

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.types import JSON
from sqlalchemy.orm import Mapped, relationship
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

    pedidos: Mapped[List["Pedido"]] = Relationship(
        sa_relationship=relationship("Pedido", back_populates="estado")
    )


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

    estado: Mapped[Optional["EstadoPedido"]] = Relationship(
        sa_relationship=relationship("EstadoPedido", back_populates="pedidos")
    )
    detalles: Mapped[List["DetallePedido"]] = Relationship(sa_relationship=relationship("DetallePedido", back_populates="pedido"))
    historial: Mapped[List["HistorialEstadoPedido"]] = Relationship(sa_relationship=relationship("HistorialEstadoPedido", back_populates="pedido"))
    pagos: Mapped[List["Pago"]] = Relationship(sa_relationship=relationship("Pago", back_populates="pedido"))


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
        sa_column=Column(JSON, nullable=True),
    )

    pedido: Mapped[Optional[Pedido]] = Relationship(sa_relationship=relationship("Pedido", back_populates="detalles"))


class HistorialEstadoPedido(SQLModel, table=True):
    __tablename__ = "historial_estados_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", nullable=False, index=True)
    estado_id: int = Field(foreign_key="estados_pedido.id", nullable=False)
    usuario_id: Optional[int] = Field(default=None, foreign_key="usuarios.id")
    estado_desde: Optional[datetime] = Field(default=None, nullable=True)
    creado_en: datetime = Field(nullable=False)
    notas: Optional[str] = Field(default=None, max_length=500)

    pedido: Mapped[Optional[Pedido]] = Relationship(sa_relationship=relationship("Pedido", back_populates="historial"))
    estado: Mapped[Optional["EstadoPedido"]] = Relationship(
        sa_relationship=relationship("EstadoPedido")
    )


def seed_estados_pedido(session) -> None:
    """Inserta los 6 estados de pedido de forma idempotente."""
    from sqlmodel import select

    estados_data = [
        ("PENDIENTE", False, "Pedido creado, esperando confirmación"),
        ("CONFIRMADO", False, "Pedido confirmado, listo para preparación"),
        ("EN_PREP", False, "Pedido en preparación"),
        ("EN_CAMINO", False, "Pedido en camino al domicilio"),
        ("ENTREGADO", True, "Pedido entregado al cliente"),
        ("CANCELADO", True, "Pedido cancelado"),
    ]

    for nombre, es_terminal, descripcion in estados_data:
        existing = session.exec(
            select(EstadoPedido).where(EstadoPedido.nombre == nombre)
        ).first()
        if existing is None:
            session.add(
                EstadoPedido(
                    nombre=nombre,
                    es_terminal=es_terminal,
                    descripcion=descripcion,
                )
            )

    session.commit()
