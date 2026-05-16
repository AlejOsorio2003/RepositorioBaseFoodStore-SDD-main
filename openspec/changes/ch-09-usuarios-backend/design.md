## Context

El módulo `usuarios/` fue creado como placeholder en CH-02 con repository, service y router vacíos. El modelo `Usuario` (con `is_active`, `email`, `nombre`, `apellido`, `telefono`, `deleted_at`) y la tabla `usuario_roles` ya existen desde CH-00 y no requieren migración. Auth (CH-01) implementó register/login/refresh/logout pero no `/me` ni cambio de contraseña.

## Goals / Non-Goals

**Goals:**
- Completar las 4 capas del módulo `usuarios/` siguiendo el patrón Router → Service → UoW → Repository
- Agregar endpoints de autoservicio (`/auth/me` GET, PUT, PUT /password) al router de auth
- Agregar endpoints admin (`/usuarios` GET list, PUT, PATCH /estado) al router de usuarios
- Invalidar refresh tokens al cambiar roles o desactivar un usuario
- Validar `is_active=False` en login con HTTP 403

**Non-Goals:**
- Frontend de gestión de usuarios (CH-15)
- Cambio de email (el email es identificador inmutable por spec)
- Endpoint de eliminación física (la BD usa soft delete, `deleted_at`)
- Sistema de invitaciones o auto-registro de admins

## Decisions

### 1. Endpoints /me van en `auth/router.py`, no en `usuarios/router.py`
**Decisión**: agregar GET/PUT `/auth/me` y PUT `/auth/me/password` al router de auth (prefix `/api/v1/auth`).
**Rationale**: La spec 5.1 define `GET /api/v1/auth/me` en el módulo auth. El router de auth ya tiene el contexto de autenticación (get_current_user). Moverlos a `/api/v1/usuarios/me` rompería la spec.
**Alternativa descartada**: crear un router `/perfil` separado — innecesario, agrega un prefix más.

### 2. Lógica de /me en `auth/service.py` vs `usuarios/service.py`
**Decisión**: la lógica de get_me / update_me / change_password va en `usuarios/service.py` y es llamada desde `auth/router.py`.
**Rationale**: mantiene service de auth enfocado en tokens. `UsuarioService` es el dueño natural de operaciones sobre el modelo `Usuario`.

### 3. Invalidación de tokens en cambio de rol o desactivación
**Decisión**: al ejecutar `PUT /usuarios/{id}` (cambio de roles) o `PATCH /usuarios/{id}/estado` (desactivar), el service elimina todos los `RefreshToken` activos del usuario afectado usando `RefreshTokenRepository`.
**Rationale**: un usuario con rol cambiado podría conservar un token con claims obsoletos por hasta 30 min. La invalidación fuerza re-login con el nuevo rol.

### 4. Listado admin usa paginación estándar del proyecto
**Decisión**: `GET /api/v1/usuarios?page=1&size=20&search=&rol=&activo=` — mismo esquema `PaginatedResponse[T]` usado en productos y categorías.
**Rationale**: consistencia con el resto de la API.

### 5. Campo `activo` en login
**Decisión**: agregar chequeo en `auth/service.py → login()`: si `usuario.is_active is False` → raise HTTPException(403, "ACCOUNT_DISABLED").
**Rationale**: campo `is_active` ya existe en el modelo. El servicio de auth es el único punto de login.

## Risks / Trade-offs

- **Risk: ventana de 30 min con token obsoleto tras cambio de rol** → Mitigado por la invalidación de refresh tokens (el siguiente refresh falla y fuerza re-login).
- **Risk: `auth/router.py` crece en responsabilidades** → Aceptado: solo delega a `UsuarioService`; la lógica no vive en el router.
- **Trade-off: no se expone endpoint de soft-delete explícito** → Consistente con la spec (no hay `DELETE /usuarios/{id}` en la tabla de endpoints de 5.x). Si se necesita, se hace vía PATCH /estado.

## Migration Plan

No hay migraciones de BD. El modelo `Usuario` y la tabla `usuario_roles` existen. Sólo se necesita:
1. Completar las 4 capas de `usuarios/`
2. Modificar `auth/service.py` para validar `is_active`
3. Modificar `auth/router.py` para agregar /me endpoints
4. Registrar el router de usuarios en `main.py`
5. Actualizar el UoW para exponer `usuarios: UsuarioRepository`

Rollback: revertir los cambios en router/service/uow — no hay cambio estructural en BD.
