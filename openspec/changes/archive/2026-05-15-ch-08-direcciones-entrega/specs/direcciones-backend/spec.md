## ADDED Requirements

### Requirement: Listar direcciones del usuario autenticado
El sistema SHALL exponer `GET /api/v1/direcciones` que retorna todas las direcciones activas del usuario autenticado.

#### Scenario: Usuario obtiene sus propias direcciones
- **WHEN** usuario autenticado llama `GET /api/v1/direcciones`
- **THEN** retorna 200 con `list[DireccionRead]` filtradas por `usuario_id = current_user.id` y `deleted_at IS NULL`

#### Scenario: Admin puede filtrar por usuario_id
- **WHEN** usuario ADMIN llama `GET /api/v1/direcciones?usuario_id=5`
- **THEN** retorna 200 con las direcciones del usuario 5

#### Scenario: Sin token retorna 401
- **WHEN** se llama sin header Authorization
- **THEN** retorna 401

### Requirement: Crear dirección de entrega
El sistema SHALL exponer `POST /api/v1/direcciones` que crea una nueva dirección para el usuario autenticado.

#### Scenario: Creación exitosa
- **WHEN** usuario autenticado envía `DireccionCreate` válido
- **THEN** retorna 201 con `DireccionRead` de la nueva dirección con `usuario_id = current_user.id`

#### Scenario: Primera dirección se marca como principal automáticamente
- **WHEN** el usuario no tiene ninguna dirección activa y crea la primera
- **THEN** la dirección se crea con `es_principal = True`

#### Scenario: Sin token retorna 401
- **WHEN** se llama sin header Authorization
- **THEN** retorna 401

### Requirement: Obtener dirección por ID
El sistema SHALL exponer `GET /api/v1/direcciones/{id}` que retorna una dirección específica.

#### Scenario: Dueño obtiene su dirección
- **WHEN** el usuario autenticado es dueño de la dirección con ese `id`
- **THEN** retorna 200 con `DireccionRead`

#### Scenario: Dirección no encontrada retorna 404
- **WHEN** el `id` no existe o está soft-deleted
- **THEN** retorna 404

#### Scenario: Dirección de otro usuario retorna 403
- **WHEN** un usuario no-ADMIN intenta acceder a una dirección que no le pertenece
- **THEN** retorna 403

### Requirement: Actualizar dirección
El sistema SHALL exponer `PUT /api/v1/direcciones/{id}` que actualiza los campos de una dirección.

#### Scenario: Actualización exitosa por dueño
- **WHEN** el dueño envía `DireccionUpdate` con campos modificados
- **THEN** retorna 200 con `DireccionRead` actualizado

#### Scenario: Campos no enviados no se modifican
- **WHEN** `DireccionUpdate` omite campos opcionales
- **THEN** esos campos conservan su valor actual

#### Scenario: Dirección de otro usuario retorna 403
- **WHEN** un usuario no-ADMIN intenta actualizar una dirección ajena
- **THEN** retorna 403

### Requirement: Eliminar dirección (soft delete)
El sistema SHALL exponer `DELETE /api/v1/direcciones/{id}` que marca la dirección como eliminada.

#### Scenario: Eliminación exitosa
- **WHEN** el dueño elimina una dirección no-principal
- **THEN** retorna 204 y la dirección tiene `deleted_at != NULL`

#### Scenario: No se puede eliminar la dirección principal
- **WHEN** se intenta eliminar una dirección con `es_principal = True`
- **THEN** retorna 422 con mensaje de error

#### Scenario: Dirección de otro usuario retorna 403
- **WHEN** un usuario no-ADMIN intenta eliminar una dirección ajena
- **THEN** retorna 403

### Requirement: Marcar dirección como principal
El sistema SHALL exponer `PATCH /api/v1/direcciones/{id}/principal` que establece una dirección como la principal del usuario.

#### Scenario: Cambio de principal exitoso
- **WHEN** el dueño llama `PATCH /{id}/principal`
- **THEN** retorna 200, la dirección indicada tiene `es_principal = True` y todas las demás del usuario tienen `es_principal = False`

#### Scenario: Solo una dirección puede ser principal por usuario
- **WHEN** se marca una nueva dirección como principal
- **THEN** la anterior principal del mismo usuario queda con `es_principal = False`

#### Scenario: Dirección de otro usuario retorna 403
- **WHEN** un usuario no-ADMIN intenta marcar como principal una dirección ajena
- **THEN** retorna 403
