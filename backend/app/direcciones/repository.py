from typing import Optional

from sqlmodel import select

from app.core.repository import BaseRepository
from app.direcciones.models import DireccionEntrega


class DireccionRepository(BaseRepository[DireccionEntrega]):
    def list_by_usuario(self, usuario_id: int) -> list[DireccionEntrega]:
        stmt = select(DireccionEntrega).where(
            (DireccionEntrega.usuario_id == usuario_id)
            & (DireccionEntrega.deleted_at.is_(None))
        )
        return list(self.session.exec(stmt).all())

    def get_principal(self, usuario_id: int) -> Optional[DireccionEntrega]:
        stmt = select(DireccionEntrega).where(
            (DireccionEntrega.usuario_id == usuario_id)
            & (DireccionEntrega.es_principal == True)
            & (DireccionEntrega.deleted_at.is_(None))
        )
        return self.session.exec(stmt).first()

    def clear_principal(self, usuario_id: int) -> None:
        stmt = select(DireccionEntrega).where(
            (DireccionEntrega.usuario_id == usuario_id)
            & (DireccionEntrega.es_principal == True)
            & (DireccionEntrega.deleted_at.is_(None))
        )
        direcciones = self.session.exec(stmt).all()
        for dir in direcciones:
            dir.es_principal = False
        self.session.add_all(direcciones)

    def count_activas(self, usuario_id: int) -> int:
        from sqlalchemy import func
        stmt = select(func.count()).select_from(DireccionEntrega).where(
            (DireccionEntrega.usuario_id == usuario_id)
            & (DireccionEntrega.deleted_at.is_(None))
        )
        result = self.session.exec(stmt)
        return result.one()
