## 1. Dependencias y configuración

- [x] 1.1 Agregar `slowapi>=0.1.9` a `backend/requirements.txt`
- [x] 1.2 Instalar dependencias con `pip install -r requirements.txt` en el entorno virtual
- [x] 1.3 Registrar `slowapi.Limiter` con `key_func=get_remote_address` en `app/main.py` y añadir `SlowAPIMiddleware`

## 2. Primitivas de seguridad (backend/app/core/security.py)

- [x] 2.1 Agregar función `hash_token(token: str) -> str` que retorna SHA-256 hex del token
- [x] 2.2 Agregar función `generate_refresh_token() -> tuple[str, str]` que genera UUID v4 y retorna `(plain_uuid, sha256_hash)` — sin tocar la BD (la persistencia va en el service)

## 3. Schemas Pydantic (backend/app/auth/schemas.py)

- [x] 3.1 Crear `RegisterRequest` con campos: `email`, `password`, `nombre`, `apellido`, `telefono` (opcional)
- [x] 3.2 Crear `LoginRequest` con campos: `email`, `password`
- [x] 3.3 Crear `TokenResponse` con campos: `access_token`, `refresh_token`, `token_type`
- [x] 3.4 Crear `RefreshRequest` con campo: `refresh_token`
- [x] 3.5 Crear `LogoutRequest` con campo: `refresh_token`

## 4. Service de autenticación (backend/app/auth/service.py)

- [x] 4.1 Crear `auth/service.py` con funciones stateless
- [x] 4.2 Implementar `register(data: RegisterRequest, uow: UnitOfWork) -> TokenResponse`
- [x] 4.3 Implementar `login(data: LoginRequest, uow: UnitOfWork) -> TokenResponse`
- [x] 4.4 Implementar `refresh(data: RefreshRequest, uow: UnitOfWork) -> TokenResponse`
- [x] 4.5 Implementar `logout(data: LogoutRequest, uow: UnitOfWork) -> None`

## 5. Endpoints de autenticación (backend/app/auth/router.py)

- [x] 5.1 Implementar `POST /auth/register`: parsear `RegisterRequest`, delegar a `service.register()`, retornar HTTP 201
- [x] 5.2 Implementar `POST /auth/login` con decorador `@limiter.limit("5/15minute")`: parsear `LoginRequest`, delegar a `service.login()`, retornar HTTP 200
- [x] 5.3 Implementar `POST /auth/refresh`: parsear `RefreshRequest`, delegar a `service.refresh()`, retornar HTTP 200
- [x] 5.4 Implementar `POST /auth/logout`: parsear `LogoutRequest`, delegar a `service.logout()`, retornar HTTP 204
- [x] 5.5 Verificar que `app/main.py` incluye SlowAPIMiddleware y el router de auth ya está registrado con prefix `/api/v1/auth`

## 6. Verificación backend

- [x] 6.1 Arrancar el servidor con `uvicorn app.main:app --reload` y confirmar que no hay errores de importación
- [x] 6.2 Probar `POST /auth/register` desde Swagger (`/docs`) con datos válidos → HTTP 201
- [x] 6.3 Probar `POST /auth/login` con credenciales correctas → HTTP 200 con tokens
- [x] 6.4 Probar `POST /auth/login` con credenciales incorrectas → HTTP 401 con mensaje genérico
- [x] 6.5 Probar `POST /auth/refresh` con el refresh token obtenido → HTTP 200 con nuevos tokens
- [x] 6.6 Probar replay attack: usar el refresh token anterior tras un refresh → HTTP 401
- [x] 6.7 Probar `POST /auth/logout` → HTTP 204; intentar refresh con el mismo token → HTTP 401

## 7. Frontend — authStore (frontend/src/shared/store/auth.store.ts)

- [x] 7.1 Definir tipos `AuthUser` (id, email, nombre, roles) y `AuthState` en el store
- [x] 7.2 Implementar acción `login(email, password)`: llamar a `POST /auth/login`, guardar tokens y datos del usuario en el store, activar `persist` para el refresh token
- [x] 7.3 Implementar acción `logout()`: llamar a `POST /auth/logout` con el refresh token, limpiar el store
- [x] 7.4 Implementar acción `refreshToken()`: llamar a `POST /auth/refresh`, actualizar el access token en memoria

## 8. Frontend — interceptor Axios (frontend/src/shared/api/axios.ts)

- [x] 8.1 Completar el interceptor de request para inyectar `Authorization: Bearer <access_token>` desde el `authStore`
- [x] 8.2 Completar el interceptor de response para detectar HTTP 401, llamar a `refreshToken()` y reintentar el request original; si el refresh también falla, redirigir al login

## 9. Frontend — LoginPage (frontend/src/pages/LoginPage.tsx)

- [x] 9.1 Implementar formulario con TanStack Form: campos `email` y `password` con validación básica
- [x] 9.2 Conectar el submit a la mutación TanStack Query que llama a `authStore.login()`
- [x] 9.3 Redirigir al catálogo (`/`) tras login exitoso; mostrar error genérico si HTTP 401

## 10. Frontend — RegisterPage (frontend/src/pages/RegisterPage.tsx)

- [x] 10.1 Implementar formulario con TanStack Form: campos `nombre`, `apellido`, `email`, `password`, `telefono` (opcional)
- [x] 10.2 Conectar el submit a la mutación TanStack Query que llama a `POST /auth/register`
- [x] 10.3 Redirigir al login tras registro exitoso; mostrar error si HTTP 409 (email duplicado)

## 11. Verificación frontend

- [x] 11.1 Verificar que el flujo completo registro → login → acceso autenticado funciona en el navegador
- [x] 11.2 Verificar que el refresh silencioso reintenta la petición original sin interrumpir la UX
- [x] 11.3 Verificar que logout limpia el store y redirige al login (✅ Header component con botón logout implementado)
