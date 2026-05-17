from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status

from app.core.uow import UnitOfWork
from app.pedidos.models import (
    DetallePedido,
    EstadoPedido,
    HistorialEstadoPedido,
    Pedido,
)
from app.pedidos.repository import PedidoRepository
from app.pedidos.schemas import (
    AvanzarEstadoRequest,
    CrearPedidoRequest,
    DetallePedidoRead,
    HistorialRead,
    PaginatedPedidos,
    PedidoDetail,
    PedidoRead,
)

TRANSICIONES_VALIDAS: dict[str, list[str]] = {
    "PENDIENTE":   ["CONFIRMADO", "CANCELADO"],
    "CONFIRMADO":  ["EN_PREP", "CANCELADO"],
    "EN_PREP":     ["EN_CAMINO", "CANCELADO"],
    "EN_CAMINO":   ["ENTREGADO"],
    "ENTREGADO":   [],
    "CANCELADO":   [],
}


def _pedido_to_read(pedido: Pedido) -> PedidoRead:
    return PedidoRead(
        id=pedido.id,
        estado_nombre=pedido.estado.nombre if pedido.estado else "DESCONOCIDO",
        total=pedido.total,
        costo_envio=pedido.costo_envio,
        created_at=pedido.created_at,
    )


def _pedido_to_detail(pedido: Pedido) -> PedidoDetail:
    items = []
    for d in pedido.detalles:
        items.append(DetallePedidoRead(
            producto_id=d.producto_id,
            nombre_snapshot=d.nombre_snapshot,
            precio_snapshot=d.precio_snapshot,
            cantidad=d.cantidad,
            personalizacion=d.personalizacion,
        ))
    return PedidoDetail(
        id=pedido.id,
        estado_nombre=pedido.estado.nombre if pedido.estado else "DESCONOCIDO",
        total=pedido.total,
        costo_envio=pedido.costo_envio,
        created_at=pedido.created_at,
        items=items,
        direccion_snapshot=pedido.direccion_snapshot,
        notas=None,
    )


def crear_pedido(
    uow: UnitOfWork,
    data: CrearPedidoRequest,
    usuario_id: int,
) -> PedidoRead:
    repo: PedidoRepository = uow.pedidos  # type: ignore[assignment]

    total = Decimal("0.00")
    detalles = []

    for item in data.items:
        producto = uow.productos.get_by_id(item.producto_id)
        if not producto or not producto.disponible:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="PRODUCTO_NO_DISPONIBLE",
            )
        # snapshot de precios
        precio = producto.precio_base
        total += precio * Decimal(str(item.cantidad))
        detalles.append(DetallePedido(
            producto_id=item.producto_id,
            nombre_snapshot=producto.nombre,
            precio_snapshot=precio,
            cantidad=item.cantidad,
            personalizacion=item.personalizacion,
        ))

    # estado PENDIENTE
    estado_pendiente = repo.get_estado_by_nombre("PENDIENTE")
    if not estado_pendiente:
        raise HTTPException(status_code=500, detail="Estado PENDIENTE no encontrado en seed")

    # direccion snapshot si se provee
    direccion_snapshot = None
    if data.direccion_id is not None:
        direccion = uow.direcciones.get_by_id(data.direccion_id)
        if direccion:
            import json
            direccion_snapshot = json.dumps({
                "calle": direccion.calle,
                "numero": direccion.numero,
                "piso": direccion.piso,
                "departamento": direccion.departamento,
                "ciudad": direccion.ciudad,
                "provincia": direccion.provincia,
                "codigo_postal": direccion.codigo_postal,
            })

    pedido = Pedido(
        usuario_id=usuario_id,
        estado_id=estado_pendiente.id,
        total=total,
        costo_envio=Decimal("50.00"),
        direccion_snapshot=direccion_snapshot,
    )
    uow.session.add(pedido)
    uow.session.flush()  # obtener pedido.id

    # agregar detalles con pedido_id
    for d in detalles:
        d.pedido_id = pedido.id
    uow.session.add_all(detalles)

    # crear historial inicial (RN-02: estado_desde=None)
    historial = HistorialEstadoPedido(
        pedido_id=pedido.id,
        estado_id=estado_pendiente.id,
        usuario_id=usuario_id,
        estado_desde=None,
        creado_en=datetime.now(timezone.utc),
        notas=data.notas,
    )
    uow.session.add(historial)

    # recargar pedido con relaciones
    uow.session.flush()
    pedido_con_rel = repo.get_by_id_with_relations(pedido.id)
    if not pedido_con_rel:
        raise HTTPException(status_code=500, detail="Error al crear pedido")

    return _pedido_to_read(pedido_con_rel)


def listar_pedidos(
    uow: UnitOfWork,
    usuario_id: int,
    rol: str,
    page: int = 1,
    size: int = 20,
    estado: str | None = None,
) -> PaginatedPedidos:
    repo: PedidoRepository = uow.pedidos  # type: ignore[assignment]

    # Si es CLIENT, solo sus pedidos; si es ADMIN/PEDIDOS, todos
    filter_usuario_id = usuario_id if rol == "CLIENT" else None

    items, total = repo.list_paginated(
        page=page,
        size=size,
        usuario_id=filter_usuario_id,
        estado_nombre=estado,
    )

    return PaginatedPedidos(
        items=[_pedido_to_read(p) for p in items],
        total=total,
        page=page,
        size=size,
    )


def get_pedido(
    uow: UnitOfWork,
    pedido_id: int,
    usuario_id: int,
    rol: str,
) -> PedidoDetail:
    repo: PedidoRepository = uow.pedidos  # type: ignore[assignment]

    pedido = repo.get_by_id_with_relations(pedido_id)
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )

    # Verificar acceso: propietario o ADMIN/GESTOR_PEDIDOS
    user_roles = {rol}
    is_admin_or_gestor = bool(user_roles & {"ADMIN", "PEDIDOS"})
    if pedido.usuario_id != usuario_id and not is_admin_or_gestor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para acceder a este pedido",
        )

    return _pedido_to_detail(pedido)


def avanzar_estado(
    uow: UnitOfWork,
    pedido_id: int,
    data: AvanzarEstadoRequest,
    usuario_id: int,
) -> PedidoRead:
    repo: PedidoRepository = uow.pedidos  # type: ignore[assignment]

    pedido = repo.get_by_id_with_relations(pedido_id)
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )

    estado_actual_nombre = pedido.estado.nombre if pedido.estado else "DESCONOCIDO"

    # Validar transicion
    if data.nuevo_estado not in TRANSICIONES_VALIDAS.get(estado_actual_nombre, []):
        if not TRANSICIONES_VALIDAS.get(estado_actual_nombre, []):
            detail = (
                f"ESTADO_TERMINAL: El pedido esta en estado "
                f"{estado_actual_nombre} y no permite cambios"
            )
        else:
            detail = (
                f"TRANSICION_INVALIDA: No se puede cambiar de "
                f"{estado_actual_nombre} a {data.nuevo_estado}"
            )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
        )

    nuevo_estado = repo.get_estado_by_nombre(data.nuevo_estado)
    if not nuevo_estado:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Estado '{data.nuevo_estado}' no existe",
        )

    # Actualizar estado
    pedido.estado_id = nuevo_estado.id
    uow.session.add(pedido)

    # Insertar historial
    historial = HistorialEstadoPedido(
        pedido_id=pedido.id,
        estado_id=nuevo_estado.id,
        usuario_id=usuario_id,
        estado_desde=datetime.now(timezone.utc),
        creado_en=datetime.now(timezone.utc),
        notas=data.motivo,
    )
    uow.session.add(historial)
    uow.session.flush()

    # Expire the pedido so SQLAlchemy reloads its relationships from DB
    uow.session.expire(pedido)

    # Recargar con relaciones
    pedido_actualizado = repo.get_by_id_with_relations(pedido.id)
    if not pedido_actualizado:
        raise HTTPException(status_code=500, detail="Error al actualizar pedido")

    return _pedido_to_read(pedido_actualizado)


def get_historial(
    uow: UnitOfWork,
    pedido_id: int,
    usuario_id: int,
    rol: str,
) -> list[HistorialRead]:
    repo: PedidoRepository = uow.pedidos  # type: ignore[assignment]

    # Verificar existencia y permiso
    pedido = repo.get_by_id(pedido_id)
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )

    user_roles = {rol}
    is_admin_or_gestor = bool(user_roles & {"ADMIN", "PEDIDOS"})
    if pedido.usuario_id != usuario_id and not is_admin_or_gestor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para acceder a este pedido",
        )

    registros = repo.get_historial(pedido_id)

    result = []
    for h in registros:
        result.append(HistorialRead(
            id=h.id,
            estado_nombre=h.estado.nombre if h.estado else "DESCONOCIDO",
            estado_desde=h.estado_desde.isoformat() if h.estado_desde else None,
            usuario_id=h.usuario_id,
            notas=h.notas,
            creado_en=h.creado_en,
        ))
    return result


def cancelar_pedido(
    uow: UnitOfWork,
    pedido_id: int,
    usuario_id: int,
) -> PedidoRead:
    repo: PedidoRepository = uow.pedidos  # type: ignore[assignment]

    pedido = repo.get_by_id_with_relations(pedido_id)
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )

    # Verificar propietario
    if pedido.usuario_id != usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes cancelar un pedido que no te pertenece",
        )

    estado_actual_nombre = pedido.estado.nombre if pedido.estado else ""
    if estado_actual_nombre not in ("PENDIENTE", "CONFIRMADO"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="CANCELACION_NO_PERMITIDA: Solo se puede cancelar pedidos en PENDIENTE o CONFIRMADO",
        )

    # Reutilizar avanzar_estado
    return avanzar_estado(
        uow,
        pedido_id,
        AvanzarEstadoRequest(nuevo_estado="CANCELADO", motivo="Cancelado por el cliente"),
        usuario_id,
    )
