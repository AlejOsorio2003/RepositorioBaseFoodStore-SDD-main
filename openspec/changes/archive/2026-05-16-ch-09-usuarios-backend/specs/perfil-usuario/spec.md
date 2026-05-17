## ADDED Requirements

### Requirement: Ver perfil propio
El sistema SHALL exponer `GET /api/v1/auth/me` que retorna los datos del usuario autenticado (id, nombre, apellido, email, telefono, roles, created_at). El email se extrae del JWT y se carga el usuario desde BD para obtener datos actualizados.

#### Scenario: Perfil de usuario autenticado
- **WHEN** un usuario con token válido hace `GET /api/v1/auth/me`
- **THEN** el sistema retorna HTTP 200 con `UserResponse` del usuario autenticado

#### Scenario: Sin token
- **WHEN** se hace `GET /api/v1/auth/me` sin header Authorization
- **THEN** el sistema retorna HTTP 401

---

### Requirement: Editar perfil propio
El sistema SHALL exponer `PUT /api/v1/auth/me` que permite al usuario autenticado modificar nombre, apellido y teléfono. El email NO puede modificarse.

#### Scenario: Edición exitosa de perfil
- **WHEN** un usuario autenticado hace `PUT /api/v1/auth/me` con `{ nombre: "Carlos", apellido: "López", telefono: "1122334455" }`
- **THEN** el sistema persiste los cambios y retorna HTTP 200 con `UserResponse` actualizado

#### Scenario: Campo email ignorado
- **WHEN** el body incluye un campo `email`
- **THEN** el sistema ignora el campo y no modifica el email del usuario

#### Scenario: Validación de campos
- **WHEN** se envía `nombre` vacío o con más de 100 caracteres
- **THEN** el sistema retorna HTTP 422 con detalle del campo inválido

---

### Requirement: Cambiar contraseña propia
El sistema SHALL exponer `PUT /api/v1/auth/me/password` que verifica la contraseña actual con bcrypt y, si es correcta, hashea y persiste la nueva contraseña. Al completar, se invalidan TODOS los refresh tokens del usuario (forzar re-login).

#### Scenario: Cambio de contraseña exitoso
- **WHEN** un usuario autenticado hace `PUT /api/v1/auth/me/password` con `{ password_actual: "OldPass1!", password_nueva: "NewPass2@" }`
- **THEN** el sistema actualiza el hash, elimina todos los refresh tokens del usuario y retorna HTTP 204

#### Scenario: Contraseña actual incorrecta
- **WHEN** se envía un `password_actual` que no coincide con el hash almacenado
- **THEN** el sistema retorna HTTP 400 con código `INVALID_CURRENT_PASSWORD`

#### Scenario: Nueva contraseña muy corta
- **WHEN** `password_nueva` tiene menos de 8 caracteres
- **THEN** el sistema retorna HTTP 422 con detalle de validación

#### Scenario: Tokens invalidados tras cambio
- **WHEN** el cambio de contraseña es exitoso
- **THEN** cualquier intento posterior de `POST /auth/refresh` con los tokens anteriores retorna HTTP 401
