## Why

El proyecto tiene la estructura de directorios definida pero incompleta y desalineada: varios modelos de dominio residen en módulos incorrectos (`RefreshToken` en `auth/`, `Ingrediente` y `FormaPago` en `productos/`, `DireccionEntrega` en `usuarios/`), todos los módulos de backend excepto `auth` carecen de las capas `schemas.py / repository.py / service.py`, y el frontend tiene las capas FSD (`features/`, `entities/`) vacías más un directorio `widgets/` que no corresponde a Feature-Sliced Design. Esta deuda estructural debe resolverse ahora, antes de implementar cualquier CH posterior, para que cada change pueda construir sobre una base coherente sin refactors sorpresivos.

## What Changes

### Backend

- **Nuevo módulo `refreshtokens/`**: extrae el modelo `RefreshToken` de `auth/models.py`, agrega `schemas.py`, `repository.py` (`RefreshTokenRepository`), `service.py` (`RefreshTokenService`), `router.py` (placeholder vacío).
- **Nuevo módulo `ingredientes/`**: extrae el modelo `Ingrediente` de `productos/models.py`, agrega `schemas.py`, `repository.py`, `service.py`, `router.py` (placeholder).
- **Nuevo módulo `direcciones/`**: extrae el modelo `DireccionEntrega` de `usuarios/models.py`, agrega `schemas.py`, `repository.py`, `service.py`, `router.py` (placeholder).
- **Scaffolding de capas faltantes**: para cada módulo existente sin service/repository/schemas (`usuarios`, `categorias`, `productos`, `pedidos`, `pagos`, `admin`) se crean los archivos con estructura mínima (clases vacías, tipado correcto, herencia de `BaseRepository[T]`).
- **Actualización de `core/all_models.py`**: re-importa todos los modelos desde sus nuevas ubicaciones.
- **Actualización de imports cruzados**: todo archivo que apunte a `auth.models.RefreshToken`, `productos.models.Ingrediente` o `usuarios.models.DireccionEntrega` se actualiza al nuevo path.
- **`main.py`**: registrar los routers de `ingredientes` y `direcciones` (placeholders) en los prefijos `/api/v1/ingredientes` y `/api/v1/direcciones`.

### Frontend

- **Eliminar `widgets/`**: el directorio `frontend/src/widgets/` no forma parte de FSD y se remueve.
- **Barrel exports**: agregar `index.ts` con re-exports mínimos (o comentarios de intención) en `features/`, `entities/`, `shared/ui/`, `shared/types/`, `shared/lib/`.
- **`shared/types/index.ts`**: definir tipos base de dominio compartidos (`UUID`, `Timestamp`, `PaginatedResponse<T>`, `ApiError`) para uso en toda la app.
- **`shared/ui/index.ts`**: reservar exports de componentes UI reutilizables (actualmente vacío con comentario de intención).

## Capabilities

### New Capabilities

- `refreshtokens-module`: Módulo de dominio para refresh tokens con su propia capa de repository y service, desacoplado de `auth/`.
- `ingredientes-module`: Módulo de dominio para ingredientes y alérgenos, listo para implementación de CRUD en CH-07.
- `direcciones-module`: Módulo de dominio para direcciones de entrega, listo para CH-08.

### Modified Capabilities

- `backend-infra`: La infraestructura de módulos del backend se expande con tres nuevos módulos de dominio y se completa el scaffolding de capas (schemas/repository/service) en todos los módulos existentes.
- `frontend-infra`: La estructura FSD se corrige: se elimina `widgets/`, se añaden barrels a capas vacías y se definen tipos base en `shared/types/`.

## Impact

- **Alembic / migraciones**: los modelos se mueven de archivo Python pero las tablas en BD no cambian — no se requiere nueva migración, solo verificar que `all_models.py` importe todo correctamente para que Alembic siga detectando los modelos.
- **`auth/service.py` y `auth/router.py`**: actualizan import de `RefreshToken` al nuevo path `refreshtokens.models`.
- **`backend/app/db/seed.py`**: actualiza imports si referencia modelos movidos.
- **`frontend/src/shared/types/index.ts`**: pasa de archivo vacío a tipos base — cualquier página que importe de él puede empezar a usar los tipos.
- Sin cambios en API pública ni en contratos HTTP.
