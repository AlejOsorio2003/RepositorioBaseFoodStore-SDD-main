## Why

El módulo `usuarios/` existe como scaffold vacío desde CH-02 y el endpoint `GET /auth/me` falta en auth, bloqueando el perfil del cliente y la gestión administrativa de usuarios. CH-09 completa el backend de usuarios para habilitar CH-10 (Pedidos) y el panel admin.

## What Changes

- Implementar `UsuarioRepository` con listado paginado + filtros (nombre, email, rol, activo)
- Implementar `UsuarioService` con lógica de negocio para admin y autoservicio
- Implementar `UsuarioRouter` con 6 endpoints:
  - `GET /api/v1/auth/me` — perfil propio
  - `PUT /api/v1/auth/me` — editar perfil propio (nombre, apellido, telefono)
  - `PUT /api/v1/auth/me/password` — cambiar contraseña (requiere password actual)
  - `GET /api/v1/usuarios` — listar usuarios (ADMIN only)
  - `PUT /api/v1/usuarios/{id}` — editar usuario + asignar roles (ADMIN only)
  - `PATCH /api/v1/usuarios/{id}/estado` — activar/desactivar (ADMIN only)
- Agregar validación `activo=false` → HTTP 403 en `POST /auth/login`
- Invalidar todos los refresh tokens del usuario al cambiar rol o desactivarlo
- Completar schemas Pydantic del módulo `usuarios/`

## Capabilities

### New Capabilities
- `usuarios-backend`: CRUD administrativo de usuarios — listado paginado con filtros, edición de datos y roles, soft-disable con invalidación de tokens, soft delete, RBAC estricto (solo ADMIN)
- `perfil-usuario`: Autoservicio de perfil — GET/PUT /auth/me + cambio de contraseña con verificación del password actual + invalidación de tokens al cambiar contraseña

### Modified Capabilities
- (ninguna)

## Impact

- **Backend modificado**: `backend/app/usuarios/` (schemas, repository, service, router), `backend/app/auth/router.py` (agrega /me endpoints), `backend/app/auth/service.py` (agrega lógica de validación activo en login)
- **UoW**: `backend/app/core/uow.py` — agregar `usuarios: UsuarioRepository`
- **main.py**: registrar router de usuarios con prefix `/api/v1/usuarios`
- **Sin migraciones**: el modelo `Usuario` + tabla `usuario_rol` ya existen desde CH-00. Solo se agrega validación de campo `activo` existente
- **Prerequisito de**: CH-10 (Pedidos — necesita usuarios activos y roles), CH-14/15 (Admin dashboard)
