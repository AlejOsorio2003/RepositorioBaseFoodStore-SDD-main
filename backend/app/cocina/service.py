from fastapi import HTTPException, status

from app.cocina.schemas import CocinaEstadoRequest, PedidoCocinaSummary
from app.core.uow import UnitOfWork
from app.pedidos.schemas import AvanzarEstadoRequest, PedidoRead

# Transiciones que el rol COCINA tiene permitido realizar
TRANSICIONES_COCINA: dict[str, str] = {
    "CONFIRMADO": "EN_PREP",
    "EN_PREP": "EN_CAMINO",
}

# Estados destino que cocina puede solicitar
ESTADOS_DESTINO_COCINA: set[str] = {"EN_PREP", "EN_CAMINO"}


def listar_pedidos(uow: UnitOfWork) -> list[PedidoCocinaSummary]:
    return uow.cocina.list_pedidos_activos()


def avanzar_estado_cocina(
    pedido_id: int,
    data: CocinaEstadoRequest,
    uow: UnitOfWork,
    usuario_id: int,
) -> PedidoRead:
    from app.pedidos import service as pedidos_service

    pedido = uow.pedidos.get_by_id_with_relations(pedido_id)
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PEDIDO_NOT_FOUND",
        )

    estado_actual = pedido.estado.nombre if pedido.estado else ""

    # Verificar que el estado destino sea uno de los que cocina puede usar
    if data.nuevo_estado not in ESTADOS_DESTINO_COCINA:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="TRANSICION_NO_PERMITIDA_ROL",
        )

    # Verificar que la transición sea válida para el estado actual + rol COCINA
    transicion_valida = TRANSICIONES_COCINA.get(estado_actual)
    if transicion_valida != data.nuevo_estado:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="TRANSICION_NO_PERMITIDA_ROL",
        )

    # Delegar a pedidos.service — reutiliza FSM + historial
    return pedidos_service.avanzar_estado(
        uow,
        pedido_id,
        AvanzarEstadoRequest(nuevo_estado=data.nuevo_estado),
        usuario_id,
    )
