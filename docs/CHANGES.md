# Mapa de Cambios — FoodStore

**Última actualización:** 2026-05-18 (CH-15 archivado)
**Metodología:** Spec-Driven Development (SDD) v5.0
**Source of truth:** `openspec/` — este archivo es índice de lectura rápida

---

## Tabla de Estado

| ID | Change | Estado | Inicio | Evidencia |
|----|--------|--------|--------|-----------|
| CH-00 | Setup Infraestructura Base | ✅ Hecho (archivado 2026-04-28) | 2026-04-28 | `openspec/changes/archive/2026-04-28-setup-infraestructura-base/` |
| CH-01 | Autenticación JWT + RBAC | ✅ Hecho (archivado 2026-05-15) | 2026-05-11 | `openspec/changes/archive/2026-05-15-us-001-auth/` |
| CH-02 | Reestructuración — Alineación a nueva estructura | ✅ Hecho (archivado 2026-05-14) | 2026-05-13 | `openspec/changes/archive/2026-05-14-ch-02-restructuracion/` |
| CH-03 | Categorías — Backend | ✅ Hecho (archivado 2026-05-14) | 2026-05-14 | `openspec/changes/archive/2026-05-14-ch-03-categorias-backend/` |
| CH-04 | Categorías — Frontend | ✅ Hecho (archivado 2026-05-14) | 2026-05-14 | `openspec/changes/archive/2026-05-14-ch-04-categorias-frontend/` |
| CH-05 | Productos — Backend | ✅ Hecho (archivado 2026-05-15) | 2026-05-15 | `openspec/changes/archive/2026-05-15-ch-05-productos-backend/` |
| CH-06 | Productos — CatalogPage Frontend | ✅ Hecho (archivado 2026-05-15) | 2026-05-15 | `openspec/changes/archive/2026-05-15-ch-06-productos-catalogpage-frontend/` |
| CH-07 | Ingredientes + Alérgenos | ✅ Hecho (archivado 2026-05-14) | 2026-05-14 | `openspec/changes/archive/2026-05-14-ch-07-ingredientes-alergenos/` |
| CH-08 | Direcciones de Entrega | ✅ Hecho (archivado 2026-05-15) | 2026-05-15 | `openspec/changes/archive/2026-05-15-ch-08-direcciones-entrega/` |
| CH-09 | Usuarios — Backend CRUD + Perfil | ✅ Hecho (archivado 2026-05-16) | 2026-05-16 | `openspec/changes/archive/2026-05-16-ch-09-usuarios-backend/` |
| CH-10 | Pedidos — Backend FSM + Audit Trail | ✅ Hecho (archivado 2026-05-16) | 2026-05-16 | `openspec/changes/archive/2026-05-16-ch-10-pedidos-backend/` |
| CH-11 | Pedidos — Carrito + Checkout Frontend | ✅ Hecho (archivado 2026-05-16) | 2026-05-16 | `openspec/changes/archive/2026-05-16-ch-11-carrito-checkout-frontend/` |
| CH-12 | Pagos — Backend MercadoPago + Webhooks | ✅ Hecho (archivado 2026-05-17) | 2026-05-17 | `openspec/changes/archive/2026-05-17-ch-12-pagos-backend/` |
| CH-13 | Pagos — Frontend sdk-react + Tokenización | ✅ Hecho (archivado 2026-05-18) | 2026-05-18 | `openspec/changes/archive/2026-05-18-ch-13-pagos-frontend/` |
| CH-14 | Admin — Backend Dashboard + Métricas | ✅ Hecho (archivado 2026-05-18) | 2026-05-18 | `openspec/changes/archive/2026-05-18-ch-14-admin-backend/` |
---



## Grafo de Dependencias

```
CH-00: Infraestructura Base  ✅ ARCHIVADO
  │
  └─► CH-01: Auth JWT + RBAC  🔄 EN PROGRESO
        │   POST /auth/register|login|refresh|logout
        │   Refresh tokens opacos + rotación + replay detection
        │   Rate limiting slowapi · LoginPage · RegisterPage
        │
        ├─► CH-02: Reestructuración ✅ ARCHIVADO ────────────────┐
        │         Alineación de directorios y módulos             │
        │         a la nueva estructura del proyecto              │
        │                                                         │
        ├─► CH-03: Categorías Backend ✅ ARCHIVADO               │
        │     │   GET /categorias (árbol CTE recursivo)           │
        │     │   CRUD admin · soft delete con validación         │
        │     │                                                   │
        │     └─► CH-04: Categorías Frontend ✅ ARCHIVADO         │
        │               Navegación por categorías · filtros       │
        │               integración en CatalogPage                │
        │                                                         │
        ├─► CH-07: Ingredientes + Alérgenos ✅ ARCHIVADO ───────┐   │
        │         CRUD /ingredientes · campo es_alergeno      │   │
        │         Asociación ProductoIngrediente              │   │
        │                                                     │   │
        │   CH-03 + CH-07                                     │   │
        │     └─► CH-05: Productos Backend ◄──────────────────┘   │
        │               GET /productos · stock · disponibilidad    │
        │               PATCH stock (Gestor de Stock)              │
        │                                                          │
        │               └─► CH-06: CatalogPage Frontend           │
        │                         Listado · filtros · detalle      │
        │                         CartPage (agregar al carrito)    │
        │                                                          │
        ├─► CH-08: Direcciones de Entrega                         │
        │         CRUD /usuarios/{id}/direcciones                  │
        │         PATCH /principal                                  │
        │                                                          │
        ├─► CH-09: Usuarios Backend CRUD + Perfil                 │
        │         GET|PATCH /usuarios/me                           │
        │         GET /usuarios · PATCH rol (Admin)                │
        │                                                          │
        │   CH-06 + CH-08                                         │
        │     └─► CH-10: Pedidos Backend FSM + Audit Trail        │
        │               POST /pedidos · PATCH /estado             │
        │               FSM 6 estados · historial append-only      │
        │               snapshot de dirección y precios            │
        │                                                          │
        │               └─► CH-11: Carrito + Checkout Frontend    │
        │                         CartPage · CheckoutPage          │
        │                         cartStore completo               │
        │                         creación de pedido + confirmación│
        │                                                          │
        │               └─► CH-12: Pagos Backend                  │
        │                     │   POST /pagos · SDK MercadoPago    │
        │                     │   POST /webhooks/ipn               │
        │                     │   Tarjeta · Rapipago · Pago Fácil  │
        │                     │   idempotency_key · external_ref   │
        │                     │                                    │
        │                     └─► CH-13: Pagos Frontend            │
        │                               @mercadopago/sdk-react     │
        │                               tokenización PCI-compliant │
        │                               flujo de pago integrado    │
        │                                                          │
        │   CH-11 + CH-13                                         │
        │     └─► OrdersPage (seguimiento de estados en tiempo    │
        │               real — parte de CH-11)                     │
        │                                                          │
        └── CH-01 + CH-09 + CH-10 + CH-12 ───────────────────────┘
              └─► CH-14: Admin Backend Dashboard
                    │   GET /admin/metricas · ventas · stock
                    │   Gestión de pedidos por Gestor de Pedidos
                    │   Gestión de stock por Gestor de Stock
                    │
                     └─► CH-15: Admin Frontend Dashboard  ✅ ARCHIVADO
                               recharts (ventas · pedidos · stock)
                               CRUD de productos · categorías
                               Tabla de pedidos + cambio de estado
                               Tabla de usuarios + cambio de rol
```

---

## Cambios Activos

### CH-01 — `us-001-auth` · Autenticación JWT + RBAC

**Iniciado:** 2026-05-11 | **Artefactos:** `openspec/changes/us-001-auth/`

**Alcance:**
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- Refresh tokens opacos (UUID v4 → SHA-256 hash en BD), rotación + replay detection
- `slowapi` rate limiting: 5 req / IP / 15 min sobre login
- Schemas: `RegisterRequest`, `LoginRequest`, `TokenResponse`, `RefreshRequest`, `LogoutRequest`
- `LoginPage` y `RegisterPage` con TanStack Form + mutación TanStack Query
- `authStore`: acciones `login`, `logout`, `refreshToken` + interceptor Axios completo

**Archivos clave:**
```
backend/app/auth/router.py              ← implementación completa
backend/app/auth/schemas.py             ← nuevo
backend/app/core/security.py            ← + hash_token, create_refresh_token
backend/app/main.py                     ← + SlowAPIMiddleware
backend/requirements.txt               ← + slowapi>=0.1.9
frontend/src/pages/LoginPage.tsx        ← implementación funcional
frontend/src/pages/RegisterPage.tsx     ← implementación funcional
frontend/src/shared/store/auth.store.ts ← acciones login/logout/refreshToken
```

**Progreso** (`openspec/changes/us-001-auth/tasks.md`):

| Sección | Total | Hecho |
|---------|-------|-------|
| 1. Dependencias y config | 3 | 0 |
| 2. Primitivas security.py | 2 | 0 |
| 3. Schemas Pydantic | 5 | 0 |
| 4. Endpoints auth/router.py | 5 | 0 |
| 5. Verificación backend | 7 | 0 |
| 6. Frontend — authStore | 4 | 0 |
| 7. Frontend — interceptor Axios | 2 | 0 |
| 8. Frontend — LoginPage | 3 | 0 |
| 9. Frontend — RegisterPage | 3 | 0 |
| 10. Verificación frontend | 3 | 0 |
| **Total** | **37** | **0 / 37** |

---

## Ya realizado (archivado en OPSX)

### CH-00 — Setup Infraestructura Base

**Archivado:** 2026-04-28 | **Evidencia:** `openspec/changes/archive/2026-04-28-setup-infraestructura-base/`

| Sección | Entregable | Estado |
|---------|------------|--------|
| Backend scaffold | `requirements.txt`, `.env.example`, estructura feature-first | ✅ |
| Configuración y BD | `core/config.py`, `core/database.py`, Alembic init | ✅ |
| Modelos SQLModel ERD v5 | 16 tablas: Identity & Access, Catálogo, Ventas | ✅ |
| Migración y seed | `alembic revision --autogenerate`, `upgrade head`, seed idempotente | ✅ |
| Capa core | `BaseRepository[T]`, `UnitOfWork` context-manager, `get_uow` | ✅ |
| Seguridad compartida | `security.py` (JWT+bcrypt), `get_current_user`, `require_role`, RFC 7807 | ✅ |
| App principal | `main.py` (CORS, error handler, `/health`), routers placeholder | ✅ |
| Frontend scaffold | Vite react-ts, dependencias, TypeScript strict, path alias `@/*` | ✅ |
| Tailwind CSS | Design system: primary `#721016`, secondary `#D95D2B`, bg `#fef9ef` | ✅ |
| Estructura FSD | `app/`, `pages/`, `features/`, `entities/`, `shared/` + barriles | ✅ |
| Stores Zustand | `authStore`, `cartStore`, `paymentStore`, `uiStore` con persist | ✅ |
| Axios + TanStack Query | Interceptores Bearer/401, `QueryClientProvider` | ✅ |
| Router y App shell | `createBrowserRouter`, todas las rutas, `main.tsx` | ✅ |

**Capabilities entregadas:** `backend-infra`, `frontend-infra`

### CH-13 — Pagos — Frontend sdk-react + Tokenización

**Archivado:** 2026-05-18 | **Evidencia:** `openspec/changes/archive/2026-05-18-ch-13-pagos-frontend/`

| Sección | Entregable | Estado |
|---------|------------|--------|
| Entorno | `VITE_MP_PUBLIC_KEY` en `.env.example` | ✅ |
| Entity pago | `entities/pago/` — `PagoResponse`, `CrearPagoRequest`, `crearPago` | ✅ |
| Feature pagos | `CardPaymentForm` con `CardPayment` brick de `@mercadopago/sdk-react`, fallback sin key, `initMercadoPago` a nivel módulo | ✅ |
| PaymentPage | 4 estados (idle/processing/approved/rejected/error), redirect si no autenticado, reset al montar, fetch de monto del pedido | ✅ |
| Router | Ruta `/payment/:pedidoId` + redirect desde CheckoutPage | ✅ |
| Bugs corregidos | `initMercadoPago` faltante, `Payment` → `CardPayment` (400 sandbox), `amount` requerido por brick, `publicKey` no va en `initialization` | ✅ |
| Verificación frontend | 6.1–6.5: brick renderizado, pago aprobado, rechazado, retry, fallback sin key | ✅ |
| Verificación backend | 6.6–6.8: token aprobado→201 approved, rechazado→201 rejected, forma_pago inválida→422 | ✅ |

**Capabilities entregadas:** `pagos-frontend`, `checkout-frontend`

### CH-12 — Pagos — Backend MercadoPago + Webhooks

**Archivado:** 2026-05-17 | **Evidencia:** `openspec/changes/archive/2026-05-17-ch-12-pagos-backend/`

| Sección | Entregable | Estado |
|---------|------------|--------|
| Dependencias | `mercadopago>=2.3.0` en requirements, `MP_ACCESS_TOKEN`, `MP_NOTIFICATION_URL` en config | ✅ |
| Schemas | `CrearPagoRequest`, `WebhookIPNPayload`, `PagoResponse` | ✅ |
| Repository | `create`, `get_by_pedido_id`, `get_by_mp_payment_id` | ✅ |
| Service | `crear_pago` (verificación MP token, payer.email, idempotency), `procesar_webhook` (IPN→CONFIRMADO), `get_pago_by_pedido` | ✅ |
| Router | `POST /crear`, `POST /webhook`, `GET /{pedido_id}` | ✅ |
| UoW + wiring | `uow.pagos`, `pagos_router` en main.py, `all_models.py` | ✅ |
| PedidoDetail | Campo `pago: PagoResponse \| None` en `PedidoDetail` | ✅ |
| Bugs corregidos | `payment_method_id` incorrecto, `notification_url` vacía crasheaba MP, `payer.email` faltante, `usuario_id=0` violaba FK historial | ✅ |
| Verificación | 10/10 PASS: approved, rejected, webhook IPN→CONFIRMADO, ignored, get pago, PedidoDetail.pago, 422 forma inválida | ✅ |

**Capabilities entregadas:** `pagos-backend`

### CH-11 — Pedidos — Carrito + Checkout Frontend

**Archivado:** 2026-05-16 | **Evidencia:** `openspec/changes/archive/2026-05-16-ch-11-carrito-checkout-frontend/`

| Sección | Entregable | Estado |
|---------|------------|--------|
| Stores | `cart.store.ts` (subtotal/costoEnvio/total/itemCount), `payment.store.ts` (status tipado + mpPaymentId), `ui.store.ts` (cartOpen/openCart/closeCart) | ✅ |
| Entity pedido | `entities/pedido/` — 7 interfaces + 5 funciones API (`crearPedido`, `listarPedidos`, `getPedido`, `getHistorial`, `cancelarPedido`) | ✅ |
| Feature carrito | `CartDrawer` (panel lateral + totales + acciones), `useCart` hook | ✅ |
| Feature pedidos | `usePedidos`, `usePedidoDetail`, `useCancelarPedido` (polling 30s), `PedidoCard`, `PedidoDetailPanel`, `HistorialTimeline` | ✅ |
| CartPage | Lista de items, controles cantidad, panel totales, redirect a login si no autenticado | ✅ |
| CheckoutPage | Ruta protegida, `crearPedido` mutation, clearCart + redirect en onSuccess, spinner isPending | ✅ |
| OrdersPage | Ruta protegida, polling 30s, PedidoCard + PedidoDetailPanel + cancelación | ✅ |
| Header | Ícono carrito con badge `itemCount()` reactivo, monta `<CartDrawer />` | ✅ |
| ProductoDetailModal | Botón "Agregar al carrito", disabled si no disponible, feedback "¡Agregado!" 1.5s | ✅ |
| Auth fix | `AuthInitializer` en providers — restaura sesión desde refreshToken al montar la app | ✅ |
| Router fix | `/` redirige a `/login`; login respeta `?redirect=` param | ✅ |
| Verificación | 10/10 escenarios browser verificados manualmente | ✅ |

**Capabilities entregadas:** `carrito-frontend`, `checkout-frontend`, `orders-frontend`

### CH-10 — Pedidos — Backend FSM + Audit Trail

**Archivado:** 2026-05-16 | **Evidencia:** `openspec/changes/archive/2026-05-16-ch-10-pedidos-backend/`

| Sección | Entregable | Estado |
|---------|------------|--------|
| Seed | `seed_estados_pedido()` idempotente — 6 estados (PENDIENTE→CANCELADO) al startup | ✅ |
| Schemas | `ItemPedidoRequest`, `CrearPedidoRequest`, `AvanzarEstadoRequest` (RN-05 `@model_validator`), `DetallePedidoRead`, `HistorialRead`, `PedidoRead`, `PedidoDetail`, `PaginatedPedidos` | ✅ |
| Repository | `get_by_id_with_relations`, `list_paginated` (filtros usuario/estado), `get_historial` (ASC), `get_estado_by_nombre` | ✅ |
| Service | `TRANSICIONES_VALIDAS` FSM dict, `crear_pedido` (snapshot precio+dirección), `listar_pedidos` (RBAC), `get_pedido`, `avanzar_estado` (expire+reload), `get_historial`, `cancelar_pedido` | ✅ |
| Router | 6 endpoints: POST `/`, GET `/`, GET `/{id}`, PATCH `/{id}/estado`, GET `/{id}/historial`, DELETE `/{id}` | ✅ |
| Wiring | `pedidos_router` en `main.py` + `import app.core.all_models` antes de routers (fix mapper) | ✅ |
| Bugs corregidos | Import `ValidationInfo` (Pydantic v2), mapper order (`all_models`), roles `CLIENT`/`PEDIDOS`, identity map cache (`expire`), `@model_validator` RN-05, `ctx` serialización error handler | ✅ |
| Verificación | 13/13 tests HTTP pasando | ✅ |

**Capabilities entregadas:** `pedidos-backend`

### CH-09 — Usuarios — Backend CRUD + Perfil

**Archivado:** 2026-05-16 | **Evidencia:** `openspec/changes/archive/2026-05-16-ch-09-usuarios-backend/`

| Sección | Entregable | Estado |
|---------|------------|--------|
| Schemas | `UsuarioRead`, `UsuarioUpdate`, `UsuarioUpdateEstado`, `PerfilUpdate`, `CambiarPasswordRequest`, `PaginatedUsuarios` | ✅ |
| Repository | `UsuarioRepository`: `get_by_email`, `get_by_id_with_roles`, `list_paginated` (filtros ILIKE, rol, activo) | ✅ |
| Service | `get_me`, `update_me`, `change_password` (invalida tokens), `list_usuarios`, `update_usuario` (LAST_ADMIN guard), `toggle_estado` | ✅ |
| Router autoservicio | `GET/PUT /auth/me`, `PUT /auth/me/password` — integrado en `auth/router.py` | ✅ |
| Router admin | `GET /usuarios`, `PUT /usuarios/{id}`, `PATCH /usuarios/{id}/estado` — solo ADMIN | ✅ |
| UoW | `uow.usuarios` tipado como `UsuarioRepository` | ✅ |
| Fix passlib | Reemplazado `passlib.CryptContext` por `bcrypt` directo (incompatibilidad bcrypt 5.x) | ✅ |
| Fix identity map | `expire_all()` antes de recarga en `update_usuario` | ✅ |
| Verificación | 9/9 tests HTTP pasando | ✅ |

**Capabilities entregadas:** `usuarios-backend`, `perfil-usuario`

### CH-07 — Ingredientes + Alérgenos — Backend

**Archivado:** 2026-05-14 | **Evidencia:** `openspec/changes/archive/2026-05-14-ch-07-ingredientes-alergenos/`

| Sección | Entregable | Estado |
|---------|------------|--------|
| Schemas | `IngredienteCreate`, `IngredienteUpdate`, `IngredienteRead`, `ProductoIngredienteRead` | ✅ |
| Repository | `IngredienteRepository`: `get_by_nombre`, `list_alergenos`, `has_productos_asociados` | ✅ |
| Service | CRUD completo con 404/409, filtro `solo_alergenos`, bloqueo eliminación con productos | ✅ |
| Router | 5 endpoints: GET list, GET by id (público), POST, PATCH, DELETE (ADMIN) | ✅ |
| UoW | `uow.ingredientes` tipado como `IngredienteRepository` | ✅ |
| Fix auth | `HTTPBearer(auto_error=False)` + `401` manual en `core/dependencies.py` | ✅ |
| Verificación | 10/10 tests HTTP pasando (200, 201, 204, 401, 404, 409) | ✅ |

**Capabilities entregadas:** `ingredientes-backend`

### CH-05 — Productos — Backend

**Archivado:** 2026-05-15 | **Evidencia:** `openspec/changes/archive/2026-05-15-ch-05-productos-backend/`

| Sección | Entregable | Estado |
|---------|------------|--------|
| Schemas | `ProductoCreate`, `ProductoUpdate`, `DisponibilidadUpdate`, `ProductoRead`, `ProductoDetail`, `PaginatedProductos`, `ProductoIngredienteCreate/Read`, `CategoriaEnProductoRead`, `IngredienteEnProductoRead` | ✅ |
| Repository | `list_paginado` (filtros + paginación), `get_by_id_con_relaciones` (eager load), `get_by_slug`, `soft_delete`, pivot CRUD | ✅ |
| Service | 9 funciones: listar, get, crear (slug único), actualizar, cambiar disponibilidad, eliminar, listar ingredientes, asociar/quitar ingrediente | ✅ |
| Router | 10 endpoints: GET list, GET detail, POST, PUT, PATCH disponibilidad, DELETE, GET ingredientes, POST ingrediente, DELETE ingrediente | ✅ |
| UoW | `uow.productos` tipado como `ProductoRepository` | ✅ |
| Verificación | 10/10 tests HTTP pasando (200, 201, 204, 401, 404, 409) | ✅ |

**Capabilities entregadas:** `productos-backend`

### CH-04 — Categorías — Frontend

**Archivado:** 2026-05-14 | **Evidencia:** `openspec/changes/archive/2026-05-14-ch-04-categorias-frontend/`

| Sección | Entregable | Estado |
|---------|------------|--------|
| Entity | `entities/categoria/` — tipos `Categoria`, `CategoriaWithChildren` + funciones API | ✅ |
| Feature hooks | `features/categoria-nav/hooks/` — `useCategorias`, `useCategoria` con TanStack Query | ✅ |
| Feature UI | `features/categoria-nav/ui/CategorySidebar` — árbol raíces/hijos, query param, estilos activos | ✅ |
| Page | `pages/CatalogPage.tsx` — layout sidebar + contenido, selección por URL | ✅ |
| Verificación | 5/5 scenarios de browser verificados | ✅ |

**Capabilities entregadas:** `categorias-frontend`

### CH-03 — Categorías — Backend

**Archivado:** 2026-05-14 | **Evidencia:** `openspec/changes/archive/2026-05-14-ch-03-categorias-backend/`

| Sección | Entregable | Estado |
|---------|------------|--------|
| Schemas | `CategoriaCreate`, `CategoriaUpdate`, `CategoriaRead`, `CategoriaWithChildren` | ✅ |
| Repository | `CategoriaRepository` con CTE recursiva para descendientes, soft delete, validación productos | ✅ |
| Service | CRUD completo con validación 404/409/422, anti-ciclo con `get_descendants` | ✅ |
| Router | 5 endpoints (GET list, GET by id, POST, PATCH, DELETE) con auth ADMIN | ✅ |
| UoW | `uow.categorias` tipado como `CategoriaRepository` | ✅ |
| Verificación | 6/6 tests de integración HTTP pasando (200, 201, 204, 409, 422) | ✅ |

**Capabilities entregadas:** `categorias-backend`

### CH-02 — Reestructuración · Alineación a nueva estructura del proyecto

**Archivado:** 2026-05-14 | **Evidencia:** `openspec/changes/archive/2026-05-14-ch-02-restructuracion/`

| Sección | Entregable | Estado |
|---------|------------|--------|
| Módulo refreshtokens | `refreshtokens/` con models, schemas, repository, service, router | ✅ |
| Módulo ingredientes | `ingredientes/` con models, schemas, repository, service, router | ✅ |
| Módulo direcciones | `direcciones/` con models, schemas, repository, service, router | ✅ |
| Scaffolding capas faltantes | schemas/repository/service en usuarios, categorias, productos, pedidos, pagos, admin | ✅ |
| Imports actualizados | `all_models.py`, `main.py`, `auth/models.py`, `auth/service.py`, `productos/models.py`, `usuarios/models.py` | ✅ |
| Frontend FSD | `widgets/` eliminado, barrels en features/, entities/, shared/ui/, shared/lib/ | ✅ |
| Tipos base compartidos | `UUID`, `ISODateString`, `PaginatedResponse<T>`, `ApiError` en `shared/types/` | ✅ |

**Capabilities entregadas:** `refreshtokens-module`, `ingredientes-module`, `direcciones-module`, `backend-infra` (modificado), `frontend-infra` (modificado)

### CH-15 — Admin — Frontend Dashboard + Gestión

**Archivado:** 2026-05-18 | **Evidencia:** `openspec/changes/archive/2026-05-18-ch-15-admin-frontend/`

| Sección | Entregable | Estado |
|---------|------------|--------|
| Entities + API | `entities/admin/` — tipos `MetricasDashboard`, `AdminUsuarios`, `AdminPedido`, `AdminProducto`, `AdminProductoStock`, `PedidoList` | ✅ |
| AdminLayout | Layout con sidebar + topbar, guards de rol ADMIN/STOCK/PEDIDOS, tabs condicionales por rol | ✅ |
| Dashboard metrics | `GET /admin/metricas` — cards ventas totales/mes, pedidos hoy, productos bajos stock, clientes registrados | ✅ |
| Ventas chart | `VentasChart` con recharts (BarChart último año), `MetricaVentas` tipado | ✅ |
| Pedidos table | `PedidosTable` con paginación server-side, cambio de estado PEDIDOS, modal confirmación + detalle | ✅ |
| Stock management | `StockTable` con edición inline de stock/disponibilidad, solo Gestor de Stock | ✅ |
| Productos CRUD | `ProductosTable` + `ProductoFormModal` (create/edit con categorías e ingredientes), `useAdminCategorias`/`useAdminIngredientes` hooks | ✅ |
| Usuarios table | `UsuariosTable` con cambio de rol ADMIN, paginación server-side, confirmación LAST_ADMIN guard | ✅ |
| Categorías CRUD | `CategoriasTable` + `CategoriaFormModal` (create/edit jerarquía), soft delete con validación | ✅ |
| Verificación | Tasks completadas (verificación pendiente por el usuario — no ejecutada por el agente) | 🔲 |

**Capabilities entregadas:** `admin-frontend-dashboard`, `admin-frontend-crud`

---

## Convenciones

- Al iniciar un change: crear con `/opsx:propose` en `openspec/changes/<nombre>/`
- Al archivar un change: ejecutar `/opsx:archive`, mover fila a "Ya realizado", actualizar `Estado` a `✅ Hecho (archivado YYYY-MM-DD)` y apuntar `Evidencia` a `openspec/changes/archive/YYYY-MM-DD-<nombre>/`
- Actualizar `Última actualización` y el grafo de dependencias cada vez que cambie el estado de un change
