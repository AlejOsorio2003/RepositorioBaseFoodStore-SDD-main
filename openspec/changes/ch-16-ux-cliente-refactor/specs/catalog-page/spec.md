## MODIFIED Requirements

### Requirement: CatalogPage muestra grilla de productos
La `CatalogPage` SHALL renderizar `ProductoGrid` en el área de contenido con los productos filtrados por la categoría activa. El layout es full-width (sin sidebar lateral): los chips de categoría se muestran encima de la barra de búsqueda.

#### Scenario: Productos se filtran por chip de categoría seleccionado
- **WHEN** el usuario selecciona un chip de categoría
- **THEN** `ProductoGrid` muestra sólo productos de esa `categoria_id`

#### Scenario: Sin categoría seleccionada se muestran todos los productos
- **WHEN** no hay query param `?categoria`
- **THEN** `ProductoGrid` muestra todos los productos disponibles (sin filtro de categoría)

#### Scenario: Paginación persiste en URL
- **WHEN** el usuario navega a la página 2
- **THEN** la URL incluye `?page=2` y al recargar se mantiene esa página
