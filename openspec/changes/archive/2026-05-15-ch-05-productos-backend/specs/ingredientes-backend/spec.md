## ADDED Requirements

### Requirement: Relación inversa Ingrediente → Productos
El sistema SHALL permitir que la entidad `Ingrediente` sea recuperada a través de la relación `ProductoIngrediente` al listar ingredientes de un producto. No se agrega ningún endpoint nuevo en `/ingredientes`; el cambio es que el modelo `ProductoIngrediente` ahora se usa en la capa de repository de productos para construir el detalle.

#### Scenario: Ingrediente visible en detalle de producto
- **WHEN** se consulta `GET /api/v1/productos/{id}/ingredientes`
- **THEN** el sistema retorna los ingredientes con datos de `Ingrediente` (`id`, `nombre`, `es_alergeno`) combinados con el campo `es_removible` del pivot `ProductoIngrediente`

#### Scenario: Ingrediente existente requerido para asociación
- **WHEN** `POST /api/v1/productos/{id}/ingredientes` recibe un `ingrediente_id` inválido
- **THEN** el sistema retorna HTTP 404 con mensaje indicando que el ingrediente no existe
