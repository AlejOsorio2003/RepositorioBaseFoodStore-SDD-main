## 1. Schemas Pydantic (backend/app/usuarios/schemas.py)

- [x] 1.1 Crear `UsuarioRead` con campos: `id`, `nombre`, `apellido`, `email`, `telefono`, `is_active`, `roles: list[str]`, `created_at`
- [x] 1.2 Crear `UsuarioUpdate` para admin con campos opcionales: `nombre`, `apellido`, `telefono`, `roles: list[str]` (nombres de rol)
- [x] 1.3 Crear `UsuarioUpdateEstado` con campo `activo: bool`
- [x] 1.4 Crear `PerfilUpdate` con campos opcionales: `nombre`, `apellido`, `telefono` (solo autoservicio — sin roles)
- [x] 1.5 Crear `CambiarPasswordRequest` con campos: `password_actual: str`, `password_nueva: str` (mínimo 8 caracteres)

## 2. UsuarioRepository (backend/app/usuarios/repository.py)

- [x] 2.1 Implementar `get_by_email(email: str) -> Usuario | None` con eager-load de roles (selectinload)
- [x] 2.2 Implementar `get_by_id_with_roles(usuario_id: int) -> Usuario | None` con eager-load de roles
- [x] 2.3 Implementar `list_paginated(page, size, search, rol, activo) -> tuple[list[Usuario], int]` — filtros ILIKE en nombre/apellido/email, filtro por nombre de rol vía join, filtro por `is_active`

## 3. UsuarioService (backend/app/usuarios/service.py)

- [x] 3.1 Implementar `get_me(uow, usuario_id: int) -> UsuarioRead` — carga usuario con roles
- [x] 3.2 Implementar `update_me(uow, usuario_id: int, data: PerfilUpdate) -> UsuarioRead` — actualiza nombre, apellido, teléfono
- [x] 3.3 Implementar `change_password(uow, usuario_id: int, data: CambiarPasswordRequest) -> None` — verifica password actual con bcrypt, hashea nueva contraseña, invalida todos los refresh tokens del usuario
- [x] 3.4 Implementar `list_usuarios(uow, page, size, search, rol, activo) -> PaginatedResponse[UsuarioRead]`
- [x] 3.5 Implementar `update_usuario(uow, usuario_id: int, data: UsuarioUpdate, current_user_id: int) -> UsuarioRead` — actualiza datos + roles, valida regla LAST_ADMIN, invalida refresh tokens si roles cambian
- [x] 3.6 Implementar `toggle_estado(uow, usuario_id: int, data: UsuarioUpdateEstado, current_user_id: int) -> UsuarioRead` — cambia `is_active`, valida LAST_ADMIN si se desactiva el único admin, invalida refresh tokens al desactivar

## 4. Auth service — validación de cuenta activa (backend/app/auth/service.py)

- [x] 4.1 Agregar chequeo `if not usuario.is_active` en la función `login()` → raise `HTTPException(403, detail="ACCOUNT_DISABLED")`

## 5. Router de autoservicio en auth (backend/app/auth/router.py)

- [x] 5.1 Agregar dependencia `get_current_user` desde `app.core.dependencies` y usarla en los tres endpoints /me
- [x] 5.2 Implementar `GET /auth/me` → `response_model=UsuarioRead` → delega a `usuario_service.get_me()`
- [x] 5.3 Implementar `PUT /auth/me` → `response_model=UsuarioRead` → delega a `usuario_service.update_me()`
- [x] 5.4 Implementar `PUT /auth/me/password` → `status_code=204` → delega a `usuario_service.change_password()`

## 6. Router de administración de usuarios (backend/app/usuarios/router.py)

- [x] 6.1 Implementar `GET /usuarios` → `response_model=PaginatedResponse[UsuarioRead]` → solo ADMIN → delega a `service.list_usuarios()`
- [x] 6.2 Implementar `PUT /usuarios/{usuario_id}` → `response_model=UsuarioRead` → solo ADMIN → delega a `service.update_usuario()`
- [x] 6.3 Implementar `PATCH /usuarios/{usuario_id}/estado` → `response_model=UsuarioRead` → solo ADMIN → delega a `service.toggle_estado()`

## 7. UoW y wiring

- [x] 7.1 Agregar `usuarios: UsuarioRepository` al `UnitOfWork` en `backend/app/core/uow.py`
- [x] 7.2 Registrar `usuarios_router` en `backend/app/main.py` con prefix `/api/v1/usuarios` y tag `usuarios`

## 8. Verificación

- [ ] 8.1 Arrancar el servidor y confirmar que no hay errores de importación
- [ ] 8.2 Probar `GET /api/v1/auth/me` con token válido → HTTP 200 con datos del usuario
- [ ] 8.3 Probar `PUT /api/v1/auth/me` con nombre/teléfono nuevos → HTTP 200 con datos actualizados
- [ ] 8.4 Probar `PUT /api/v1/auth/me/password` con contraseña correcta → HTTP 204; luego intentar refresh con token anterior → HTTP 401
- [ ] 8.5 Probar `PUT /api/v1/auth/me/password` con contraseña incorrecta → HTTP 400
- [ ] 8.6 Probar `GET /api/v1/usuarios` con token ADMIN → HTTP 200 con lista paginada
- [ ] 8.7 Probar `GET /api/v1/usuarios` con token CLIENT → HTTP 403
- [ ] 8.8 Probar `PATCH /api/v1/usuarios/{id}/estado` desactivando usuario → HTTP 200; luego intentar login con ese usuario → HTTP 403
- [ ] 8.9 Probar `PUT /api/v1/usuarios/{id}` cambiando roles → HTTP 200; verificar que refresh tokens del usuario quedan invalidados
