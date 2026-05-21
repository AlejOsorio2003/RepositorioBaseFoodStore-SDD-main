## ADDED Requirements

### Requirement: Componente CategoryChips
El sistema SHALL proveer `CategoryChips` en `features/categoria-nav/ui/CategoryChips.tsx` como reemplazo de `CategorySidebar` para la navegación por categoría. Muestra todas las categorías (raíces y hojas) como chips horizontales scrollables, preservando el mismo mecanismo de query param `?categoria=`.

#### Scenario: Renderiza todas las categorías como chips
- **WHEN** la lista de categorías se carga correctamente
- **THEN** se renderiza un chip por cada categoría más un chip "Todas" al inicio

#### Scenario: Chip activo destacado visualmente
- **WHEN** el query param `?categoria={id}` coincide con una categoría
- **THEN** ese chip se renderiza con estilo activo (fondo color primario #721016, texto blanco)

#### Scenario: Click en chip actualiza URL
- **WHEN** el usuario hace click en un chip de categoría
- **THEN** se actualiza el query param `?categoria={id}` sin recargar la página

#### Scenario: Click en "Todas" limpia el filtro
- **WHEN** el usuario hace click en el chip "Todas"
- **THEN** se elimina el query param `?categoria` de la URL

#### Scenario: Estado de carga muestra placeholders
- **WHEN** los datos de categorías están cargando
- **THEN** se muestran chips skeleton animados en lugar de chips reales

#### Scenario: Chips son scrollables horizontalmente en pantallas pequeñas
- **WHEN** la cantidad de chips supera el ancho disponible
- **THEN** el contenedor permite scroll horizontal sin mostrar scrollbar visible

## MODIFIED Requirements

### Requirement: CatalogPage con navegación por categoría
El sistema SHALL integrar `CategoryChips` en `CatalogPage` en reemplazo del sidebar. El layout pasa de sidebar-izquierda + contenido-derecha a chips-arriba + contenido-full-width.

#### Scenario: Layout con chips sobre el contenido
- **WHEN** el usuario navega a `/`
- **THEN** se renderiza `CatalogPage` con `CategoryChips` horizontal sobre la barra de búsqueda, y `ProductoGrid` ocupa el ancho completo

#### Scenario: Categoría inválida limpia el filtro
- **WHEN** `?categoria={id}` tiene un id que no existe en la lista
- **THEN** el componente elimina el param y muestra el estado sin selección

## REMOVED Requirements

### Requirement: Componente CategorySidebar
**Reason:** Reemplazado por `CategoryChips` (layout horizontal, CH-16). La sidebar vertical no es idiomática para e-commerce.
**Migration:** Usar `CategoryChips` exportado desde `features/categoria-nav`. `CategorySidebar` se mantiene en el codebase pero no se usa en ninguna ruta activa.
