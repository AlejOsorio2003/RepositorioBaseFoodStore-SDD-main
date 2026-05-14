from typing import Optional

from sqlalchemy import text
from sqlmodel import select

from app.core.repository import BaseRepository
from app.ingredientes.models import Ingrediente


class IngredienteRepository(BaseRepository[Ingrediente]):
    def get_by_nombre(self, nombre: str) -> Optional[Ingrediente]:
        stmt = select(Ingrediente).where(Ingrediente.nombre == nombre)
        return self.session.exec(stmt).first()

    def list_alergenos(self) -> list[Ingrediente]:
        stmt = select(Ingrediente).where(Ingrediente.es_alergeno == True)
        return list(self.session.exec(stmt).all())

    def has_productos_asociados(self, ingrediente_id: int) -> bool:
        raw = text(
            "SELECT EXISTS(SELECT 1 FROM producto_ingredientes WHERE ingrediente_id = :id)"
        )
        result = self.session.exec(raw.bindparams(id=ingrediente_id)).one()
        return bool(result[0])
