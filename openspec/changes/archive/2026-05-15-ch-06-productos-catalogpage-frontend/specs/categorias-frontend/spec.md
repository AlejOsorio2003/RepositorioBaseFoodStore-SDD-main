## MODIFIED Requirements

### Requirement: CategorySidebar integra con listado de productos
La `CategorySidebar` SHALL comunicar la categoría seleccionada a `CatalogPage` de modo que el listado de productos se filtre en consecuencia. Esta integración se logra a través del query param `?categoria={id}` ya existente — no hay cambios en el componente `CategorySidebar` en sí.

#### Scenario: Seleccionar categoría filtra los productos
- **WHEN** el usuario hace click en una categoría en el sidebar
- **THEN** el query param `?categoria={id}` se actualiza Y `ProductoGrid` re-ejecuta la query con ese `categoria_id`

#### Scenario: Seleccionar "Todas" muestra todos los productos
- **WHEN** el usuario hace click en "Todas las categorías"
- **THEN** el param `?categoria` se elimina Y `ProductoGrid` re-ejecuta sin filtro de categoría

#### Scenario: Cambiar categoría resetea la página y la búsqueda
- **WHEN** el usuario cambia la categoría activa
- **THEN** los params `?page` y `?q` se resetean para evitar páginas o búsquedas inconsistentes con la nueva categoría
