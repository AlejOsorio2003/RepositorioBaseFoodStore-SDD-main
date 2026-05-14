## MODIFIED Requirements

### Requirement: Modelos SQLModel del ERD v5
El módulo `app/core/all_models.py` SHALL importar los 16 modelos SQLModel del ERD v5 desde sus módulos de dominio correctos: `Usuario`, `Rol`, `UsuarioRol` desde `app.usuarios.models`; `RefreshToken` desde `app.refreshtokens.models`; `DireccionEntrega` desde `app.direcciones.models`; `Categoria` desde `app.categorias.models`; `Producto`, `ProductoCategoria`, `ProductoIngrediente`, `FormaPago` desde `app.productos.models`; `Ingrediente` desde `app.ingredientes.models`; `EstadoPedido`, `Pedido`, `DetallePedido`, `HistorialEstadoPedido` desde `app.pedidos.models`; `Pago` desde `app.pagos.models`. Cada modelo SHALL mantener exactamente el mismo `__tablename__`, columnas, constraints y FKs del ERD v5 original. No se permiten cambios a la estructura de tablas — solo al path de importación en Python.

#### Scenario: Migración inicial sin errores
- **WHEN** se ejecuta `alembic upgrade head` contra una base de datos vacía
- **THEN** las 16 tablas son creadas sin errores y `alembic_version` registra la revisión

#### Scenario: Soft delete disponible
- **WHEN** un modelo tiene el campo `deleted_at: Optional[datetime]`
- **THEN** el campo es nullable en la base de datos y el modelo hereda de una clase base que lo declara

#### Scenario: Alembic no detecta cambios pendientes
- **WHEN** se ejecuta `alembic check` con todos los modelos importados en `all_models.py`
- **THEN** Alembic reporta que no hay nuevas operaciones de upgrade pendientes (tablas sin cambios de estructura)

#### Scenario: RefreshToken importable desde refreshtokens
- **WHEN** se importa `from app.refreshtokens.models import RefreshToken`
- **THEN** la clase resuelve con `__tablename__ == "refresh_tokens"`

#### Scenario: Ingrediente importable desde ingredientes
- **WHEN** se importa `from app.ingredientes.models import Ingrediente`
- **THEN** la clase resuelve con `__tablename__ == "ingredientes"`

#### Scenario: DireccionEntrega importable desde direcciones
- **WHEN** se importa `from app.direcciones.models import DireccionEntrega`
- **THEN** la clase resuelve con `__tablename__ == "direcciones_entrega"`

---

## ADDED Requirements

### Requirement: Scaffolding Feature-First completo en todos los módulos
Cada módulo de dominio del backend (`usuarios`, `categorias`, `productos`, `pedidos`, `pagos`, `admin`, `refreshtokens`, `ingredientes`, `direcciones`) SHALL tener los cinco archivos de la arquitectura Feature-First: `models.py`, `schemas.py`, `repository.py`, `service.py`, `router.py`. Los archivos `schemas.py`, `repository.py` y `service.py` en módulos aún sin implementación SHALL contener la estructura mínima correcta (clase con herencia y type hints) con comentario `# Implementado en CH-XX`. Los `router.py` sin endpoints SHALL definir un `APIRouter` vacío.

#### Scenario: Módulo usuarios tiene todos los archivos
- **WHEN** se listan los archivos en `app/usuarios/`
- **THEN** existen exactamente: `__init__.py`, `models.py`, `schemas.py`, `repository.py`, `service.py`, `router.py`

#### Scenario: Repository hereda BaseRepository
- **WHEN** se importa cualquier `XxxRepository` de un módulo de dominio
- **THEN** la clase hereda de `BaseRepository[XxxModel]` y el type checker no reporta errores

#### Scenario: Importación limpia del paquete app
- **WHEN** se ejecuta `python -c "from app.core.all_models import *"` con el entorno virtual activo
- **THEN** no se producen errores de importación, importaciones circulares ni `ModuleNotFoundError`
