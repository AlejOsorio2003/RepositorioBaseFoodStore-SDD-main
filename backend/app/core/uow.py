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
        from app.auth.models import RefreshToken, Rol, Usuario
        from app.categorias.models import Categoria
        from app.categorias.repository import CategoriaRepository
        from app.core.repository import BaseRepository
        from app.direcciones.models import DireccionEntrega
        from app.pagos.models import Pago
        from app.pedidos.models import EstadoPedido, Pedido
        from app.productos.models import FormaPago, Ingrediente, Producto

        self.usuarios: BaseRepository[Usuario] = BaseRepository(self.session, Usuario)
        self.roles: BaseRepository[Rol] = BaseRepository(self.session, Rol)
        self.refresh_tokens: BaseRepository[RefreshToken] = BaseRepository(self.session, RefreshToken)
        self.direcciones: BaseRepository[DireccionEntrega] = BaseRepository(self.session, DireccionEntrega)
        self.categorias: CategoriaRepository = CategoriaRepository(self.session, Categoria)
        self.productos: BaseRepository[Producto] = BaseRepository(self.session, Producto)
        self.ingredientes: BaseRepository[Ingrediente] = BaseRepository(self.session, Ingrediente)
        self.formas_pago: BaseRepository[FormaPago] = BaseRepository(self.session, FormaPago)
        self.estados_pedido: BaseRepository[EstadoPedido] = BaseRepository(self.session, EstadoPedido)
        self.pedidos: BaseRepository[Pedido] = BaseRepository(self.session, Pedido)
        self.pagos: BaseRepository[Pago] = BaseRepository(self.session, Pago)
