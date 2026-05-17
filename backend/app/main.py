from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import settings
from app.core.error_handler import register_error_handlers
from app.core.rate_limit import limiter

from sqlmodel import Session

from app.core.database import engine
from app.pedidos.models import seed_estados_pedido

from app.admin.router import router as admin_router
from app.auth.router import router as auth_router
from app.categorias.router import router as categorias_router
from app.direcciones.router import router as direcciones_router
from app.ingredientes.router import router as ingredientes_router
from app.pagos.router import router as pagos_router
from app.pedidos.router import router as pedidos_router
from app.productos.router import router as productos_router
from app.refreshtokens.router import router as refreshtokens_router
from app.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    with Session(engine) as session:
        seed_estados_pedido(session)
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

# Routers con prefix y tags definidos directamente en el APIRouter
app.include_router(refreshtokens_router)
app.include_router(ingredientes_router)
app.include_router(direcciones_router)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
