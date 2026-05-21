from datetime import datetime

from pydantic import BaseModel


class CrearPagoRequest(BaseModel):
    pedido_id: int
    token: str
    forma_pago_codigo: str
    issuer_id: str | None = None


class WebhookIPNPayload(BaseModel):
    topic: str
    id: str


class CrearPreferenciaRequest(BaseModel):
    pedido_id: int


class PreferenciaResponse(BaseModel):
    preference_id: str


class PagoResponse(BaseModel):
    id: int
    pedido_id: int
    mp_payment_id: int | None = None
    mp_status: str | None = None
    mp_status_detail: str | None = None
    external_reference: str
    monto: float | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
