# Mapa de Cambios — FoodStore

## CH-00: Setup Infraestructura Base
**Fecha:** 2026-04-28 | **Estado:** Completado y archivado

### 1. Backend — Scaffold inicial
- [x] 1.1 Crear `backend/requirements.txt` con todas las dependencias pinadas
- [x] 1.2 Crear `backend/.env.example` con todas las variables de entorno documentadas
- [x] 1.3 Crear la estructura de directorios feature-first (`app/core/`, `app/auth/`, `app/usuarios/`, `app/categorias/`, `app/productos/`, `app/pedidos/`, `app/pagos/`, `app/admin/`, `app/db/`)
- [x] 1.4 Crear `backend/app/__init__.py` y `__init__.py` en cada subdirectorio

### 2. Backend — Configuración y base de datos
- [x] 2.1 Crear `backend/app/core/config.py` con clase `Settings(BaseSettings)`
- [x] 2.2 Crear `backend/app/core/database.py` con engine SQLModel y dependencia `get_session`
- [x] 2.3 Inicializar Alembic y configurar `alembic/env.py`

### 3. Backend — Modelos SQLModel (ERD v5)
- [x] 3.1 Crear `backend/app/core/base_model.py` con `TimestampMixin` y `SoftDeleteMixin`
- [x] 3.2 Crear modelos Identity & Access: `Rol`, `Usuario`, `UsuarioRol`, `RefreshToken`
- [x] 3.3 Crear modelo `DireccionEntrega` con FK a `Usuario`
- [x] 3.4 Crear modelos Catálogo: `Categoria`, `Producto`, `Ingrediente`, `ProductoCategoria`, `ProductoIngrediente`, `FormaPago`
- [x] 3.5 Crear modelos Ventas: `EstadoPedido`, `Pedido`, `DetallePedido`, `HistorialEstadoPedido`, `Pago`
- [x] 3.6 Crear `backend/app/core/all_models.py` para registrar todos los modelos en `SQLModel.metadata`

### 4. Backend — Migración inicial y seed
- [x] 4.1 Generar migración inicial con `alembic revision --autogenerate -m "initial_schema"`
- [x] 4.2 Ejecutar `alembic upgrade head` y verificar las 16 tablas
- [x] 4.3 Crear `backend/app/db/seed.py` con roles, usuarios, estados de pedido, formas de pago y categorías
- [x] 4.4 Verificar idempotencia del seed

### 5. Backend — Capa core (Repository y UoW)
- [x] 5.1 Crear `backend/app/core/repository.py` con `BaseRepository[T]` genérico
- [x] 5.2 Crear `backend/app/core/uow.py` con clase `UnitOfWork`
- [x] 5.3 Crear dependencia `get_uow` en `backend/app/core/dependencies.py`

### 6. Backend — Seguridad y manejo de errores
- [x] 6.1 Crear `backend/app/core/security.py` con utilidades JWT y bcrypt
- [x] 6.2 Crear dependencia `get_current_user`
- [x] 6.3 Crear factory `require_role(roles)`
- [x] 6.4 Crear `backend/app/core/exceptions.py` con excepciones de dominio
- [x] 6.5 Crear manejador RFC 7807 en `backend/app/core/error_handler.py`

### 7. Backend — App principal y verificación
- [x] 7.1 Crear `backend/app/main.py` con CORS, error handler y endpoint `GET /health`
- [x] 7.2 Crear routers placeholder vacíos por módulo
- [x] 7.3 Verificar arranque: health check 200, Swagger UI disponible

### 8. Frontend — Scaffold inicial
- [x] 8.1 Crear proyecto Vite con `react-ts`
- [x] 8.2 Instalar dependencias: TanStack Query v5, Zustand, Axios, React Router, Tailwind, Recharts, MercadoPago SDK
- [x] 8.3 Configurar TypeScript strict y path alias `@/*`
- [x] 8.4 Crear `frontend/.env.example`
- [x] 8.5 Crear `frontend/src/env.d.ts` con `ImportMetaEnv`

### 9. Frontend — Tailwind CSS
- [x] 9.1 Configurar `tailwind.config.ts` con colores del design system (primary `#721016`, secondary `#D95D2B`, background `#fef9ef`)
- [x] 9.2 Reemplazar `index.css` con directivas `@tailwind`

### 10. Frontend — Estructura FSD
- [x] 10.1 Crear estructura Feature-Sliced Design: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`
- [x] 10.2 Crear barriles `index.ts` en `shared/api/`, `shared/store/`, `shared/ui/`, `shared/lib/`, `shared/types/`
- [x] 10.3 Crear páginas placeholder: `LoginPage`, `RegisterPage`, `CatalogPage`, `CartPage`, `CheckoutPage`, `OrdersPage`, `AdminPage`, `NotFoundPage`

### 11. Frontend — Stores Zustand
- [x] 11.1 Crear `authStore`: `accessToken`, `user`, `setAuth`, `clearAuth` con persist
- [x] 11.2 Crear `cartStore`: `items`, `addItem`, `removeItem`, `updateQuantity`, `clearCart` con persist
- [x] 11.3 Crear `paymentStore`: `status`, `preferenceId`, `setPayment`, `clearPayment` sin persist
- [x] 11.4 Crear `uiStore`: `theme`, `toggleTheme` con persist
- [x] 11.5 Crear `src/shared/store/index.ts` re-exportando todos los stores

### 12. Frontend — Axios y TanStack Query
- [x] 12.1 Crear `src/shared/api/axios.ts` con instancia Axios, interceptores de request (Bearer) y response (401)
- [x] 12.2 Crear `src/app/providers.tsx` con `QueryClientProvider` (`staleTime: 60_000`, `retry: 1`)

### 13. Frontend — Router y App shell
- [x] 13.1 Crear `src/app/router.tsx` con `createBrowserRouter` y todas las rutas
- [x] 13.2 Actualizar `src/main.tsx` con `RouterProvider` y providers
- [x] 13.3 Verificar arranque: `npm run dev`, navegación y `tsc --noEmit`
