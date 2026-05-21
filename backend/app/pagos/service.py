import logging
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

logger = logging.getLogger(__name__)
sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)


def crear_pago(
    data: CrearPagoRequest,
    current_user: Usuario,
    uow: UnitOfWork,
) -> PagoResponse:
    logger.warning("crear_pago called — pedido_id=%s user=%s", data.pedido_id, current_user.id)
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

    # Verificar que el método de pago MP esté habilitado
    forma_pago = uow.session.exec(
        select(FormaPago).where(
            FormaPago.codigo == "mercadopago",
            FormaPago.habilitado == True,
        )
    ).first()
    if not forma_pago:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="FORMA_PAGO_INVALIDA",
        )

    if not data.forma_pago_codigo:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="FORMA_PAGO_INVALIDA",
        )

    idempotency_key = uuid.uuid4()

    # Mock mode: omitir llamada real a MP y devolver pago aprobado
    if settings.MP_MOCK_MODE:
        logger.warning("MP_MOCK_MODE activo — devolviendo pago aprobado simulado")
        pago = Pago(
            pedido_id=pedido.id,
            mp_payment_id=999999999,
            mp_status="approved",
            mp_status_detail="accredited",
            external_reference=str(pedido.id),
            idempotency_key=idempotency_key,
            monto=float(pedido.total),
            forma_pago_id=forma_pago.id,
        )
        uow.pagos.create(pago)
        avanzar_estado(
            uow=uow,
            pedido_id=pedido.id,
            data=AvanzarEstadoRequest(nuevo_estado="CONFIRMADO"),
            usuario_id=None,
        )
        return PagoResponse.model_validate(pago)

    payment_data = {
        "token": data.token,
        "transaction_amount": float(pedido.total),
        "installments": 1,
        "payment_method_id": data.forma_pago_codigo,
        "external_reference": str(pedido.id),
        "payer": {"email": current_user.email},
    }
    if data.issuer_id:
        payment_data["issuer_id"] = int(data.issuer_id)
    if settings.MP_NOTIFICATION_URL:
        payment_data["notification_url"] = settings.MP_NOTIFICATION_URL

    result = sdk.payment().create(payment_data)
    logger.warning("MP payment result: status=%s response=%s", result.get("status"), result.get("response"))

    response = result["response"]
    if "id" not in response:
        mp_err = response.get("message") or response.get("error") or "MP_PAYMENT_ERROR"
        mp_cause = response.get("cause", [])
        logger.error("MP payment failed — message=%s cause=%s full=%s", mp_err, mp_cause, response)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"mp_error": mp_err, "cause": mp_cause},
        )
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


def crear_preferencia(
    pedido_id: int,
    current_user: Usuario,
    uow: UnitOfWork,
) -> dict:
    logger.warning("crear_preferencia called — pedido_id=%s user=%s", pedido_id, current_user.id)
    if not settings.MP_ACCESS_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="MERCADOPAGO_NO_CONFIGURADO",
        )

    # Buscar pedido y verificar propiedad
    pedido = uow.pedidos.get_by_id_with_relations(pedido_id)
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

    # Verificar forma de pago
    forma_pago = uow.session.exec(
        select(FormaPago).where(
            FormaPago.codigo == "mercadopago",
            FormaPago.habilitado == True,
        )
    ).first()
    if not forma_pago:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="FORMA_PAGO_INVALIDA",
        )

    # Idempotencia: si ya hay un pago aprobado, rechazar; si está pendiente, permitir nueva preferencia
    pago_existente = uow.pagos.get_by_pedido_id(pedido_id)
    if pago_existente and pago_existente.mp_status == "approved":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este pedido ya fue pagado",
        )

    idempotency_key = uuid.uuid4()

    # Mock mode: omitir SDK, pago aprobado inmediato
    if settings.MP_MOCK_MODE:
        logger.warning("MP_MOCK_MODE activo — preferencia simulada, pago aprobado")
        pago = Pago(
            pedido_id=pedido.id,
            mp_payment_id=999999999,
            mp_status="approved",
            mp_status_detail="accredited",
            external_reference=str(pedido.id),
            idempotency_key=idempotency_key,
            monto=float(pedido.total),
            forma_pago_id=forma_pago.id,
        )
        uow.pagos.create(pago)
        avanzar_estado(
            uow=uow,
            pedido_id=pedido.id,
            data=AvanzarEstadoRequest(nuevo_estado="CONFIRMADO"),
            usuario_id=None,
        )
        return {"preference_id": f"mock-pref-{pedido.id}"}

    # Crear Pago pendiente solo si no existe uno previo (idempotencia para reintentos)
    if not pago_existente:
        pago_nuevo = Pago(
            pedido_id=pedido.id,
            mp_status="pending",
            external_reference=str(pedido.id),
            idempotency_key=idempotency_key,
            monto=float(pedido.total),
            forma_pago_id=forma_pago.id,
        )
        uow.pagos.create(pago_nuevo)

    # Construir items de la preferencia desde los detalles del pedido
    items = []
    for detalle in pedido.detalles:
        items.append({
            "id": str(detalle.producto_id),
            "title": detalle.nombre_snapshot,
            "quantity": detalle.cantidad,
            "unit_price": float(detalle.precio_snapshot),
            "currency_id": "ARS",
        })

    back_urls = {
        "success": f"{settings.MP_FRONTEND_URL}/payment/{pedido.id}?resultado=aprobado",
        "failure": f"{settings.MP_FRONTEND_URL}/payment/{pedido.id}?resultado=rechazado",
        "pending": f"{settings.MP_FRONTEND_URL}/payment/{pedido.id}?resultado=pendiente",
    }

    preference_data: dict = {
        "items": items,
        "external_reference": str(pedido.id),
        "back_urls": back_urls,
    }
    # auto_return solo funciona con URLs HTTPS en producción
    frontend_url = settings.MP_FRONTEND_URL
    if frontend_url.startswith("https://"):
        preference_data["auto_return"] = "approved"
    if settings.MP_NOTIFICATION_URL:
        preference_data["notification_url"] = settings.MP_NOTIFICATION_URL

    result = sdk.preference().create(preference_data)
    logger.warning("MP preference result: status=%s response=%s", result.get("status"), result.get("response"))

    response = result["response"]
    if "id" not in response:
        mp_err = response.get("message") or response.get("error") or "MP_PREFERENCE_ERROR"
        logger.error("MP preference failed — message=%s full=%s", mp_err, response)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"mp_error": mp_err},
        )

    preference_id = response["id"]
    return {"preference_id": preference_id}


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
        # Fallback: buscar por external_reference (flujo Wallet)
        external_ref = response.get("external_reference")
        if external_ref:
            pago = uow.pagos.get_by_external_reference(external_ref)
    if not pago:
        return {"status": "not_found"}

    pago.mp_payment_id = int(mp_id)
    pago.mp_status = mp_status
    uow.session.add(pago)

    if mp_status == "approved":
        avanzar_estado(
            uow=uow,
            pedido_id=pago.pedido_id,
            data=AvanzarEstadoRequest(nuevo_estado="CONFIRMADO"),
            usuario_id=None,
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
