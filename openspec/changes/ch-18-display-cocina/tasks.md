## 1. Backend — Seed y RBAC

- [ ] 1.1 En el seed de startup (`main.py` o `core/seed.py`): agregar rol `COCINA` de forma idempotente junto a los roles existentes
- [ ] 1.2 En el seed de desarrollo: agregar usuario `cocina@foodstore.com / cocina123` con rol COCINA (idempotente)

## 2. Backend — Módulo cocina (estructura)

- [ ] 2.1 Crear `backend/app/cocina/schemas.py`: `CocinaEstadoRequest(nuevo_estado: str)`, `PedidoCocinaSummary` (id, estado_nombre, items resumidos, created_at, tiempo_desde_confirmado)
- [ ] 2.2 Crear `backend/app/cocina/repository.py`: `CocinaRepository` con `list_pedidos_activos()` — query pedidos con `estado_nombre IN ("CONFIRMADO", "EN_PREP")` ordenados por `created_at ASC`
- [ ] 2.3 Agregar `uow.cocina: CocinaRepository` en `core/uow.py`

## 3. Backend — Service y Router REST

- [ ] 3.1 Crear `backend/app/cocina/service.py`: función `listar_pedidos(uow)` y `avanzar_estado_cocina(pedido_id, nuevo_estado, uow)` — valida que la transición sea CONFIRMADO→EN_PREP o EN_PREP→EN_CAMINO, delega a `pedidos.service.avanzar_estado`; lanza 422 `TRANSICION_NO_PERMITIDA_ROL` para cualquier otra
- [ ] 3.2 Crear `backend/app/cocina/router.py`: `GET /api/v1/cocina/pedidos` → `require_role(["COCINA"])` → `service.listar_pedidos`; `PATCH /api/v1/cocina/pedidos/{id}/estado` → `require_role(["COCINA"])` → `service.avanzar_estado_cocina`
- [ ] 3.3 Registrar `cocina_router` en `backend/app/main.py`

## 4. Backend — WebSocket

- [ ] 4.1 Crear `backend/app/cocina/ws.py`: `ConnectionManager` con `connect`, `disconnect`, `broadcast`; endpoint `WebSocket /api/v1/cocina/ws` — recibe primer mensaje con JWT, valida rol COCINA, cierra con código 4001 si inválido
- [ ] 4.2 En `cocina/router.py`: agregar la ruta WS usando `APIRouter` o directamente en `main.py`
- [ ] 4.3 En `pagos/service.py` o `pedidos/service.py`: al avanzar pedido a CONFIRMADO, llamar a `manager.broadcast(...)` para notificar a clientes WS conectados (import del manager de cocina)

## 5. Frontend — Entity y API

- [ ] 5.1 Crear `frontend/src/entities/cocina/types.ts`: `PedidoCocinaSummary`, `CocinaEstadoRequest`
- [ ] 5.2 Crear `frontend/src/entities/cocina/api.ts`: `listarPedidosCocina()` → `GET /api/v1/cocina/pedidos`; `avanzarEstadoCocina(pedidoId, nuevoEstado)` → `PATCH /api/v1/cocina/pedidos/{id}/estado`
- [ ] 5.3 Exportar desde `frontend/src/entities/cocina/index.ts`

## 6. Frontend — Feature cocina

- [ ] 6.1 Crear `features/cocina/hooks/useCocinaWs.ts`: hook que abre WS a `/api/v1/cocina/ws`, envía JWT como primer mensaje, invalida query `["cocina","pedidos"]` al recibir evento; fallback: si WS falla, activa polling 30 s; expone `wsStatus: "connected"|"polling"|"error"`
- [ ] 6.2 Crear `features/cocina/hooks/useCocina.ts`: TanStack Query `useQuery` sobre `listarPedidosCocina`, key `["cocina","pedidos"]`; `useMutation` sobre `avanzarEstadoCocina` con `onSuccess: invalidateQueries`
- [ ] 6.3 Crear `features/cocina/ui/KdsTarjeta.tsx`: muestra `#id`, lista de ítems, timer live (neutro/<10 min, amarillo ≥10, rojo ≥20) calculado desde `created_at`, botón contextual ("Iniciar preparación" o "Listo para envío") con spinner en `isPending`, toast de error si falla
- [ ] 6.4 Crear `features/cocina/ui/KdsColumna.tsx`: recibe `titulo`, `pedidos[]`, renderiza lista de `KdsTarjeta` o placeholder "Sin pedidos"
- [ ] 6.5 Exportar desde `features/cocina/index.ts`

## 7. Frontend — Página y Router

- [ ] 7.1 Crear `pages/CocinaPage.tsx`: usa `useCocinaWs` y `useCocina`; layout dos columnas ("Por preparar" con CONFIRMADO, "En preparación" con EN_PREP); indicador visual `wsStatus`; skeleton durante loading; mensaje error con retry
- [ ] 7.2 En `app/router.tsx`: agregar ruta `/cocina` → `<CocinaPage />` con guard `require_role(["COCINA"])` (si no autenticado → `/login`, si rol incorrecto → `/`)
- [ ] 7.3 En `shared/ui/Header.tsx`: agregar enlace "Cocina" visible solo para el rol COCINA

## 8. Verificación

- [ ] 8.1 `GET /api/v1/cocina/pedidos` con JWT COCINA → 200 con pedidos CONFIRMADO y EN_PREP
- [ ] 8.2 `GET /api/v1/cocina/pedidos` sin JWT → 401
- [ ] 8.3 `GET /api/v1/cocina/pedidos` con JWT CLIENT → 403
- [ ] 8.4 `PATCH /api/v1/cocina/pedidos/{id}/estado` con `{"nuevo_estado":"EN_PREP"}` desde CONFIRMADO → 200
- [ ] 8.5 `PATCH /api/v1/cocina/pedidos/{id}/estado` con `{"nuevo_estado":"ENTREGADO"}` → 422 `TRANSICION_NO_PERMITIDA_ROL`
- [ ] 8.6 Browser: navegar a `/cocina` con usuario COCINA → ver KDS dos columnas
- [ ] 8.7 Browser: click "Iniciar preparación" → tarjeta se mueve a columna "En preparación"
- [ ] 8.8 Browser: abrir pedido en otra ventana como ADMIN y confirmar → aparece en columna "Por preparar" (WS o polling)
