from sqlmodel import select

from app.core.repository import BaseRepository
from app.pagos.models import Pago


class PagoRepository(BaseRepository[Pago]):
    def create(self, pago: Pago) -> Pago:
        self.session.add(pago)
        self.session.flush()
        self.session.refresh(pago)
        return pago

    def get_by_pedido_id(self, pedido_id: int) -> Pago | None:
        return self.session.exec(
            select(Pago).where(Pago.pedido_id == pedido_id)
        ).first()

    def get_by_mp_payment_id(self, mp_payment_id: int) -> Pago | None:
        return self.session.exec(
            select(Pago).where(Pago.mp_payment_id == mp_payment_id)
        ).first()

    def get_by_external_reference(self, external_reference: str) -> Pago | None:
        return self.session.exec(
            select(Pago).where(Pago.external_reference == external_reference)
        ).first()
