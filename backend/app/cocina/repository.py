from datetime import datetime, timezone

from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.cocina.schemas import ItemCocinaRead, PedidoCocinaSummary
from app.pedidos.models import EstadoPedido, HistorialEstadoPedido, Pedido


class CocinaRepository:
    def __init__(self, session) -> None:
        self.session = session

    def list_pedidos_activos(self) -> list[PedidoCocinaSummary]:
        stmt = (
            select(Pedido)
            .join(EstadoPedido)
            .where(EstadoPedido.nombre.in_(["CONFIRMADO", "EN_PREP"]))
            .options(
                selectinload(Pedido.detalles),
                selectinload(Pedido.estado),
            )
            .order_by(Pedido.created_at.asc())
        )
        pedidos = list(self.session.exec(stmt).all())

        result = []
        now = datetime.now(timezone.utc)

        for p in pedidos:
            # tiempo_desde_confirmado: segundos desde el registro CONFIRMADO en el historial
            # fallback: usar Pedido.created_at
            hist_stmt = (
                select(HistorialEstadoPedido)
                .join(
                    EstadoPedido,
                    HistorialEstadoPedido.estado_id == EstadoPedido.id,
                )
                .where(
                    HistorialEstadoPedido.pedido_id == p.id,
                    EstadoPedido.nombre == "CONFIRMADO",
                )
                .order_by(HistorialEstadoPedido.creado_en.asc())
                .limit(1)
            )
            hist = self.session.exec(hist_stmt).first()

            if hist and hist.estado_desde:
                ref_time = hist.estado_desde.replace(tzinfo=timezone.utc)
            elif hist and hist.creado_en:
                ref_time = hist.creado_en.replace(tzinfo=timezone.utc)
            else:
                ref_time = p.created_at.replace(tzinfo=timezone.utc)

            tiempo = int((now - ref_time).total_seconds())

            items = [
                ItemCocinaRead(
                    nombre_snapshot=d.nombre_snapshot,
                    cantidad=d.cantidad,
                    personalizacion=d.personalizacion,
                )
                for d in p.detalles
            ]

            result.append(
                PedidoCocinaSummary(
                    id=p.id,
                    estado_nombre=p.estado.nombre if p.estado else "DESCONOCIDO",
                    items=items,
                    created_at=p.created_at,
                    tiempo_desde_confirmado=max(0, tiempo),
                )
            )

        return result
