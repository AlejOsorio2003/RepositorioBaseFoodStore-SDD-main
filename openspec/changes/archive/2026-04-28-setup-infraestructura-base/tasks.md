## 1. Backend — Scaffold inicial

- [x] 1.1 Crear `backend/requirements.txt` con todas las dependencias pinadas: `fastapi==0.111.*`, `uvicorn[standard]`, `sqlmodel==0.0.19.*`, `alembic==1.13.*`, `psycopg2-binary`, `pydantic-settings`, `python-jose[cryptography]`, `passlib[bcrypt]`, `slowapi`, `mercadopago==2.3.*`, `pytest`, `httpx`
- [x] 1.2 Crear `backend/.env.example` con todas las variables de entorno documentadas (DATABASE_URL, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS, MP_ACCESS_TOKEN, MP_PUBLIC_KEY, CORS_ORIGINS)
- [x] 1.3 Crear la estructura de directorios: `backend/app/core/`, `backend/app/auth/`, `backend/app/usuarios/`, `backend/app/categorias/`, `backend/app/productos/`, `backend/app/pedidos/`, `backend/app/pagos/`, `backend/app/admin/`, `backend/app/db/`
- [x] 1.4 Crear `backend/app/__init__.py` y `__init__.py` en cada subdirectorio

## 2. Backend — Configuración y base de datos

- [x] 2.1 Crear `backend/app/core/config.py` con clase `Settings(BaseSettings)` que cargue todas las variables de entorno con tipos correctos y `model_config = SettingsConfigDict(env_file=".env")`
- [x] 2.2 Crear `backend/app/core/database.py` con el engine SQLModel (`create_engine`), la función `get_session` como dependencia FastAPI (`yield` de sesión), y `create_db_and_tables()` para uso en tests
- [x] 2.3 Inicializar Alembic: ejecutar `alembic init alembic` dentro de `backend/` y editar `alembic/env.py` para leer `settings.DATABASE_URL` y hacer `target_metadata = SQLModel.metadata`

## 3. Backend — Modelos SQLModel (ERD v5)

- [x] 3.1 Crear `backend/app/core/base_model.py` con clase `TimestampMixin` (campos `created_at`, `updated_at`) y `SoftDeleteMixin` (campo `deleted_at: Optional[datetime]`)
- [x] 3.2 Crear modelos del dominio Identity & Access en `backend/app/auth/models.py`: `Rol`, `Usuario`, `UsuarioRol` (tabla M2M), `RefreshToken` (con campo `token_hash` para SHA-256 y `revoked_at`)
- [x] 3.3 Crear modelo `DireccionEntrega` en `backend/app/usuarios/models.py` con FK a `Usuario` y campo `es_principal: bool`
- [x] 3.4 Crear modelos del dominio Catálogo en `backend/app/categorias/models.py` y `backend/app/productos/models.py`: `Categoria` (con `parent_id` self-ref FK nullable), `Producto` (con `stock_cantidad`, `disponible`, `precio_base`), `Ingrediente` (con `es_alergeno`), `ProductoCategoria`, `ProductoIngrediente` (con `es_removible`), `FormaPago` (con `habilitado`)
- [x] 3.5 Crear modelos del dominio Ventas en `backend/app/pedidos/models.py` y `backend/app/pagos/models.py`: `EstadoPedido` (con `es_terminal`), `Pedido` (con `total`, `costo_envio`, `direccion_snapshot`), `DetallePedido` (con `nombre_snapshot`, `precio_snapshot`, `personalizacion`), `HistorialEstadoPedido` (append-only, con `estado_desde` nullable para primer estado), `Pago` (con `mp_payment_id`, `mp_status`, `external_reference`, `idempotency_key` todos únicos)
- [x] 3.6 Importar todos los modelos en `backend/app/core/all_models.py` para asegurar que `SQLModel.metadata` los registra antes de Alembic

## 4. Backend — Migración inicial y seed

- [x] 4.1 Ejecutar `alembic revision --autogenerate -m "initial_schema"` y revisar el archivo generado: verificar que las 16 tablas, FKs, índices únicos y constraints estén correctos; editar manualmente si Alembic autogenerate omitió algo
- [x] 4.2 Ejecutar `alembic upgrade head` y verificar que las 16 tablas existen en la base de datos
- [x] 4.3 Crear `backend/app/db/seed.py` que inserte: roles (ADMIN, STOCK, PEDIDOS, CLIENT), un usuario por rol con `password_hash` bcrypt cost=12, estados de pedido con `es_terminal` correcto (ENTREGADO y CANCELADO = True), formas de pago básicas, y 3 categorías raíz de ejemplo
- [x] 4.4 Ejecutar `python -m app.db.seed` y verificar idempotencia ejecutándolo dos veces

## 5. Backend — Capa core (Repository y UoW)

- [x] 5.1 Crear `backend/app/core/repository.py` con `BaseRepository[T]` genérico: constructor recibe `session: Session` y `model: Type[T]`; implementar `get_by_id`, `list_all(skip=0, limit=100)`, `count`, `create`, `update`, `soft_delete`, `hard_delete`
- [x] 5.2 Crear `backend/app/core/uow.py` con clase `UnitOfWork`: `__enter__` abre sesión y retorna `self`; `__exit__` hace commit o rollback según excepción; atributos de repo se inicializan lazy en `__enter__` (ej: `self.usuarios = UsuarioRepository(self.session)`)
- [x] 5.3 Crear la dependencia FastAPI `get_uow` en `backend/app/core/dependencies.py` que retorna un `UnitOfWork` como `yield` para inyección en routers

## 6. Backend — Seguridad y manejo de errores

- [x] 6.1 Crear `backend/app/core/security.py` con funciones utilitarias: `create_access_token(data, expires_delta)`, `decode_access_token(token)`, `hash_password(plain)`, `verify_password(plain, hashed)`
- [x] 6.2 Crear dependencia `get_current_user` en `backend/app/core/dependencies.py`: extrae Bearer token del header, llama `decode_access_token`, consulta el usuario en BD, retorna instancia `Usuario` o lanza HTTP 401
- [x] 6.3 Crear factory `require_role(roles: list[str])` en `backend/app/core/dependencies.py`: retorna una dependencia FastAPI que verifica que el `current_user` tenga al menos un rol de la lista o lanza HTTP 403
- [x] 6.4 Crear `backend/app/core/exceptions.py` con clases de excepción de dominio base (`DomainError`, `NotFoundError`, `ConflictError`, `ForbiddenError`)
- [x] 6.5 Crear `backend/app/core/error_handler.py` con el manejador RFC 7807: registrar con `app.add_exception_handler` para `HTTPException` y `RequestValidationError`; la respuesta debe tener `Content-Type: application/problem+json` y campos `type`, `title`, `status`, `detail`, `instance`

## 7. Backend — App principal y verificación

- [x] 7.1 Crear `backend/app/main.py` con la app FastAPI: configurar `CORSMiddleware` con `settings.CORS_ORIGINS`, registrar el manejador de errores, agregar endpoint `GET /health` que retorna `{"status": "ok"}`, incluir routers placeholder de cada módulo
- [x] 7.2 Crear routers placeholder vacíos en cada módulo (`backend/app/auth/router.py`, etc.) que solo exponen `APIRouter` sin endpoints, para que `main.py` compile sin errores
- [x] 7.3 Verificar arranque: `uvicorn app.main:app --reload` sin errores, `GET http://localhost:8000/health` retorna 200, `GET http://localhost:8000/docs` muestra Swagger UI

## 8. Frontend — Scaffold inicial

- [x] 8.1 Crear proyecto Vite con `npm create vite@latest frontend -- --template react-ts` y moverse a `frontend/`
- [x] 8.2 Instalar dependencias: `@tanstack/react-query@5`, `@tanstack/react-form`, `zustand`, `axios`, `react-router-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `recharts`, `@mercadopago/sdk-react`
- [x] 8.3 Configurar TypeScript strict: en `tsconfig.json` y `tsconfig.app.json` asegurar `"strict": true`, `"noImplicitAny": true`; agregar path alias `"@/*": ["./src/*"]` y el correspondiente en `vite.config.ts`
- [x] 8.4 Crear `frontend/.env.example` con `VITE_API_URL=http://localhost:8000` y `VITE_MP_PUBLIC_KEY=TEST-tu-public-key`
- [x] 8.5 Crear `frontend/src/env.d.ts` con `interface ImportMetaEnv` que declare `VITE_API_URL: string` y `VITE_MP_PUBLIC_KEY: string` como obligatorias

## 9. Frontend — Tailwind CSS

- [x] 9.1 Ejecutar `npx tailwindcss init -p` y editar `tailwind.config.ts`: configurar `content: ["./index.html", "./src/**/*.{ts,tsx}"]` y extender el tema con los colores del design system (primary `#721016`, secondary `#D95D2B`, background `#fef9ef`)
- [x] 9.2 Reemplazar el contenido de `frontend/src/index.css` con las directivas `@tailwind base; @tailwind components; @tailwind utilities;`

## 10. Frontend — Estructura FSD

- [x] 10.1 Crear la estructura de directorios FSD: `src/app/`, `src/pages/`, `src/widgets/`, `src/features/`, `src/entities/`, `src/shared/`
- [x] 10.2 Crear `src/shared/api/`, `src/shared/store/`, `src/shared/ui/`, `src/shared/lib/`, `src/shared/types/` con archivos `index.ts` vacíos como barriles
- [x] 10.3 Crear páginas placeholder en `src/pages/`: `LoginPage`, `RegisterPage`, `CatalogPage`, `CartPage`, `CheckoutPage`, `OrdersPage`, `AdminPage`, `NotFoundPage` — cada una como componente React con solo un `<div>` con el nombre de la página

## 11. Frontend — Stores Zustand

- [x] 11.1 Crear `src/shared/store/auth.store.ts` con `authStore`: estado `{ accessToken: string | null, user: User | null }`, acciones `setAuth`, `clearAuth`; persist con `zustand/middleware` key `auth` almacenando solo `accessToken`
- [x] 11.2 Crear `src/shared/store/cart.store.ts` con `cartStore`: estado `{ items: CartItem[] }`, acciones `addItem(item)`, `removeItem(id)`, `updateQuantity(id, qty)`, `clearCart()`; persist con key `cart` almacenando `items`
- [x] 11.3 Crear `src/shared/store/payment.store.ts` con `paymentStore`: estado `{ status: string | null, preferenceId: string | null }`, acciones `setPayment`, `clearPayment`; sin persist
- [x] 11.4 Crear `src/shared/store/ui.store.ts` con `uiStore`: estado `{ theme: 'light' | 'dark' }`, acción `toggleTheme`; persist con key `ui` almacenando `theme`
- [x] 11.5 Crear `src/shared/store/index.ts` que re-exporte todos los stores

## 12. Frontend — Axios y TanStack Query

- [x] 12.1 Crear `src/shared/api/axios.ts` con instancia Axios: `baseURL: import.meta.env.VITE_API_URL`; interceptor de request que lea `authStore.getState().accessToken` y agregue `Authorization: Bearer <token>` si existe; interceptor de response que capture 401 y rechace con error tipado (placeholder para CH-01)
- [x] 12.2 Crear `src/app/providers.tsx` con `QueryClientProvider` configurado: `staleTime: 60_000`, `retry: 1`; envolver la app completa

## 13. Frontend — Router y App shell

- [x] 13.1 Crear `src/app/router.tsx` con `createBrowserRouter` de react-router-dom: definir rutas para `/`, `/login`, `/register`, `/catalog`, `/cart`, `/checkout`, `/orders`, `/admin` apuntando a los pages placeholder, y catch-all `*` → `NotFoundPage`
- [x] 13.2 Actualizar `src/main.tsx` para usar `RouterProvider` y envolver con `providers.tsx`
- [x] 13.3 Verificar arranque: `npm run dev` sin errores, navegar a `/login` muestra el placeholder, `tsc --noEmit` sin errores de tipos
