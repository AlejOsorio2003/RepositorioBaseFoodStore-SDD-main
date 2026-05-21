## Why

El personal de cocina no tiene visibilidad en tiempo real sobre los pedidos confirmados ni puede actualizar su estado (EN_PREP, EN_CAMINO) desde la pantalla de trabajo. El flujo actual obliga al administrador a avanzar manualmente los estados, creando un cuello de botella operativo.

## What Changes

- Nuevo rol `COCINA` en el sistema RBAC con seed idempotente
- Nuevo módulo backend `cocina/` con:
  - `GET /api/v1/cocina/pedidos` — lista pedidos en estados relevantes para cocina (CONFIRMADO, EN_PREP)
  - `PATCH /api/v1/cocina/pedidos/{id}/estado` — avanzar estado (CONFIRMADO→EN_PREP, EN_PREP→EN_CAMINO) solo por COCINA
  - `WebSocket /api/v1/cocina/ws` — push de nuevos pedidos CONFIRMADO en tiempo real; fallback polling si WS no disponible
- FSM actualizado: rol COCINA puede ejecutar transiciones `CONFIRMADO→EN_PREP` y `EN_PREP→EN_CAMINO`
- Nuevo frontend KDS (Kitchen Display System):
  - Vista de dos columnas: "Por preparar" (CONFIRMADO) y "En preparación" (EN_PREP)
  - Timer de urgencia por pedido (amarillo >10 min, rojo >20 min desde CONFIRMADO)
  - Botones de avance de estado por tarjeta
  - Conexión WebSocket con fallback a polling cada 30 s
  - Ruta protegida `/cocina` — solo rol COCINA

## Capabilities

### New Capabilities
- `cocina-backend`: módulo FastAPI con endpoints REST + WebSocket para el rol COCINA, seed del rol, transiciones FSM restringidas
- `cocina-frontend`: KDS React con dos columnas, tarjetas de pedido, timers de urgencia, WS + fallback polling

### Modified Capabilities
- `pedidos-backend`: el requirement "Avanzar estado" se extiende — además de ADMIN y GESTOR_PEDIDOS, el rol COCINA puede ejecutar las transiciones CONFIRMADO→EN_PREP y EN_PREP→EN_CAMINO

## Impact

- **Backend:** nuevo módulo `backend/app/cocina/` (model no necesario — opera sobre `Pedido`/`EstadoPedido`), wiring en `main.py` y `UoW`; extensión del dict `TRANSICIONES_VALIDAS` en `pedidos/service.py` o lógica de rol en `cocina/service.py`
- **Frontend:** nueva página `pages/CocinaPage.tsx`, feature `features/cocina/`, ruta `/cocina` en router, guard de rol COCINA
- **Auth:** seed del rol `COCINA` en startup; usuario de prueba `cocina@foodstore.com` en seed de desarrollo
- **Dependencias:** `websockets` ya incluido en FastAPI/Starlette; no se requieren nuevas dependencias backend
