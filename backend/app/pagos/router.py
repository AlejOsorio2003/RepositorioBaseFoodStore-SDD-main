from fastapi import APIRouter, Depends, Query, status

from app.auth.models import Usuario
from app.core.dependencies import get_uow, require_role
from app.core.uow import UnitOfWork
from app.pagos import service
from app.pagos.schemas import CrearPagoRequest, CrearPreferenciaRequest, PreferenciaResponse, PagoResponse

router = APIRouter()


@router.post("/preferencia", response_model=PreferenciaResponse, status_code=status.HTTP_201_CREATED)
def crear_preferencia(
    data: CrearPreferenciaRequest,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(require_role(["CLIENT"])),
) -> PreferenciaResponse:
    result = service.crear_preferencia(data.pedido_id, current_user, uow)
    return PreferenciaResponse(preference_id=result["preference_id"])


@router.post("/crear", response_model=PagoResponse, status_code=status.HTTP_201_CREATED)
def crear_pago(
    data: CrearPagoRequest,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(require_role(["CLIENT"])),
) -> PagoResponse:
    return service.crear_pago(data, current_user, uow)


@router.post("/webhook")
def webhook_ipn(
    topic: str = Query(...),
    id: str = Query(...),
    uow: UnitOfWork = Depends(get_uow),
) -> dict:
    return service.procesar_webhook(topic, id, uow)


@router.get("/{pedido_id}", response_model=PagoResponse)
def get_pago(
    pedido_id: int,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(require_role(["CLIENT", "ADMIN", "PEDIDOS"])),
) -> PagoResponse:
    return service.get_pago_by_pedido(pedido_id, current_user, uow)
