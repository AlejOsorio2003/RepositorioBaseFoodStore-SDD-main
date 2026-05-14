## ADDED Requirements

### Requirement: Listar productos con filtros y paginación
El sistema SHALL exponer `GET /api/v1/productos` como endpoint público que devuelve una lista paginada de productos activos (sin soft delete). Acepta query params opcionales: `categoria_id` (integer), `disponible` (boolean), `search` (string — ILIKE sobre nombre y descripción), `page` (default 1), `size` (default 20, max 100).

#### Scenario: Listado sin filtros
- **WHEN** un cliente anónimo llama `GET /api/v1/productos`
- **THEN** el sistema retorna HTTP 200 con `{ items: [...], total: N, page: 1, size: 20 }` incluyendo solo productos con `deleted_at IS NULL`

#### Scenario: Filtro por categoría
- **WHEN** se llama `GET /api/v1/productos?categoria_id=3`
- **THEN** el sistema retorna solo productos asociados a la categoría con id=3 vía `ProductoCategoria`

#### Scenario: Filtro por disponibilidad
- **WHEN** se llama `GET /api/v1/productos?disponible=true`
- **THEN** el sistema retorna solo productos con `disponible = true`

#### Scenario: Búsqueda por texto
- **WHEN** se llama `GET /api/v1/productos?search=pizza`
- **THEN** el sistema retorna productos cuyo nombre o descripción contengan "pizza" (case-insensitive)

---

### Requirement: Obtener detalle de producto
El sistema SHALL exponer `GET /api/v1/productos/{id}` como endpoint público que devuelve el producto con sus categorías e ingredientes cargados eager. Retorna 404 si no existe o fue soft-deleted.

#### Scenario: Detalle existente
- **WHEN** se llama `GET /api/v1/productos/1`
- **THEN** el sistema retorna HTTP 200 con `ProductoDetail` que incluye listas `categorias` e `ingredientes`

#### Scenario: Producto no encontrado
- **WHEN** se llama `GET /api/v1/productos/9999`
- **THEN** el sistema retorna HTTP 404 con mensaje de error RFC 7807

---

### Requirement: Crear producto
El sistema SHALL exponer `POST /api/v1/productos` restringido a rol ADMIN. Recibe `ProductoCreate` con campos obligatorios `nombre`, `precio_base` y listas opcionales `categoria_ids` e `ingrediente_ids`. Genera `slug` único a partir del nombre. Retorna 409 si el slug ya existe.

#### Scenario: Creación exitosa
- **WHEN** un ADMIN envía `POST /api/v1/productos` con nombre, precio_base, y categoria_ids válidos
- **THEN** el sistema retorna HTTP 201 con `ProductoRead` incluyendo el id generado y el slug

#### Scenario: Slug duplicado
- **WHEN** un ADMIN intenta crear un producto con nombre idéntico a uno existente
- **THEN** el sistema retorna HTTP 409 indicando conflicto de slug

#### Scenario: Sin autenticación
- **WHEN** un cliente anónimo intenta `POST /api/v1/productos`
- **THEN** el sistema retorna HTTP 401

---

### Requirement: Actualizar producto
El sistema SHALL exponer `PUT /api/v1/productos/{id}` restringido a ADMIN. Recibe `ProductoUpdate` con todos los campos actualizables. Retorna 404 si no existe.

#### Scenario: Actualización exitosa
- **WHEN** un ADMIN envía `PUT /api/v1/productos/1` con campos modificados
- **THEN** el sistema retorna HTTP 200 con el producto actualizado

#### Scenario: Producto inexistente
- **WHEN** un ADMIN intenta actualizar un producto con id inexistente
- **THEN** el sistema retorna HTTP 404

---

### Requirement: Cambiar disponibilidad
El sistema SHALL exponer `PATCH /api/v1/productos/{id}/disponibilidad` con acceso para ADMIN y STOCK. Recibe `{ disponible: bool }`. El campo `disponible` es independiente de `stock_cantidad`.

#### Scenario: Toggle a false por gestor de stock
- **WHEN** un usuario con rol STOCK envía `PATCH /api/v1/productos/1/disponibilidad` con `{ disponible: false }`
- **THEN** el sistema retorna HTTP 200 con `disponible: false` en el producto

#### Scenario: Sin rol suficiente
- **WHEN** un usuario con rol CLIENT intenta el PATCH de disponibilidad
- **THEN** el sistema retorna HTTP 403

---

### Requirement: Eliminar producto (soft delete)
El sistema SHALL exponer `DELETE /api/v1/productos/{id}` restringido a ADMIN. Asigna `deleted_at = now()` sin borrar la fila. Retorna 204.

#### Scenario: Eliminación exitosa
- **WHEN** un ADMIN envía `DELETE /api/v1/productos/1`
- **THEN** el sistema retorna HTTP 204 y el producto desaparece del listado público

#### Scenario: Producto ya eliminado
- **WHEN** un ADMIN intenta eliminar un producto con `deleted_at` ya asignado
- **THEN** el sistema retorna HTTP 404

---

### Requirement: Listar ingredientes de un producto
El sistema SHALL exponer `GET /api/v1/productos/{id}/ingredientes` como endpoint público. Devuelve la lista de ingredientes asociados al producto con el campo `es_removible` del pivot.

#### Scenario: Ingredientes con alérgenos
- **WHEN** se llama `GET /api/v1/productos/1/ingredientes`
- **THEN** el sistema retorna HTTP 200 con lista `[{ id, nombre, es_alergeno, es_removible }]`

---

### Requirement: Asociar ingrediente a producto
El sistema SHALL exponer `POST /api/v1/productos/{id}/ingredientes` restringido a ADMIN. Recibe `{ ingrediente_id, es_removible }`. Retorna 409 si ya existe la asociación. Retorna 404 si el ingrediente no existe.

#### Scenario: Asociación exitosa
- **WHEN** un ADMIN envía `POST /api/v1/productos/1/ingredientes` con `{ ingrediente_id: 2, es_removible: true }`
- **THEN** el sistema retorna HTTP 201 con `ProductoIngredienteRead`

#### Scenario: Asociación duplicada
- **WHEN** el ingrediente ya está asociado al producto
- **THEN** el sistema retorna HTTP 409

---

### Requirement: Quitar ingrediente de producto
El sistema SHALL exponer `DELETE /api/v1/productos/{id}/ingredientes/{ing_id}` restringido a ADMIN. Elimina la fila del pivot (hard delete). Retorna 404 si la asociación no existe.

#### Scenario: Eliminación de asociación
- **WHEN** un ADMIN envía `DELETE /api/v1/productos/1/ingredientes/2`
- **THEN** el sistema retorna HTTP 204 y el ingrediente ya no aparece en el listado del producto

#### Scenario: Asociación inexistente
- **WHEN** el ingrediente no está asociado al producto
- **THEN** el sistema retorna HTTP 404
