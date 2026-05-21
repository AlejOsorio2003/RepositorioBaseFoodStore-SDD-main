## Purpose
Navegación y filtrado del catálogo por categoría jerárquica. Define los tipos de dominio, funciones de API, hooks TanStack Query, componentes CategoryChips (reemplazo de CategorySidebar) y la integración en CatalogPage con selección persistida en URL mediante query param `?categoria=`.

## Requirements

### Requirement: Tipos de dominio de Categoria
El sistema SHALL definir los tipos TypeScript `Categoria` y `CategoriaWithChildren` en `entities/categoria/` alineados con los schemas del backend.

#### Scenario: Tipo Categoria refleja CategoriaRead del backend
- **WHEN** se define el tipo `Categoria`
- **THEN** tiene campos: `id: number`, `nombre: string`, `slug: string`, `parent_id: number | null`, `created_at: string`

#### Scenario: Tipo CategoriaWithChildren extiende Categoria
- **WHEN** se define el tipo `CategoriaWithChildren`
- **THEN** extiende `Categoria` añadiendo `hijos: Categoria[]`

### Requirement: Funciones de API para categorías
El sistema SHALL exponer funciones para consumir los endpoints de categorías desde `entities/categoria/api.ts`.

#### Scenario: Fetch lista de categorías
- **WHEN** se llama `fetchCategorias()`
- **THEN** hace GET a `/categorias/` (relativo al baseURL `/api/v1`) y retorna `Categoria[]`

#### Scenario: Fetch categoría por id
- **WHEN** se llama `fetchCategoria(id: number)`
- **THEN** hace GET a `/categorias/{id}` y retorna `CategoriaWithChildren`

### Requirement: Hook useCategorias con TanStack Query
El sistema SHALL proveer `useCategorias()` en `features/categoria-nav/` que cachea la lista de categorías activas.

#### Scenario: Carga exitosa
- **WHEN** el componente monta y hay conexión
- **THEN** `useCategorias()` retorna `{ data: Categoria[], isLoading: false, isError: false }`

#### Scenario: Estado de carga
- **WHEN** el request está en vuelo
- **THEN** `useCategorias()` retorna `{ isLoading: true }`

#### Scenario: Estado de error
- **WHEN** el servidor retorna error
- **THEN** `useCategorias()` retorna `{ isError: true }`

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

### Requirement: CatalogPage con navegación por categoría
El sistema SHALL integrar `CategoryChips` en `CatalogPage` en reemplazo del sidebar. El layout pasa de sidebar-izquierda + contenido-derecha a chips-arriba + contenido-full-width.

#### Scenario: Layout con chips sobre el contenido
- **WHEN** el usuario navega a `/`
- **THEN** se renderiza `CatalogPage` con `CategoryChips` horizontal sobre la barra de búsqueda, y `ProductoGrid` ocupa el ancho completo

#### Scenario: Categoría inválida limpia el filtro
- **WHEN** `?categoria={id}` tiene un id que no existe en la lista
- **THEN** el componente elimina el param y muestra el estado sin selección

### Requirement: CategorySidebar (DEPRECATED — reemplazado por CategoryChips)
**Reason:** Reemplazado por `CategoryChips` (layout horizontal, CH-16). La sidebar vertical no es idiomática para e-commerce.
**Migration:** Usar `CategoryChips` exportado desde `features/categoria-nav`. `CategorySidebar` se mantiene en el codebase pero no se usa en ninguna ruta activa.

#### Scenario: (Histórico) Renderiza categorías raíz
- **WHEN** existían categorías con `parent_id === null`
- **THEN** se listaban como ítems de nivel 1 en el sidebar

#### Scenario: (Histórico) Renderiza subcategorías anidadas
- **WHEN** una categoría raíz tenía hijos en la lista plana
- **THEN** los hijos se mostraban indentados bajo su padre

### Requirement: CategoryChips integra con listado de productos
La `CategoryChips` SHALL comunicar la categoría seleccionada a `CatalogPage` de modo que el listado de productos se filtre en consecuencia. Esta integración se logra a través del query param `?categoria={id}` ya existente.

#### Scenario: Seleccionar chip filtra los productos
- **WHEN** el usuario hace click en un chip de categoría
- **THEN** el query param `?categoria={id}` se actualiza Y `ProductoGrid` re-ejecuta la query con ese `categoria_id`

#### Scenario: Seleccionar "Todas" muestra todos los productos
- **WHEN** el usuario hace click en "Todas"
- **THEN** el param `?categoria` se elimina Y `ProductoGrid` re-ejecuta sin filtro de categoría

#### Scenario: Cambiar categoría resetea la página y la búsqueda
- **WHEN** el usuario cambia la categoría activa
- **THEN** los params `?page` y `?q` se resetean para evitar páginas o búsquedas inconsistentes con la nueva categoría
