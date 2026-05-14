# Importaciones de todos los modelos del proyecto
# para que Alembic pueda detectar todas las tablas
# noqa: F401 — importsKeep usados solo para efecto secundario (registro SQLModel)

from app.auth.models import Rol, Usuario, UsuarioRol  # noqa: F401
from app.categorias.models import Categoria  # noqa: F401
from app.direcciones.models import DireccionEntrega  # noqa: F401
from app.ingredientes.models import Ingrediente  # noqa: F401
from app.pagos.models import Pago  # noqa: F401
from app.pedidos.models import (  # noqa: F401
    DetallePedido,
    EstadoPedido,
    HistorialEstadoPedido,
    Pedido,
)
from app.productos.models import (  # noqa: F401
    FormaPago,
    Producto,
    ProductoCategoria,
    ProductoIngrediente,
)
from app.refreshtokens.models import RefreshToken  # noqa: F401
