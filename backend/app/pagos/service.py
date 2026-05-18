import uuid

import mercadopago
from fastapi import HTTPException, status
from sqlmodel import select

from app.auth.models import Usuario
from app.core.config import settings
from app.core.uow import UnitOfWork
from app.pagos.models import Pago
from app.pagos.schemas import CrearPagoRequest, PagoResponse
from app.pedidos.schemas import AvanzarEstadoRequest
from app.pedidos.service import avanzar_estado
from app.productos.models import FormaPago

sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)


def crear_pago(
    data: CrearPagoRequest,
    current_user: Usuario,
    uow: UnitOfWork,
) -> PagoResponse:
    if not settings.MP_ACCESS_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="MERCADOPAGO_NO_CONFIGURADO",
        )

    # Buscar pedido y verificar propiedad
    pedido = uow.pedidos.get_by_id(data.pedido_id)
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )
    if pedido.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El pedido no pertenece al usuario actual",
        )

    # Buscar forma de pago habilitada
    forma_pago = uow.session.exec(
        select(FormaPago).where(
            FormaPago.codigo == data.forma_pago_codigo,
            FormaPago.habilitado == True,
        )
    ).first()
    if not forma_pago:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="FORMA_PAGO_INVALIDA",
        )

    idempotency_key = uuid.uuid4()

    payment_data = {
        "token": data.token,
        "transaction_amount": float(pedido.total),
        "installments": 1,
        "payment_method_id": forma_pago.codigo,
        "external_reference": str(pedido.id),
        "notification_url": settings.MP_NOTIFICATION_URL,
    }

    result = sdk.payment().create(payment_data)

    response = result["response"]
    mp_payment_id = response["id"]
    mp_status = response["status"]
    mp_status_detail = response.get("status_detail")
    monto = response.get("transaction_amount")

    pago = Pago(
        pedido_id=pedido.id,
        mp_payment_id=mp_payment_id,
        mp_status=mp_status,
        mp_status_detail=mp_status_detail,
        external_reference=str(pedido.id),
        idempotency_key=idempotency_key,
        monto=monto,
        forma_pago_id=forma_pago.id,
    )
    uow.pagos.create(pago)

    return PagoResponse.model_validate(pago)


def procesar_webhook(
    topic: str,
    mp_id: str,
    uow: UnitOfWork,
) -> dict:
    if topic != "payment":
        return {"status": "ignored"}

    result = sdk.payment().get(int(mp_id))
    response = result["response"]
    mp_status = response["status"]

    pago = uow.pagos.get_by_mp_payment_id(int(mp_id))
    if not pago:
        return {"status": "not_found"}

    pago.mp_status = mp_status
    uow.session.add(pago)

    if mp_status == "approved":
        avanzar_estado(
            uow=uow,
            pedido_id=pago.pedido_id,
            data=AvanzarEstadoRequest(nuevo_estado="CONFIRMADO"),
            usuario_id=0,
        )

    uow.session.flush()
    return {"status": "ok"}


def get_pago_by_pedido(
    pedido_id: int,
    current_user: Usuario,
    uow: UnitOfWork,
) -> PagoResponse:
    # Buscar pedido
    pedido = uow.pedidos.get_by_id(pedido_id)
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )

    # Verificar acceso: propietario o ADMIN/PEDIDOS
    user_roles = {ur.rol.nombre for ur in current_user.roles if ur.rol}
    is_admin_or_gestor = bool(user_roles & {"ADMIN", "PEDIDOS"})
    if pedido.usuario_id != current_user.id and not is_admin_or_gestor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para acceder a este pedido",
        )

    # Buscar pago
    pago = uow.pagos.get_by_pedido_id(pedido_id)
    if not pago:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PAGO_NOT_FOUND",
        )

    return PagoResponse.model_validate(pago)
