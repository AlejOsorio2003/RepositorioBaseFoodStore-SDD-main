## Context

El sistema ya cuenta con un FSM de 6 estados para pedidos y un RBAC con 4 roles (CLIENT, ADMIN, GESTOR_PEDIDOS, GESTOR_STOCK). El módulo de pedidos expone `PATCH /pedidos/{id}/estado` restringido a ADMIN/GESTOR_PEDIDOS. El personal de cocina necesita su propia interfaz y permisos para operar sin acceso al panel de administración completo.

FastAPI/Starlette incluye soporte nativo de WebSocket. El frontend usa TanStack Query con polling como patrón establecido (OrdersPage).

## Goals / Non-Goals

**Goals:**
- Rol COCINA con acceso limitado: solo puede avanzar CONFIRMADO→EN_PREP y EN_PREP→EN_CAMINO
- Endpoint REST `GET /cocina/pedidos` y `PATCH /cocina/pedidos/{id}/estado` (separados del módulo pedidos para no romper RBAC existente)
- WebSocket `/cocina/ws` para notificaciones push de nuevos pedidos CONFIRMADO
- KDS frontend con dos columnas, timers de urgencia y fallback polling cada 30 s

**Non-Goals:**
- Gestión de usuarios COCINA (lo hace ADMIN desde el panel existente)
- Chat o mensajería entre cocina y delivery
- Tracking GPS o mapas de entrega
- PWA / instalación en tablet (funciona en browser mobile)

## Decisions

### D1: Módulo propio `cocina/` vs extender `pedidos/`

**Decisión:** Módulo separado `backend/app/cocina/`.

**Rationale:** El RBAC de cocina es distinto al de ADMIN/GESTOR_PEDIDOS. Separar el módulo evita contaminar el service de pedidos con lógica de rol específica de cocina y mantiene la regla de oro Router→Service→UoW→Repository→Model. El `cocina/service.py` delega al `uow.pedidos` para las transiciones, sin duplicar la lógica FSM.

**Alternativa descartada:** Agregar `COCINA` al endpoint `PATCH /pedidos/{id}/estado` existente — rompe el principio de menor privilegio y expone endpoints de listado general al rol COCINA.

---

### D2: WebSocket vs Server-Sent Events (SSE)

**Decisión:** WebSocket con fallback a polling TanStack Query (intervalo 30 s).

**Rationale:** WebSocket está disponible nativo en Starlette sin dependencias extra. El fallback garantiza funcionalidad en entornos con proxies que no soportan WS largo.

**Alternativa descartada:** SSE — más simple pero menos soporte en proxies corporativos y no estandarizado en el stack actual.

---

### D3: Estado del KDS en el frontend

**Decisión:** TanStack Query para el listado de pedidos; estado local React (`useState`) para el timer de urgencia por tarjeta. Sin Zustand store para cocina.

**Rationale:** Los pedidos de cocina son estado de servidor → TanStack Query. Los timers son efímeros y locales al componente de tarjeta → `useState` + `useEffect` con `setInterval`. No amerita un store global.

---

### D4: Seed del rol COCINA y usuario de prueba

**Decisión:** Agregar `COCINA` al seed idempotente en `main.py` junto a los roles existentes. Agregar usuario `cocina@foodstore.com / cocina123` en el seed de desarrollo.

**Rationale:** Consistente con el patrón de seed existente (roles + usuario admin ya se seedean en startup).

---

### D5: Transiciones FSM para COCINA

**Decisión:** El `cocina/service.py` verifica explícitamente que la transición solicitada sea `CONFIRMADO→EN_PREP` o `EN_PREP→EN_CAMINO`. Usa la función `avanzar_estado` del módulo pedidos internamente (reutiliza validación FSM).

**Rationale:** Reutilizar `avanzar_estado` evita duplicar la lógica de historial y FSM. La restricción de qué transiciones puede hacer COCINA se impone en `cocina/service.py`, no en `pedidos/service.py`.

## Risks / Trade-offs

- **WS con múltiples workers:** Si uvicorn corre con múltiples workers, las conexiones WS no se comparten entre procesos → cada worker mantiene su propio set de clientes. Mitigation: para producción usar 1 worker + Redis pub/sub, o aceptar la limitación en el entorno académico (1 worker).
- **Timer drift:** Los timers de urgencia en frontend se calculan desde `created_at` del pedido (momento de creación, no de confirmación). Mitigation: usar el campo `created_at` del primer historial con estado CONFIRMADO si está disponible; sino usar `created_at` del pedido como aproximación.
- **Broadcast en WS:** El broadcast a todos los clientes conectados es O(n clientes). Para el contexto académico (pocos clientes simultáneos) es aceptable.

## Open Questions

- ¿El timer de urgencia se basa en la hora de creación del pedido o en la hora en que pasó a CONFIRMADO? → Usar el `created_at` del `HistorialEstadoPedido` con `estado_hasta.nombre = "CONFIRMADO"` si se incluye en el payload del endpoint; sino `Pedido.created_at` como fallback.
- ¿El WebSocket autentica con el mismo JWT Bearer? → Sí, el primer mensaje del cliente envía el token; si es inválido el server cierra la conexión.
