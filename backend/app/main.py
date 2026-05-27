from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import settings
from app.core.error_handler import register_error_handlers
from app.core.rate_limit import limiter

from sqlmodel import Session

import app.core.all_models  # noqa: F401 — registers all SQLAlchemy mappers before any router import

from app.core.database import engine
from app.pedidos.models import seed_estados_pedido

from app.admin.router import router as admin_router
from app.auth.router import router as auth_router
from app.categorias.router import router as categorias_router
from app.cocina.router import router as cocina_router
from app.cocina.ws import cocina_ws_endpoint
from app.direcciones.router import router as direcciones_router
from app.ingredientes.router import router as ingredientes_router
from app.pagos.router import router as pagos_router
from app.pedidos.router import router as pedidos_router
from app.productos.router import router as productos_router
from app.refreshtokens.router import router as refreshtokens_router
from app.usuarios.router import router as usuarios_router


def seed_roles(session: Session) -> None:
    from sqlmodel import select

    from app.auth.models import Rol

    roles_data = [
        ("CLIENT", "Cliente del sistema"),
        ("ADMIN", "Administrador"),
        ("GESTOR_PEDIDOS", "Gestor de pedidos"),
        ("GESTOR_STOCK", "Gestor de stock"),
        ("COCINA", "Personal de cocina — KDS"),
    ]
    for nombre, desc in roles_data:
        if not session.exec(select(Rol).where(Rol.nombre == nombre)).first():
            session.add(Rol(nombre=nombre, descripcion=desc))
    session.commit()


def seed_dev_users(session: Session) -> None:
    from sqlmodel import select

    from app.auth.models import Rol, Usuario, UsuarioRol
    from app.core.security import hash_password

    cocina_user_data = {
        "email": "cocina@foodstore.com",
        "password": "cocina123",
        "nombre": "Cocina",
        "apellido": "KDS",
        "rol_nombre": "COCINA",
    }

    existing = session.exec(
        select(Usuario).where(Usuario.email == cocina_user_data["email"])
    ).first()
    if not existing:
        rol = session.exec(
            select(Rol).where(Rol.nombre == cocina_user_data["rol_nombre"])
        ).first()
        if rol:
            usuario = Usuario(
                email=cocina_user_data["email"],
                password_hash=hash_password(cocina_user_data["password"]),
                nombre=cocina_user_data["nombre"],
                apellido=cocina_user_data["apellido"],
                is_active=True,
            )
            session.add(usuario)
            session.flush()
            session.add(UsuarioRol(usuario_id=usuario.id, rol_id=rol.id))
    session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    with Session(engine) as session:
        seed_estados_pedido(session)
        seed_roles(session)
        seed_dev_users(session)
    yield


app = FastAPI(
    title="Food Store API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_exception_handler(429, _rate_limit_exceeded_handler)

register_error_handlers(app)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(usuarios_router, prefix="/api/v1/usuarios", tags=["usuarios"])
app.include_router(categorias_router, prefix="/api/v1/categorias", tags=["categorias"])
app.include_router(productos_router, prefix="/api/v1/productos", tags=["productos"])
app.include_router(pedidos_router, prefix="/api/v1/pedidos", tags=["pedidos"])
app.include_router(pagos_router, prefix="/api/v1/pagos", tags=["pagos"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(cocina_router, prefix="/api/v1/cocina", tags=["cocina"])

# Routers con prefix y tags definidos directamente en el APIRouter
app.include_router(refreshtokens_router)
app.include_router(ingredientes_router)
app.include_router(direcciones_router)


@app.websocket("/api/v1/cocina/ws")
async def cocina_ws(websocket: WebSocket) -> None:
    await cocina_ws_endpoint(websocket)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
