# Mapa de Cambios — FoodStore

**Última actualización:** 2026-05-14
**Metodología:** Spec-Driven Development (SDD) v5.0
**Source of truth:** `openspec/` — este archivo es índice de lectura rápida

---

## Tabla de Estado

| ID | Change | Estado | Inicio | Evidencia |
|----|--------|--------|--------|-----------|
| CH-00 | Setup Infraestructura Base | ✅ Hecho (archivado 2026-04-28) | 2026-04-28 | `openspec/changes/archive/2026-04-28-setup-infraestructura-base/` |
| CH-01 | Autenticación JWT + RBAC | 🔄 En progreso | 2026-05-11 | `openspec/changes/us-001-auth/` |
| CH-02 | Reestructuración — Alineación a nueva estructura | ✅ Hecho (archivado 2026-05-14) | 2026-05-13 | `openspec/changes/archive/2026-05-14-ch-02-restructuracion/` |
| CH-03 | Categorías — Backend | ⏳ Pendiente | — | — |
| CH-04 | Categorías — Frontend | ⏳ Pendiente | — | — |
| CH-05 | Productos — Backend | ⏳ Pendiente | — | — |
| CH-06 | Productos — CatalogPage Frontend | ⏳ Pendiente | — | — |
| CH-07 | Ingredientes + Alérgenos | ⏳ Pendiente | — | — |
| CH-08 | Direcciones de Entrega | ⏳ Pendiente | — | — |
| CH-09 | Usuarios — Backend CRUD + Perfil | ⏳ Pendiente | — | — |
| CH-10 | Pedidos — Backend FSM + Audit Trail | ⏳ Pendiente | — | — |
| CH-11 | Pedidos — Carrito + Checkout Frontend | ⏳ Pendiente | — | — |
| CH-12 | Pagos — Backend MercadoPago + Webhooks | ⏳ Pendiente | — | — |
| CH-13 | Pagos — Frontend sdk-react + Tokenización | ⏳ Pendiente | — | — |
| CH-14 | Admin — Backend Dashboard + Métricas | ⏳ Pendiente | — | — |
| CH-15 | Admin — Frontend Dashboard + Gestión | ⏳ Pendiente | — | — |

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
        ├─► CH-03: Categorías Backend                            │
        │     │   GET /categorias (árbol CTE recursivo)           │
        │     │   CRUD admin · soft delete con validación         │
        │     │                                                   │
        │     └─► CH-04: Categorías Frontend                     │
        │               Navegación por categorías · filtros       │
        │               integración en CatalogPage                │
        │                                                         │
        ├─► CH-07: Ingredientes + Alérgenos ─────────────────┐   │
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
                    └─► CH-15: Admin Frontend Dashboard
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

---

## Convenciones

- Al iniciar un change: crear con `/opsx:propose` en `openspec/changes/<nombre>/`
- Al archivar un change: ejecutar `/opsx:archive`, mover fila a "Ya realizado", actualizar `Estado` a `✅ Hecho (archivado YYYY-MM-DD)` y apuntar `Evidencia` a `openspec/changes/archive/YYYY-MM-DD-<nombre>/`
- Actualizar `Última actualización` y el grafo de dependencias cada vez que cambie el estado de un change
