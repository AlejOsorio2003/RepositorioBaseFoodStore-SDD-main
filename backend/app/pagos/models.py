from __future__ import annotations

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Mapped, relationship
from sqlmodel import Field, Relationship, SQLModel

from app.core.base_model import TimestampMixin


class Pago(TimestampMixin, table=True):
    __tablename__ = "pagos"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", nullable=False, index=True)
    mp_payment_id: Optional[int] = Field(default=None, unique=True, nullable=True)
    mp_status: Optional[str] = Field(default=None, max_length=50)
    mp_status_detail: Optional[str] = Field(default=None, max_length=100)
    external_reference: str = Field(max_length=100, unique=True, nullable=False)
    idempotency_key: UUID = Field(unique=True, nullable=False)
    monto: Optional[float] = Field(default=None)
    forma_pago_id: Optional[int] = Field(default=None, foreign_key="formas_pago.id")

    pedido: Mapped[Optional["Pedido"]] = Relationship(sa_relationship=relationship("Pedido", back_populates="pagos"))  # type: ignore[name-defined]
