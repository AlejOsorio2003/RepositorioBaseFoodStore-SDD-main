## ADDED Requirements

### Requirement: Listar ingredientes
El sistema SHALL exponer `GET /api/v1/ingredientes` de acceso público (sin autenticación). SHALL soportar parámetros de query `skip` (default 0) y `limit` (default 100). SHALL retornar `200 OK` con lista de `IngredienteRead`.

#### Scenario: Listado vacío
- **WHEN** no existen ingredientes en la BD
- **THEN** el endpoint retorna `200 OK` con lista vacía `[]`

#### Scenario: Listado con ingredientes
- **WHEN** existen ingredientes en la BD
- **THEN** el endpoint retorna `200 OK` con lista de objetos `IngredienteRead` con campos `id`, `nombre`, `es_alergeno`, `created_at`

#### Scenario: Filtrado por alérgeno
- **WHEN** se consulta `GET /api/v1/ingredientes?solo_alergenos=true`
- **THEN** el sistema retorna únicamente ingredientes con `es_alergeno = true`

---

### Requirement: Obtener ingrediente por ID
El sistema SHALL exponer `GET /api/v1/ingredientes/{id}` de acceso público. SHALL retornar `200 OK` con `IngredienteRead` si existe. SHALL retornar `404 Not Found` si no existe.

#### Scenario: Ingrediente existente
- **WHEN** se consulta `GET /api/v1/ingredientes/1` y existe el ingrediente con `id=1`
- **THEN** el sistema retorna `200 OK` con el `IngredienteRead` correspondiente

#### Scenario: Ingrediente inexistente
- **WHEN** se consulta `GET /api/v1/ingredientes/9999` y no existe ese ID
- **THEN** el sistema retorna `404 Not Found` con detalle de error RFC 7807

---

### Requirement: Crear ingrediente
El sistema SHALL exponer `POST /api/v1/ingredientes` restringido a rol `ADMIN`. SHALL aceptar body `IngredienteCreate` con `nombre` (str, max 100) y `es_alergeno` (bool, default false). SHALL retornar `201 Created` con `IngredienteRead`. SHALL retornar `409 Conflict` si ya existe un ingrediente con el mismo `nombre`.

#### Scenario: Creación exitosa
- **WHEN** un usuario ADMIN envía `POST /api/v1/ingredientes` con `{"nombre": "Gluten", "es_alergeno": true}`
- **THEN** el sistema persiste el ingrediente y retorna `201 Created` con `IngredienteRead` incluyendo `id` asignado

#### Scenario: Nombre duplicado
- **WHEN** un usuario ADMIN intenta crear un ingrediente con un `nombre` que ya existe
- **THEN** el sistema retorna `409 Conflict` sin crear el registro

#### Scenario: Acceso no autorizado
- **WHEN** un usuario sin rol ADMIN intenta crear un ingrediente
- **THEN** el sistema retorna `403 Forbidden`

---

### Requirement: Actualizar ingrediente
El sistema SHALL exponer `PATCH /api/v1/ingredientes/{id}` restringido a rol `ADMIN`. SHALL aceptar body `IngredienteUpdate` con campos opcionales `nombre` y `es_alergeno`. SHALL retornar `200 OK` con `IngredienteRead` actualizado. SHALL retornar `404` si no existe. SHALL retornar `409` si el nuevo `nombre` ya pertenece a otro ingrediente.

#### Scenario: Actualización exitosa
- **WHEN** un usuario ADMIN envía `PATCH /api/v1/ingredientes/1` con `{"es_alergeno": true}`
- **THEN** el sistema actualiza el campo y retorna `200 OK` con `IngredienteRead`

#### Scenario: Conflicto de nombre en update
- **WHEN** un usuario ADMIN cambia el nombre a uno que ya usa otro ingrediente
- **THEN** el sistema retorna `409 Conflict` sin modificar el registro

---

### Requirement: Eliminar ingrediente
El sistema SHALL exponer `DELETE /api/v1/ingredientes/{id}` restringido a rol `ADMIN`. SHALL realizar hard delete (sin soft delete, `Ingrediente` no tiene `deleted_at`). SHALL retornar `204 No Content` si la eliminación es exitosa. SHALL retornar `404` si no existe. SHALL retornar `409 Conflict` si el ingrediente tiene productos asociados en `producto_ingredientes`.

#### Scenario: Eliminación exitosa
- **WHEN** un usuario ADMIN elimina un ingrediente sin productos asociados
- **THEN** el sistema elimina el registro y retorna `204 No Content`

#### Scenario: Eliminación bloqueada por productos asociados
- **WHEN** un usuario ADMIN intenta eliminar un ingrediente que está asociado a uno o más productos
- **THEN** el sistema retorna `409 Conflict` con mensaje indicando que hay productos asociados

---

### Requirement: Schemas Pydantic de Ingrediente
El sistema SHALL definir schemas separados para cada operación. `IngredienteCreate` SHALL tener `nombre: str` (max_length=100) y `es_alergeno: bool` (default=False). `IngredienteUpdate` SHALL tener ambos campos opcionales (`Optional`). `IngredienteRead` SHALL exponer `id`, `nombre`, `es_alergeno`, `created_at`. `ProductoIngredienteRead` SHALL exponer `producto_id`, `ingrediente_id`, `es_removible`.

#### Scenario: Validación de nombre vacío
- **WHEN** se envía `IngredienteCreate` con `nombre = ""`
- **THEN** Pydantic retorna `422 Unprocessable Entity`

#### Scenario: Validación de nombre demasiado largo
- **WHEN** se envía `IngredienteCreate` con `nombre` de más de 100 caracteres
- **THEN** Pydantic retorna `422 Unprocessable Entity`

---

### Requirement: UoW tipado con IngredienteRepository
El `UnitOfWork` SHALL exponer `self.ingredientes` tipado como `IngredienteRepository` (no `BaseRepository[Ingrediente]`). `IngredienteRepository` SHALL implementar `get_by_nombre(nombre: str) -> Ingrediente | None` y `list_alergenos() -> list[Ingrediente]`.

#### Scenario: get_by_nombre retorna None para nombre inexistente
- **WHEN** se llama `uow.ingredientes.get_by_nombre("Inexistente")` y no existe ese nombre
- **THEN** el método retorna `None`

#### Scenario: list_alergenos filtra correctamente
- **WHEN** se llama `uow.ingredientes.list_alergenos()` con ingredientes mixtos en BD
- **THEN** retorna únicamente los que tienen `es_alergeno = true`

---

## ADDED Requirements

### Requirement: Relación inversa Ingrediente → Productos
El sistema SHALL permitir que la entidad `Ingrediente` sea recuperada a través de la relación `ProductoIngrediente` al listar ingredientes de un producto. No se agrega ningún endpoint nuevo en `/ingredientes`; el cambio es que el modelo `ProductoIngrediente` ahora se usa en la capa de repository de productos para construir el detalle.

#### Scenario: Ingrediente visible en detalle de producto
- **WHEN** se consulta `GET /api/v1/productos/{id}/ingredientes`
- **THEN** el sistema retorna los ingredientes con datos de `Ingrediente` (`id`, `nombre`, `es_alergeno`) combinados con el campo `es_removible` del pivot `ProductoIngrediente`

#### Scenario: Ingrediente existente requerido para asociación
- **WHEN** `POST /api/v1/productos/{id}/ingredientes` recibe un `ingrediente_id` inválido
- **THEN** el sistema retorna HTTP 404 con mensaje indicando que el ingrediente no existe
