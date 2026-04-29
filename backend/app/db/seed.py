from datetime import timezone, datetime

from sqlmodel import Session, select

from app.auth.models import Rol, Usuario, UsuarioRol
from app.categorias.models import Categoria
from app.core.database import engine
from app.core.security import hash_password
from app.pedidos.models import EstadoPedido
from app.productos.models import FormaPago


def _upsert_rol(session: Session, nombre: str, descripcion: str) -> Rol:
    rol = session.exec(select(Rol).where(Rol.nombre == nombre)).first()
    if not rol:
        rol = Rol(nombre=nombre, descripcion=descripcion)
        session.add(rol)
        session.flush()
    return rol


def _upsert_usuario(session: Session, email: str, nombre: str, apellido: str, plain_password: str) -> Usuario:
    usuario = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not usuario:
        usuario = Usuario(
            email=email,
            nombre=nombre,
            apellido=apellido,
            password_hash=hash_password(plain_password),
        )
        session.add(usuario)
        session.flush()
    return usuario


def _upsert_estado(session: Session, nombre: str, es_terminal: bool) -> EstadoPedido:
    estado = session.exec(select(EstadoPedido).where(EstadoPedido.nombre == nombre)).first()
    if not estado:
        estado = EstadoPedido(nombre=nombre, es_terminal=es_terminal)
        session.add(estado)
        session.flush()
    return estado


def _upsert_forma_pago(session: Session, nombre: str, codigo: str) -> FormaPago:
    forma = session.exec(select(FormaPago).where(FormaPago.codigo == codigo)).first()
    if not forma:
        forma = FormaPago(nombre=nombre, codigo=codigo, habilitado=True)
        session.add(forma)
        session.flush()
    return forma


def _upsert_categoria(session: Session, nombre: str, slug: str, parent_id: int | None = None) -> Categoria:
    cat = session.exec(select(Categoria).where(Categoria.slug == slug)).first()
    if not cat:
        cat = Categoria(nombre=nombre, slug=slug, parent_id=parent_id)
        session.add(cat)
        session.flush()
    return cat


def seed() -> None:
    import app.core.all_models  # noqa: F401 — ensures metadata is populated

    with Session(engine) as session:
        rol_admin = _upsert_rol(session, "ADMIN", "Administrador del sistema")
        rol_stock = _upsert_rol(session, "STOCK", "Gestor de stock y catálogo")
        rol_pedidos = _upsert_rol(session, "PEDIDOS", "Gestor de pedidos")
        rol_client = _upsert_rol(session, "CLIENT", "Cliente registrado")

        usuarios_data = [
            ("admin@foodstore.com", "Admin", "Sistema", "admin123", rol_admin),
            ("stock@foodstore.com", "Stock", "Manager", "stock123", rol_stock),
            ("pedidos@foodstore.com", "Pedidos", "Manager", "pedidos123", rol_pedidos),
            ("cliente@foodstore.com", "Juan", "Pérez", "cliente123", rol_client),
        ]
        for email, nombre, apellido, pwd, rol in usuarios_data:
            usuario = _upsert_usuario(session, email, nombre, apellido, pwd)
            existing_link = session.exec(
                select(UsuarioRol).where(
                    UsuarioRol.usuario_id == usuario.id,
                    UsuarioRol.rol_id == rol.id,
                )
            ).first()
            if not existing_link:
                session.add(UsuarioRol(usuario_id=usuario.id, rol_id=rol.id))

        estados = [
            ("PENDIENTE", False),
            ("CONFIRMADO", False),
            ("EN_PREP", False),
            ("EN_CAMINO", False),
            ("ENTREGADO", True),
            ("CANCELADO", True),
        ]
        for nombre, es_terminal in estados:
            _upsert_estado(session, nombre, es_terminal)

        _upsert_forma_pago(session, "MercadoPago", "mercadopago")
        _upsert_forma_pago(session, "Efectivo", "efectivo")

        carnes = _upsert_categoria(session, "Carnes", "carnes")
        _upsert_categoria(session, "Lácteos", "lacteos")
        _upsert_categoria(session, "Panificados", "panificados")
        _upsert_categoria(session, "Vacuno", "vacuno", parent_id=carnes.id)

        session.commit()
        print("Seed completado.")


if __name__ == "__main__":
    seed()
