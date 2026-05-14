from typing import Optional

from sqlalchemy import text
from sqlmodel import select

from app.categorias.models import Categoria
from app.core.repository import BaseRepository


class CategoriaRepository(BaseRepository[Categoria]):
    def get_all_active(self) -> list[Categoria]:
        stmt = select(Categoria).where(Categoria.deleted_at.is_(None)).order_by(Categoria.id)
        return list(self.session.exec(stmt).all())

    def get_active_by_id(self, id: int) -> Optional[Categoria]:
        stmt = select(Categoria).where(Categoria.id == id, Categoria.deleted_at.is_(None))
        return self.session.exec(stmt).first()

    def get_by_slug(self, slug: str) -> Optional[Categoria]:
        stmt = select(Categoria).where(Categoria.slug == slug)
        return self.session.exec(stmt).first()

    def get_children(self, parent_id: int) -> list[Categoria]:
        stmt = (
            select(Categoria)
            .where(Categoria.parent_id == parent_id, Categoria.deleted_at.is_(None))
            .order_by(Categoria.id)
        )
        return list(self.session.exec(stmt).all())

    def get_descendants(self, id: int) -> list[Categoria]:
        """Retorna todos los descendientes activos de una categoría usando CTE recursiva."""
        # CTE recursiva para obtener IDs; luego fetch ORM para evitar problemas de mapeo con from_statement
        raw = text("""
            WITH RECURSIVE descendants AS (
                SELECT id FROM categorias WHERE id = :id
                UNION ALL
                SELECT c.id FROM categorias c
                INNER JOIN descendants d ON c.parent_id = d.id
            )
            SELECT id FROM descendants WHERE id != :id
        """)
        rows = self.session.exec(raw.bindparams(id=id)).all()
        ids = [row[0] for row in rows]
        if not ids:
            return []
        stmt = select(Categoria).where(Categoria.id.in_(ids), Categoria.deleted_at.is_(None))
        return list(self.session.exec(stmt).all())

    def has_active_products(self, id: int) -> bool:
        """Retorna True si la categoría tiene productos activos asociados."""
        raw = text("""
            SELECT EXISTS(
                SELECT 1
                FROM producto_categorias pc
                INNER JOIN productos p ON p.id = pc.producto_id
                WHERE pc.categoria_id = :id AND p.deleted_at IS NULL
            )
        """)
        result = self.session.exec(raw.bindparams(id=id)).one()
        return bool(result[0])
