## 1. Dependencias y configuración

- [ ] 1.1 Agregar `slowapi>=0.1.9` a `backend/requirements.txt`
- [ ] 1.2 Instalar dependencias con `pip install -r requirements.txt` en el entorno virtual
- [ ] 1.3 Registrar `slowapi.Limiter` con `key_func=get_remote_address` en `app/main.py` y añadir `SlowAPIMiddleware`

## 2. Primitivas de seguridad (backend/app/core/security.py)

- [ ] 2.1 Agregar función `hash_token(token: str) -> str` que retorna SHA-256 hex del token
- [ ] 2.2 Agregar función `create_refresh_token(user_id: int, session: Session) -> str` que genera UUID v4, inserta en `refresh_tokens` con hash y `expires_at`, y retorna el UUID en texto plano

## 3. Schemas Pydantic (backend/app/auth/schemas.py)

- [ ] 3.1 Crear `RegisterRequest` con campos: `email`, `password`, `nombre`, `apellido`, `telefono` (opcional)
- [ ] 3.2 Crear `LoginRequest` con campos: `email`, `password`
- [ ] 3.3 Crear `TokenResponse` con campos: `access_token`, `refresh_token`, `token_type`
- [ ] 3.4 Crear `RefreshRequest` con campo: `refresh_token`
- [ ] 3.5 Crear `LogoutRequest` con campo: `refresh_token`

## 4. Endpoints de autenticación (backend/app/auth/router.py)

- [ ] 4.1 Implementar `POST /auth/register`: hashear password, crear Usuario, asignar rol CLIENT (ID=4) en `usuario_roles`, retornar `TokenResponse` con HTTP 201
- [ ] 4.2 Implementar `POST /auth/login` con decorador `@limiter.limit("5/15minute")`: verificar credenciales, retornar HTTP 401 genérico si falla (RN-AU08), emitir access + refresh token si válido
- [ ] 4.3 Implementar `POST /auth/refresh`: buscar token por hash, detectar replay attack (revocar todos si token ya revocado), rotar tokens, retornar nuevo par
- [ ] 4.4 Implementar `POST /auth/logout`: buscar token por hash, establecer `revoked_at`, retornar HTTP 204 (idempotente)
- [ ] 4.5 Verificar que `app/main.py` incluye el router de auth con prefix `/auth` y tag `auth`

## 5. Verificación backend

- [ ] 5.1 Arrancar el servidor con `uvicorn app.main:app --reload` y confirmar que no hay errores de importación
- [ ] 5.2 Probar `POST /auth/register` desde Swagger (`/docs`) con datos válidos → HTTP 201
- [ ] 5.3 Probar `POST /auth/login` con credenciales correctas → HTTP 200 con tokens
- [ ] 5.4 Probar `POST /auth/login` con credenciales incorrectas → HTTP 401 con mensaje genérico
- [ ] 5.5 Probar `POST /auth/refresh` con el refresh token obtenido → HTTP 200 con nuevos tokens
- [ ] 5.6 Probar replay attack: usar el refresh token anterior tras un refresh → HTTP 401
- [ ] 5.7 Probar `POST /auth/logout` → HTTP 204; intentar refresh con el mismo token → HTTP 401

## 6. Frontend — authStore (frontend/src/shared/store/auth.store.ts)

- [ ] 6.1 Definir tipos `AuthUser` (id, email, nombre, roles) y `AuthState` en el store
- [ ] 6.2 Implementar acción `login(email, password)`: llamar a `POST /auth/login`, guardar tokens y datos del usuario en el store, activar `persist` para el refresh token
- [ ] 6.3 Implementar acción `logout()`: llamar a `POST /auth/logout` con el refresh token, limpiar el store
- [ ] 6.4 Implementar acción `refreshToken()`: llamar a `POST /auth/refresh`, actualizar el access token en memoria

## 7. Frontend — interceptor Axios (frontend/src/shared/api/axios.ts)

- [ ] 7.1 Completar el interceptor de request para inyectar `Authorization: Bearer <access_token>` desde el `authStore`
- [ ] 7.2 Completar el interceptor de response para detectar HTTP 401, llamar a `refreshToken()` y reintentar el request original; si el refresh también falla, redirigir al login

## 8. Frontend — LoginPage (frontend/src/pages/LoginPage.tsx)

- [ ] 8.1 Implementar formulario con TanStack Form: campos `email` y `password` con validación básica
- [ ] 8.2 Conectar el submit a la mutación TanStack Query que llama a `authStore.login()`
- [ ] 8.3 Redirigir al catálogo (`/`) tras login exitoso; mostrar error genérico si HTTP 401

## 9. Frontend — RegisterPage (frontend/src/pages/RegisterPage.tsx)

- [ ] 9.1 Implementar formulario con TanStack Form: campos `nombre`, `apellido`, `email`, `password`, `telefono` (opcional)
- [ ] 9.2 Conectar el submit a la mutación TanStack Query que llama a `POST /auth/register`
- [ ] 9.3 Redirigir al login tras registro exitoso; mostrar error si HTTP 409 (email duplicado)

## 10. Verificación frontend

- [ ] 10.1 Verificar que el flujo completo registro → login → acceso autenticado funciona en el navegador
- [ ] 10.2 Verificar que el refresh silencioso reintenta la petición original sin interrumpir la UX
- [ ] 10.3 Verificar que logout limpia el store y redirige al login
