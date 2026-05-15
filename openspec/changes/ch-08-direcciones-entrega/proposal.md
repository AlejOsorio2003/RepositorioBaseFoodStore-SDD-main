## Why

El módulo `direcciones/` existe con scaffolding vacío desde CH-02. El modelo `DireccionEntrega` está migrado en BD. CH-10 (Pedidos Backend) necesita que cada pedido pueda referenciar una dirección de entrega existente (`direccion_id FK`). Sin CRUD de direcciones, el flujo de checkout es incompleto. Este change activa las 4 capas funcionales del módulo.

## What Changes

- **`schemas.py`** — `DireccionCreate`, `DireccionUpdate`, `DireccionRead` completos con todos los campos del modelo.
- **`repository.py`** — `DireccionRepository` con métodos específicos: `list_by_usuario`, `get_principal`, `clear_principal`.
- **`service.py`** — lógica de negocio: CRUD con ownership check, invariante "solo una principal por usuario".
- **`router.py`** — 6 endpoints REST bajo `/api/v1/direcciones` con autenticación JWT.
- **`core/uow.py`** — `uow.direcciones` tipado como `DireccionRepository` (actualmente usa `BaseRepository`).

## Capabilities

### New Capabilities

- `direcciones-backend`: CRUD completo de direcciones de entrega por usuario autenticado. Invariante de dirección principal (solo una activa por usuario). Autorización: dueño o ADMIN.

### Modified Capabilities

_(ninguna)_

## Impact

**Backend:**
- `backend/app/direcciones/schemas.py` — reemplazado (stubs → schemas completos)
- `backend/app/direcciones/repository.py` — reemplazado (stub → DireccionRepository con métodos específicos)
- `backend/app/direcciones/service.py` — reemplazado (stub → DireccionService funcional)
- `backend/app/direcciones/router.py` — reemplazado (stub → 6 endpoints)
- `backend/app/core/uow.py` — tipado actualizado de `BaseRepository[DireccionEntrega]` a `DireccionRepository`

**Base de datos:** ningún cambio — tabla `direcciones_entrega` ya migrada en CH-00.
