## ADDED Requirements

### Requirement: Registro de usuario
El endpoint `POST /auth/register` SHALL aceptar `email`, `password`, `nombre`, `apellido` y `telefono` (opcional). SHALL hashear la contraseña con bcrypt cost≥12, crear el `Usuario`, y asignar automáticamente el rol CLIENT (ID=4) vía `UsuarioRol`. El rol NO puede ser indicado por el cliente. Retorna HTTP 201 con el `TokenResponse` (access token + refresh token).

#### Scenario: Registro exitoso
- **WHEN** se envía `POST /auth/register` con email único y contraseña válida
- **THEN** el sistema retorna HTTP 201 con `access_token`, `refresh_token` y `token_type: "bearer"`

#### Scenario: Email duplicado
- **WHEN** se envía `POST /auth/register` con un email ya registrado
- **THEN** el sistema retorna HTTP 409 con `detail: "El email ya está registrado"`

#### Scenario: Rol asignado automáticamente
- **WHEN** se completa un registro exitoso
- **THEN** el usuario tiene exactamente un rol asignado: CLIENT (ID=4), sin importar el body del request

#### Scenario: Contraseña hasheada
- **WHEN** se consulta `usuarios.password_hash` del usuario recién registrado
- **THEN** el valor empieza con `$2b$12$` (bcrypt cost 12) y no contiene la contraseña en texto plano

---

### Requirement: Login con rate limiting
El endpoint `POST /auth/login` SHALL aceptar `email` y `password`. SHALL verificar credenciales con `verify_password`. Si son válidas, SHALL crear un access token JWT (30 min) con claims `{"sub": str(user_id), "email": email, "roles": [nombres]}` y un refresh token opaco UUID v4. SHALL aplicar rate limiting de 5 intentos por IP en ventana de 15 minutos via slowapi.

#### Scenario: Login exitoso
- **WHEN** se envía `POST /auth/login` con credenciales correctas
- **THEN** el sistema retorna HTTP 200 con `access_token`, `refresh_token` y `token_type: "bearer"`

#### Scenario: Credenciales incorrectas — respuesta genérica
- **WHEN** se envía `POST /auth/login` con email inexistente O con contraseña incorrecta
- **THEN** el sistema retorna HTTP 401 con el mismo mensaje `"Credenciales inválidas"` en ambos casos

#### Scenario: Rate limiting excedido
- **WHEN** una misma IP envía más de 5 requests a `POST /auth/login` en 15 minutos
- **THEN** el sistema retorna HTTP 429 y rechaza todos los intentos posteriores en esa ventana

#### Scenario: Usuario inactivo
- **WHEN** se envía `POST /auth/login` con credenciales correctas de un usuario con `is_active=False`
- **THEN** el sistema retorna HTTP 401 con mensaje genérico (no diferencia del caso de credenciales erróneas)

---

### Requirement: Refresh token con rotación
El endpoint `POST /auth/refresh` SHALL aceptar un `refresh_token` en el body. SHALL buscar el hash SHA-256 del token en la tabla `refresh_tokens`. Si el token existe y no está revocado, SHALL revocar el token actual y emitir un nuevo par (access token + refresh token). Si el token ya fue revocado previamente (replay attack), SHALL revocar TODOS los refresh tokens del usuario.

#### Scenario: Refresh exitoso
- **WHEN** se envía `POST /auth/refresh` con un refresh token válido y no revocado
- **THEN** el sistema retorna HTTP 200 con un nuevo `access_token` y un nuevo `refresh_token`; el token anterior queda con `revoked_at` establecido

#### Scenario: Token inválido o inexistente
- **WHEN** se envía `POST /auth/refresh` con un token que no existe en BD
- **THEN** el sistema retorna HTTP 401

#### Scenario: Replay attack detectado
- **WHEN** se envía `POST /auth/refresh` con un token que ya fue revocado (`revoked_at IS NOT NULL`)
- **THEN** el sistema revoca TODOS los refresh tokens activos del usuario y retorna HTTP 401

#### Scenario: Token expirado
- **WHEN** se envía `POST /auth/refresh` con un token cuyo `expires_at` es anterior a la fecha actual
- **THEN** el sistema retorna HTTP 401

---

### Requirement: Logout
El endpoint `POST /auth/logout` SHALL aceptar un `refresh_token` en el body (no requiere Bearer header). SHALL buscar el token por hash y, si existe y es del usuario autenticado, establecer `revoked_at` con el timestamp actual.

#### Scenario: Logout exitoso
- **WHEN** se envía `POST /auth/logout` con un refresh token válido
- **THEN** el sistema establece `revoked_at` en ese token y retorna HTTP 204

#### Scenario: Token desconocido en logout
- **WHEN** se envía `POST /auth/logout` con un token que no existe en BD
- **THEN** el sistema retorna HTTP 204 igualmente (idempotente, no expone existencia del token)
