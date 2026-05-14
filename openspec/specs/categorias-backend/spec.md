## Purpose
Gestión de categorías jerárquicas para el catálogo de productos. Expone un CRUD con soft delete y validación de árbol para prevenir referencias circulares.

## Requirements

### Requirement: Listar todas las categorías
El sistema SHALL retornar todas las categorías activas (deleted_at IS NULL) como lista plana con `parent_id` incluido. El cliente construye el árbol.

#### Scenario: Listado exitoso
- **WHEN** se hace GET /api/v1/categorias
- **THEN** retorna 200 con lista de categorías activas ordenadas por id

#### Scenario: Sin categorías
- **WHEN** no existen categorías activas
- **THEN** retorna 200 con lista vacía

### Requirement: Obtener categoría por ID
El sistema SHALL retornar el detalle de una categoría activa incluyendo sus hijos directos.

#### Scenario: Categoría existente
- **WHEN** se hace GET /api/v1/categorias/{id} con un id válido
- **THEN** retorna 200 con la categoría y su lista de hijos directos activos

#### Scenario: Categoría no encontrada
- **WHEN** se hace GET /api/v1/categorias/{id} con id inexistente o eliminado
- **THEN** retorna 404

### Requirement: Crear categoría (solo ADMIN)
El sistema SHALL permitir crear una categoría con nombre, slug único y parent_id opcional.

#### Scenario: Creación exitosa sin padre
- **WHEN** ADMIN hace POST /api/v1/categorias con nombre y slug únicos, sin parent_id
- **THEN** retorna 201 con la categoría creada

#### Scenario: Creación exitosa con padre
- **WHEN** ADMIN hace POST /api/v1/categorias con parent_id de categoría activa existente
- **THEN** retorna 201 con la categoría creada y parent_id asignado

#### Scenario: Slug duplicado
- **WHEN** ADMIN hace POST /api/v1/categorias con un slug ya existente
- **THEN** retorna 409

#### Scenario: Parent no existe
- **WHEN** ADMIN hace POST /api/v1/categorias con parent_id de categoría inexistente
- **THEN** retorna 404

#### Scenario: Sin autenticación o rol insuficiente
- **WHEN** un usuario no-ADMIN intenta crear una categoría
- **THEN** retorna 403

### Requirement: Actualizar categoría (solo ADMIN)
El sistema SHALL permitir actualizar nombre, slug y parent_id de una categoría. MUST prevenir referencias circulares.

#### Scenario: Actualización exitosa
- **WHEN** ADMIN hace PATCH /api/v1/categorias/{id} con campos válidos
- **THEN** retorna 200 con la categoría actualizada

#### Scenario: Referencia circular detectada
- **WHEN** ADMIN intenta asignar como parent_id un descendiente de la categoría
- **THEN** retorna 422 con mensaje de error descriptivo

#### Scenario: Slug duplicado en update
- **WHEN** ADMIN intenta actualizar slug a uno ya usado por otra categoría
- **THEN** retorna 409

### Requirement: Eliminar categoría con soft delete (solo ADMIN)
El sistema SHALL marcar la categoría como eliminada (deleted_at). MUST bloquear si tiene hijos activos o productos activos asociados.

#### Scenario: Eliminación exitosa
- **WHEN** ADMIN hace DELETE /api/v1/categorias/{id} de una categoría sin hijos activos ni productos activos
- **THEN** retorna 204 y la categoría no aparece en listados futuros

#### Scenario: Bloqueado por hijos activos
- **WHEN** ADMIN intenta eliminar una categoría con subcategorías activas
- **THEN** retorna 409 con mensaje indicando que tiene hijos activos

#### Scenario: Bloqueado por productos activos
- **WHEN** ADMIN intenta eliminar una categoría con productos activos asociados
- **THEN** retorna 409 con mensaje indicando que tiene productos activos asociados
