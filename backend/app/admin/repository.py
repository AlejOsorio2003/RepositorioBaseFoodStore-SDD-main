from decimal import Decimal
from typing import Any

from sqlalchemy import text
from sqlmodel import Session


class AdminRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_total_ventas(self) -> Decimal:
        result = self.session.execute(
            text("SELECT COALESCE(SUM(monto), 0) FROM pagos WHERE mp_status = 'approved'")
        )
        return result.scalar_one()

    def get_pedidos_por_estado(self) -> dict[str, int]:
        rows = self.session.execute(
            text("""
                SELECT e.nombre, COUNT(p.id)
                FROM pedidos p
                JOIN estados_pedido e ON e.id = p.estado_id
                GROUP BY e.nombre
            """)
        ).all()
        return {row[0]: row[1] for row in rows}

    def get_productos_stock_bajo(self, threshold: int = 5) -> int:
        result = self.session.execute(
            text("SELECT COUNT(*) FROM productos WHERE stock_cantidad < :threshold AND deleted_at IS NULL"),
            {"threshold": threshold},
        )
        return result.scalar_one()

    def get_top_productos(self, limit: int = 5) -> list[dict[str, Any]]:
        rows = self.session.execute(
            text("""
                SELECT p.id, p.nombre, COALESCE(SUM(dp.cantidad), 0) AS total_vendido
                FROM productos p
                JOIN detalles_pedido dp ON dp.producto_id = p.id
                WHERE p.deleted_at IS NULL
                GROUP BY p.id, p.nombre
                ORDER BY total_vendido DESC
                LIMIT :limit
            """),
            {"limit": limit},
        ).all()
        return [
            {"producto_id": row[0], "nombre": row[1], "total_vendido": row[2]}
            for row in rows
        ]
