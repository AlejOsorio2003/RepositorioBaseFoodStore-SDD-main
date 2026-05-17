from app.core.repository import BaseRepository
from app.pedidos.models import (
    EstadoPedido,
    HistorialEstadoPedido,
    Pedido,
)


class PedidoRepository(BaseRepository[Pedido]):
    def get_by_id_with_relations(self, pedido_id: int) -> Pedido | None:
        from sqlalchemy.orm import selectinload
        from sqlmodel import select

        stmt = (
            select(Pedido)
            .where(Pedido.id == pedido_id)
            .options(
                selectinload(Pedido.detalles),
                selectinload(Pedido.estado),
            )
        )
        return self.session.exec(stmt).first()

    def list_paginated(
        self,
        page: int = 1,
        size: int = 20,
        usuario_id: int | None = None,
        estado_nombre: str | None = None,
    ) -> tuple[list[Pedido], int]:
        from sqlalchemy import func
        from sqlalchemy.orm import selectinload
        from sqlmodel import select

        base = select(Pedido).options(selectinload(Pedido.estado))

        if usuario_id is not None:
            base = base.where(Pedido.usuario_id == usuario_id)
        if estado_nombre is not None:
            base = base.join(EstadoPedido).where(EstadoPedido.nombre == estado_nombre)

        # count
        count_stmt = select(func.count()).select_from(Pedido)
        if usuario_id is not None:
            count_stmt = count_stmt.where(Pedido.usuario_id == usuario_id)
        if estado_nombre is not None:
            count_stmt = count_stmt.join(EstadoPedido).where(EstadoPedido.nombre == estado_nombre)
        total = self.session.exec(count_stmt).one()

        offset = (page - 1) * size
        stmt = base.order_by(Pedido.id.desc()).offset(offset).limit(size)
        items = list(self.session.exec(stmt).all())

        return items, total

    def get_historial(self, pedido_id: int) -> list[HistorialEstadoPedido]:
        from sqlalchemy.orm import selectinload
        from sqlmodel import select

        stmt = (
            select(HistorialEstadoPedido)
            .where(HistorialEstadoPedido.pedido_id == pedido_id)
            .options(selectinload(HistorialEstadoPedido.estado))
            .order_by(HistorialEstadoPedido.creado_en.asc())
        )
        return list(self.session.exec(stmt).all())

    def get_estado_by_nombre(self, nombre: str) -> EstadoPedido | None:
        from sqlmodel import select

        stmt = select(EstadoPedido).where(EstadoPedido.nombre == nombre)
        return self.session.exec(stmt).first()
