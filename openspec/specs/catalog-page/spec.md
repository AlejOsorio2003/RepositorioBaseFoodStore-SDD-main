## Purpose
Extensión de `CatalogPage` con grilla funcional de productos, barra de búsqueda con debounce, paginación persistida en URL, modal de detalle y página standalone de producto en `/productos/:id`. El layout es full-width con chips de categoría horizontales.

## Requirements

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

### Requirement: CatalogPage tiene barra de búsqueda con debounce
La `CatalogPage` SHALL incluir un campo de texto que filtra productos por nombre/descripción.

#### Scenario: Búsqueda actualiza query param con debounce
- **WHEN** el usuario escribe en el campo de búsqueda
- **THEN** después de 300ms sin escribir, se actualiza `?q=<texto>` en la URL y se dispara la query al backend

#### Scenario: Borrar búsqueda limpia el query param
- **WHEN** el usuario vacía el campo de búsqueda
- **THEN** el query param `?q` se elimina de la URL

#### Scenario: Cambiar categoría resetea la búsqueda y la página
- **WHEN** el usuario selecciona una nueva categoría
- **THEN** los params `?q` y `?page` se resetean

### Requirement: CatalogPage abre ProductoDetailModal al seleccionar un producto
La `CatalogPage` SHALL abrir el `ProductoDetailModal` al hacer click en una `ProductoCard`.

#### Scenario: Click en card abre modal con detalle
- **WHEN** el usuario hace click en una `ProductoCard`
- **THEN** se abre `ProductoDetailModal` con los datos del producto seleccionado

#### Scenario: Cerrar modal no pierde el estado del listado
- **WHEN** el usuario cierra el modal
- **THEN** el listado, la categoría activa, la búsqueda y la página se mantienen

### Requirement: ProductoDetailPage muestra detalle standalone
El sistema SHALL tener una ruta `/productos/:id` que renderiza el detalle de un producto en una página completa.

#### Scenario: Navegación directa a /productos/:id muestra el producto
- **WHEN** el usuario navega a `/productos/{id}`
- **THEN** se renderiza `ProductoDetailPage` con el detalle del producto correspondiente

#### Scenario: ID inválido muestra estado de error
- **WHEN** se navega a un `/productos/{id}` que no existe y el backend retorna 404
- **THEN** se muestra un mensaje "Producto no encontrado" con enlace al catálogo
