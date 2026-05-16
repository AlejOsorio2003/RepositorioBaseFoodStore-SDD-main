## 1. Schemas (`backend/app/direcciones/schemas.py`)

- [ ] 1.1 Reescribir `DireccionCreate` con campos: `calle` (str, max 255), `numero` (str, max 20), `piso` (str|None, max 10), `departamento` (str|None, max 10), `ciudad` (str, max 100), `provincia` (str, max 100), `codigo_postal` (str, max 10)
- [ ] 1.2 Agregar `DireccionUpdate` con los mismos campos todos opcionales (Optional)
- [ ] 1.3 Agregar `DireccionRead` con campos `id`, `usuario_id`, `calle`, `numero`, `piso`, `departamento`, `ciudad`, `provincia`, `codigo_postal`, `es_principal`, `created_at`; heredar de `SQLModel`; agregar `model_config = ConfigDict(from_attributes=True)`

## 2. Repository (`backend/app/direcciones/repository.py`)

- [ ] 2.1 Implementar `list_by_usuario(usuario_id: int) -> list[DireccionEntrega]`: query `select(DireccionEntrega).where(DireccionEntrega.usuario_id == usuario_id, DireccionEntrega.deleted_at.is_(None))`
- [ ] 2.2 Implementar `get_principal(usuario_id: int) -> DireccionEntrega | None`: query filtrando `usuario_id`, `es_principal == True`, `deleted_at IS NULL`
- [ ] 2.3 Implementar `clear_principal(usuario_id: int) -> None`: ejecutar `update` sobre todas las filas del usuario con `es_principal = True` → `False` (usar `session.exec(update(DireccionEntrega).where(...).values(es_principal=False))`)
- [ ] 2.4 Implementar `count_activas(usuario_id: int) -> int`: cuenta direcciones activas del usuario (sin `deleted_at`)

## 3. Service (`backend/app/direcciones/service.py`)

- [ ] 3.1 Implementar `listar(uow, current_user, usuario_id_param: int | None = None) -> list[DireccionEntrega]`: si current_user es ADMIN y pasa `usuario_id_param`, filtra por ese id; sino filtra por `current_user.id`
- [ ] 3.2 Implementar `obtener(uow, id, current_user) -> DireccionEntrega`: `get_by_id` → 404 si no existe o `deleted_at != NULL`; verificar ownership → 403 si no es dueño ni ADMIN
- [ ] 3.3 Implementar `crear(uow, data: DireccionCreate, current_user) -> DireccionEntrega`: crear `DireccionEntrega` con `usuario_id = current_user.id`; si `count_activas == 0`, setear `es_principal = True` automáticamente; `session.add` + flush
- [ ] 3.4 Implementar `actualizar(uow, id, data: DireccionUpdate, current_user) -> DireccionEntrega`: llamar `obtener` (ya hace 404/403); aplicar campos no-None del update al objeto; guardar
- [ ] 3.5 Implementar `eliminar(uow, id, current_user) -> None`: llamar `obtener` (ya hace 404/403); si `es_principal == True` → 422 "No se puede eliminar la dirección principal — asigná otra como principal primero"; `soft_delete`
- [ ] 3.6 Implementar `marcar_principal(uow, id, current_user) -> DireccionEntrega`: llamar `obtener` (ya hace 404/403); `clear_principal(current_user.id)`; setear `es_principal = True` en la dirección indicada; guardar

## 4. Router (`backend/app/direcciones/router.py`)

- [ ] 4.1 Cambiar prefix a `"/api/v1/direcciones"` y agregar `tags=["Direcciones"]` (ya tiene el prefix, verificar que esté correcto)
- [ ] 4.2 `GET /` → `listar` — `Depends(get_current_user)`, query param opcional `usuario_id: int | None = None`; `response_model=list[DireccionRead]`
- [ ] 4.3 `POST /` → `crear` — `Depends(get_current_user)`; `response_model=DireccionRead`; status `201`
- [ ] 4.4 `GET /{id}` → `obtener` — `Depends(get_current_user)`; `response_model=DireccionRead`
- [ ] 4.5 `PUT /{id}` → `actualizar` — `Depends(get_current_user)`; `response_model=DireccionRead`
- [ ] 4.6 `DELETE /{id}` → `eliminar` — `Depends(get_current_user)`; status `204`
- [ ] 4.7 `PATCH /{id}/principal` → `marcar_principal` — `Depends(get_current_user)`; `response_model=DireccionRead`

## 5. Unit of Work (`backend/app/core/uow.py`)

- [ ] 5.1 Importar `DireccionRepository` desde `app.direcciones.repository` en `_init_repositories`
- [ ] 5.2 Cambiar tipo de `self.direcciones` de `BaseRepository[DireccionEntrega]` a `DireccionRepository`

## 6. Verificación

- [ ] 6.1 Reiniciar uvicorn y verificar que no hay errores de startup
- [ ] 6.2 `GET /api/v1/direcciones` sin token → 401
- [ ] 6.3 `GET /api/v1/direcciones` con token → 200 con lista vacía (usuario nuevo)
- [ ] 6.4 `POST /api/v1/direcciones` con token → 201, primera dirección tiene `es_principal = true`
- [ ] 6.5 `POST /api/v1/direcciones` con token → 201, segunda dirección tiene `es_principal = false`
- [ ] 6.6 `PATCH /api/v1/direcciones/{id2}/principal` → 200, segunda dirección pasa a ser principal y la primera deja de serlo
- [ ] 6.7 `DELETE /api/v1/direcciones/{id_principal}` → 422 (no se puede eliminar la principal)
- [ ] 6.8 `DELETE /api/v1/direcciones/{id_no_principal}` → 204
- [ ] 6.9 `GET /api/v1/direcciones/{id_otro_usuario}` con token de otro usuario → 403
