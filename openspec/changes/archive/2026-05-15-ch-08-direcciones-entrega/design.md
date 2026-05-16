## Context

El scaffolding de `direcciones/` existe desde CH-02. El modelo `DireccionEntrega` está en BD con campos: `id`, `usuario_id`, `calle`, `numero`, `piso`, `departamento`, `ciudad`, `provincia`, `codigo_postal`, `es_principal`, `deleted_at`, `created_at`. El router ya tiene `prefix="/api/v1/direcciones"` y se registra en `main.py` via `app.include_router(direcciones_router)` sin prefix adicional (mismo patrón que ingredientes). El `uow.direcciones` existe pero con tipo `BaseRepository[DireccionEntrega]` — hay que actualizarlo a `DireccionRepository`.

Nota: el ERD v5 del spec menciona campos `alias` y `linea1`, pero el modelo ya migrado usa `calle`, `numero`, `piso`, `departamento`, `ciudad`, `provincia`, `codigo_postal`. Se respeta el modelo existente para evitar migraciones adicionales.

## Goals / Non-Goals

**Goals:**
- 6 endpoints REST: listar, crear, obtener, actualizar, eliminar (soft) y marcar principal
- Autorización: el usuario solo puede ver/modificar sus propias direcciones; ADMIN puede operar sobre cualquiera
- Invariante de principal: `PATCH /{id}/principal` desactiva todas las otras del usuario y activa la indicada
- Soft delete: `DELETE /{id}` asigna `deleted_at = now()`, no elimina la fila
- No se puede eliminar una dirección que sea `es_principal = True` mientras sea la única del usuario

**Non-Goals:**
- Frontend (no hay CH correspondiente de frontend para direcciones en v1)
- Validación de dirección real contra API de geolocalización
- Límite máximo de direcciones por usuario

## Decisions

### D1 — Rutas planas `/api/v1/direcciones` (no anidadas bajo `/usuarios`)

El router ya tiene `prefix="/api/v1/direcciones"`. Las rutas planas son más simples y el `usuario_id` se obtiene del JWT (`get_current_user`) en lugar de la URL. El admin puede usar el query param `?usuario_id=X` para filtrar por usuario.

**Alternativa descartada:** `/api/v1/usuarios/{usuario_id}/direcciones` — requiere reestructurar el router y el registro en `main.py`. El resultado funcional es idéntico.

### D2 — Ownership check en el service, no en el router

El service verifica que la dirección pertenezca al `current_user.id` antes de operar. ADMIN bypassa el check. Así el router queda limpio de lógica de autorización.

### D3 — `PATCH /{id}/principal` como endpoint dedicado

Marcar una dirección como principal implica dos operaciones atómicas: limpiar `es_principal` de todas las otras y activar la indicada. Al ser un endpoint dedicado, la intención es explícita y el service puede envolver ambas operaciones en el mismo UoW (commit automático al salir).

**Alternativa descartada:** incluirlo en `PUT /{id}` — si el cliente envía `es_principal: true` en el body, hay que inferir la intención y ejecutar la limpieza. Menos claro y más propenso a bugs.

### D4 — Soft delete con validación de principal

Si la dirección a eliminar es `es_principal = True`, el service lanza 422 con mensaje "No se puede eliminar la dirección principal — asigná otra como principal primero". Esto protege el invariante sin lógica compleja de reasignación automática.

## Risks / Trade-offs

- [Sin límite de direcciones] Un usuario podría crear cientos de direcciones. → Aceptado en v1; si escala, agregar validación de máximo en el service.
- [Dirección referenciada en pedidos] Si una dirección se elimina (soft delete) después de usarse en un pedido, el pedido sigue válido porque el pedido guarda snapshot del `direccion_id`. → No es problema porque el pedido almacena el FK y el soft delete no elimina la fila.
