## ADDED Requirements

### Requirement: Listar usuarios (Admin)
El sistema SHALL exponer `GET /api/v1/usuarios` que retorna una lista paginada de usuarios. Solo usuarios con rol ADMIN pueden acceder. Soporta filtros opcionales: `search` (nombre o email, ILIKE), `rol` (nombre del rol exacto), `activo` (boolean). La respuesta usa el esquema `PaginatedResponse[UsuarioRead]`.

#### Scenario: Listado paginado exitoso
- **WHEN** un Admin autenticado hace `GET /api/v1/usuarios?page=1&size=20`
- **THEN** el sistema retorna HTTP 200 con `{ items: [...], total: N, page: 1, size: 20, pages: P }`

#### Scenario: Filtro por nombre o email
- **WHEN** un Admin hace `GET /api/v1/usuarios?search=juan`
- **THEN** retorna solo usuarios cuyo nombre o email contengan "juan" (case-insensitive)

#### Scenario: Filtro por rol
- **WHEN** un Admin hace `GET /api/v1/usuarios?rol=ADMIN`
- **THEN** retorna solo usuarios que tienen el rol ADMIN asignado

#### Scenario: Acceso sin rol ADMIN
- **WHEN** un usuario con rol CLIENT hace `GET /api/v1/usuarios`
- **THEN** el sistema retorna HTTP 403 Forbidden

---

### Requirement: Editar usuario (Admin)
El sistema SHALL exponer `PUT /api/v1/usuarios/{id}` que permite a un Admin editar nombre, apellido, teléfono y roles de cualquier usuario. Si los roles cambian, se invalidan TODOS los refresh tokens activos del usuario modificado.

#### Scenario: Edición de datos exitosa
- **WHEN** un Admin hace `PUT /api/v1/usuarios/5` con `{ nombre: "Ana", roles: ["CLIENT", "PEDIDOS"] }`
- **THEN** el sistema actualiza el usuario y retorna HTTP 200 con `UsuarioRead` actualizado

#### Scenario: Cambio de roles invalida tokens
- **WHEN** un Admin cambia los roles de un usuario
- **THEN** todos los registros `RefreshToken` del usuario son eliminados de la BD, forzando re-login

#### Scenario: Último Admin no puede ser degradado
- **WHEN** un Admin intenta quitar el rol ADMIN al único administrador del sistema
- **THEN** el sistema retorna HTTP 422 con código `LAST_ADMIN`

#### Scenario: Usuario no encontrado
- **WHEN** el Admin hace `PUT /api/v1/usuarios/9999` y el usuario no existe
- **THEN** el sistema retorna HTTP 404

---

### Requirement: Activar / Desactivar usuario (Admin)
El sistema SHALL exponer `PATCH /api/v1/usuarios/{id}/estado` que permite a un Admin cambiar el campo `is_active` de un usuario. Al desactivar, se invalidan todos los refresh tokens activos del usuario.

#### Scenario: Desactivar usuario exitoso
- **WHEN** un Admin hace `PATCH /api/v1/usuarios/5/estado` con `{ activo: false }`
- **THEN** el usuario queda con `is_active=False`, sus refresh tokens se eliminan, y se retorna HTTP 200

#### Scenario: Activar usuario previamente desactivado
- **WHEN** un Admin hace `PATCH /api/v1/usuarios/5/estado` con `{ activo: true }`
- **THEN** el usuario queda con `is_active=True` y se retorna HTTP 200

#### Scenario: Admin no puede desactivarse a sí mismo si es el último Admin
- **WHEN** el único Admin intenta desactivar su propia cuenta
- **THEN** el sistema retorna HTTP 422 con código `LAST_ADMIN`

---

### Requirement: Validación de cuenta activa en login
El sistema SHALL verificar que `usuario.is_active is True` durante el proceso de login. Si el usuario está inactivo, se rechaza la autenticación.

#### Scenario: Login con cuenta desactivada
- **WHEN** un usuario con `is_active=False` intenta hacer `POST /auth/login`
- **THEN** el sistema retorna HTTP 403 con código `ACCOUNT_DISABLED`

#### Scenario: Login con cuenta activa
- **WHEN** un usuario con `is_active=True` hace `POST /auth/login` con credenciales correctas
- **THEN** el sistema retorna HTTP 200 con tokens (comportamiento sin cambio)

---

### Requirement: UsuarioRepository completo
El repositorio `UsuarioRepository` SHALL heredar de `BaseRepository[Usuario]` e implementar: `get_by_email`, `get_by_id_with_roles`, `list_paginated` (con filtros), y `find_all` básico.

#### Scenario: Búsqueda por email
- **WHEN** se llama `repo.get_by_email("user@example.com")`
- **THEN** retorna el `Usuario` con sus roles cargados, o `None` si no existe

#### Scenario: Listado paginado con filtros
- **WHEN** se llama `repo.list_paginated(page=1, size=10, search="ana", rol=None, activo=True)`
- **THEN** retorna `(items: List[Usuario], total: int)` con usuarios que coincidan con los filtros
