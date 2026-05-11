## Context

La infraestructura base (Sprint 0) entregó las primitivas de seguridad: `hash_password`, `verify_password`, `create_access_token`, `decode_access_token`, y las dependencias FastAPI `get_current_user` / `require_role`. Los modelos `Usuario`, `RefreshToken`, `Rol` y `UsuarioRol` están declarados y migrados. Lo que falta es la lógica de negocio de los endpoints de autenticación y la integración en el frontend.

## Goals / Non-Goals

**Goals:**
- 4 endpoints operativos: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`.
- Refresh tokens opacos con rotación y detección de replay attack.
- Rate limiting en login: 5 req/IP/15 min via slowapi.
- Frontend: LoginPage y RegisterPage funcionales con `authStore`.

**Non-Goals:**
- Autenticación social (OAuth2 con terceros).
- Verificación de email al registrarse.
- 2FA.
- Gestión de roles por ADMIN (viene en us-007-admin).
- Redis para rate limiting (in-memory es suficiente para MVP).

## Decisions

### 1. Refresh tokens como UUID v4 opacos (no JWT)

Los JWTs no pueden revocarse sin una lista negra en BD, lo que anula la ventaja. El refresh token es un secreto de un solo uso: se genera como UUID v4, se transmite en texto plano al cliente, y se almacena como SHA-256 hash en `refresh_tokens.token_hash`. Esto protege la BD si se filtra.

**Alternativa descartada**: Refresh token como JWT firmado → no permite revocación ni detección de replay.

### 2. Rotación obligatoria + detección de replay attack

Al usar un refresh token:
1. Se busca por hash en BD.
2. Si no existe → HTTP 401.
3. Si existe pero `revoked_at IS NOT NULL` → token ya usado = replay attack → revocar TODOS los tokens del usuario → HTTP 401.
4. Si válido y no revocado → revocar el actual, emitir nuevo par (access + refresh).

Este algoritmo implementa el patrón "refresh token rotation with reuse detection" (RFC recomendado).

### 3. Rate limiting con slowapi (in-memory)

`slowapi` envuelve FastAPI con una API compatible con `limits`. Se instancia un `Limiter` con `key_func=get_remote_address` y se aplica el decorador `@limiter.limit("5/15minute")` sobre `POST /auth/login`. Al exceder retorna HTTP 429.

**Riesgo aceptado**: El contador se pierde al reiniciar el servidor. Aceptable en desarrollo; en producción se puede cambiar el backend a Redis cambiando solo la URL de storage.

### 4. JWT: campo `sub` como string

La convención RFC 7519 define `sub` como string. Se codifica `str(user_id)` al crear el token y se convierte con `int(payload["sub"])` al decodificar. Así se evita ambigüedad de tipo entre el JWT y el ORM.

**Impacto**: `dependencies.py` ya hace `int(user_id)` al leer `sub`; el `create_access_token` debe recibir `{"sub": str(user_id), ...}`.

### 5. Frontend: access token en memoria, refresh token persistido

El access token (30 min) se guarda solo en el store Zustand (en memoria); no se persiste en `localStorage` para minimizar exposición XSS. El refresh token (7 días) se almacena en `localStorage` via el plugin `persist` del `authStore`, protegido por HTTPS + `HttpOnly`-equivalent en la práctica del SPA.

**Alternativa considerada**: refresh token en cookie HttpOnly → requiere cambios en el backend (CORS + cookie) y complejidad adicional. Se posterga.

### 6. Respuesta de login no diferencia errores

`POST /auth/login` retorna siempre HTTP 401 con el mismo mensaje genérico si el email no existe o la contraseña es incorrecta (RN-AU08, prevención de user enumeration).

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|-----------|
| In-memory rate limiter se resetea al reiniciar | Aceptable en MVP; upgrade a Redis cambiando solo `storage_uri` en slowapi |
| Refresh token en localStorage es vulnerable a XSS | Access token no persiste; aplicar CSP estricto en frontend |
| SHA-256 del token UUID puede colisionar teóricamente | UUID v4 tiene 122 bits de entropía; colisión SHA-256 es computacionalmente inviable |
| `require_role` carga todos los roles del usuario en cada request | Aceptable con 4 roles fijos; si los roles crecen, considerar caché de claims en JWT |

## Open Questions

- ¿El logout revoca solo el refresh token recibido en el body, o todos los del usuario? **Decisión propuesta**: solo el token específico (logout del dispositivo actual). Logout total queda como feature futura.
