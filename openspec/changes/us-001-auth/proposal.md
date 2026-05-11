## Why

El backend tiene las primitivas de seguridad (JWT, bcrypt, `get_current_user`, `require_role`) pero los endpoints de autenticación son stubs vacíos. Todos los módulos de negocio posteriores (catálogo, pedidos, pagos) dependen de que la capa de auth esté operativa para proteger sus rutas.

## What Changes

- **Backend — endpoints de auth**: Implementar `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` en `app/auth/router.py`.
- **Backend — lógica de refresh tokens**: Función `create_refresh_token` en `security.py` que genera UUID v4 opaco y lo almacena como SHA-256 hash en la tabla `refresh_tokens`. Rotación obligatoria + detección de replay attack.
- **Backend — rate limiting**: Integrar slowapi sobre `POST /auth/login`: máximo 5 intentos por IP en ventana de 15 minutos; excedido retorna HTTP 429.
- **Backend — schemas Pydantic**: `RegisterRequest`, `LoginRequest`, `TokenResponse`, `RefreshRequest` en `app/auth/schemas.py`.
- **Frontend — LoginPage**: Formulario con TanStack Form + mutación TanStack Query, guarda tokens en `authStore`, redirige al catálogo.
- **Frontend — RegisterPage**: Formulario de registro, llama al endpoint, redirige al login tras éxito.
- **Frontend — authStore**: Implementar acciones `login`, `logout`, `refreshToken`; el interceptor de Axios ya tiene el esqueleto del refresh silencioso.

## Capabilities

### New Capabilities

- `auth-api`: Endpoints de registro, login, refresh y logout con todas sus reglas de negocio (RN-AU01 a RN-AU08).
- `rbac`: Modelo de roles fijos (ADMIN, STOCK, PEDIDOS, CLIENT), asignación automática al registro y enforcement via `require_role` (RN-RB01, RN-RB02, RN-RB05, RN-RB09, RN-RB10).

### Modified Capabilities

- `backend-infra`: Agregar `slowapi` como dependencia de rate limiting; extender `security.py` con `create_refresh_token` y `hash_token`.

## Impact

- **`app/auth/router.py`**: Implementación completa (actualmente stub vacío).
- **`app/auth/schemas.py`**: Archivo nuevo con los schemas Pydantic de request/response.
- **`app/core/security.py`**: Nuevas funciones `create_refresh_token`, `hash_token`.
- **`app/main.py`**: Registrar slowapi `Limiter` como middleware.
- **`backend/requirements.txt`**: Agregar `slowapi`.
- **`frontend/src/pages/LoginPage.tsx`**: Implementación funcional.
- **`frontend/src/pages/RegisterPage.tsx`**: Implementación funcional.
- **`frontend/src/shared/store/auth.store.ts`**: Implementar acciones `login`, `logout`, `refreshToken`.
- **Dependencias externas**: `slowapi>=0.1.9`.
- **Sin breaking changes** en endpoints existentes.
