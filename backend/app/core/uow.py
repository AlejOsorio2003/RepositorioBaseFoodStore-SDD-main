from types import TracebackType
from typing import Optional, Type

from sqlmodel import Session

from app.core.database import engine


class UnitOfWork:
    def __init__(self) -> None:
        self._session: Optional[Session] = None

    def __enter__(self) -> "UnitOfWork":
        self._session = Session(engine)
        self._init_repositories()
        return self

    def __exit__(
        self,
        exc_type: Optional[Type[BaseException]],
        exc_val: Optional[BaseException],
        exc_tb: Optional[TracebackType],
    ) -> None:
        if self._session is None:
            return
        try:
            if exc_type is None:
                self._session.commit()
            else:
                self._session.rollback()
        finally:
            self._session.close()
            self._session = None

    @property
    def session(self) -> Session:
        if self._session is None:
            raise RuntimeError("UnitOfWork is not active — use it as a context manager")
        return self._session

    def _init_repositories(self) -> None:
        # Inicializar repositorios para los distintos módulos del dominio
        from app.core.repository import BaseRepository

        # Auth / Usuarios
        from app.auth.models import Rol, Usuario
        from app.usuarios.repository import UsuarioRepository
        from app.refreshtokens.models import RefreshToken
        from app.refreshtokens.repository import RefreshTokenRepository

        self.usuarios: UsuarioRepository = UsuarioRepository(self.session, Usuario)
        self.roles: BaseRepository[Rol] = BaseRepository(self.session, Rol)
        self.refresh_tokens: RefreshTokenRepository = RefreshTokenRepository(self.session, RefreshToken)

        # Productos / Categorias / Ingredientes
        from app.productos.models import Producto
        from app.productos.repository import ProductoRepository
        from app.categorias.models import Categoria
        from app.categorias.repository import CategoriaRepository
        from app.ingredientes.models import Ingrediente
        from app.ingredientes.repository import IngredienteRepository

        self.productos: ProductoRepository = ProductoRepository(self.session, Producto)
        self.categorias: CategoriaRepository = CategoriaRepository(self.session, Categoria)
        self.ingredientes: IngredienteRepository = IngredienteRepository(self.session, Ingrediente)

        # Pedidos / Pagos / Direcciones
        from app.pedidos.models import Pedido
        from app.pedidos.repository import PedidoRepository
        from app.pagos.models import Pago
        from app.pagos.repository import PagoRepository
        from app.direcciones.models import DireccionEntrega
        from app.direcciones.repository import DireccionRepository

        self.pedidos: PedidoRepository = PedidoRepository(self.session, Pedido)
        self.pagos: PagoRepository = PagoRepository(self.session, Pago)
        self.direcciones: DireccionRepository = DireccionRepository(self.session, DireccionEntrega)

        # Admin (queries raw cross-modulo)
        from app.admin.repository import AdminRepository

        self.admin: AdminRepository = AdminRepository(self.session)
