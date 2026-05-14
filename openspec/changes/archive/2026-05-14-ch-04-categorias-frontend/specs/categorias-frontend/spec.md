## ADDED Requirements

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
- **THEN** hace GET a `/api/v1/categorias/` y retorna `Categoria[]`

#### Scenario: Fetch categoría por id
- **WHEN** se llama `fetchCategoria(id: number)`
- **THEN** hace GET a `/api/v1/categorias/{id}` y retorna `CategoriaWithChildren`

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

### Requirement: Componente CategorySidebar
El sistema SHALL renderizar un sidebar con la jerarquía de categorías construida desde la lista plana.

#### Scenario: Renderiza categorías raíz
- **WHEN** existen categorías con `parent_id === null`
- **THEN** se listan como ítems de nivel 1 en el sidebar

#### Scenario: Renderiza subcategorías anidadas
- **WHEN** una categoría raíz tiene hijos en la lista plana
- **THEN** los hijos se muestran indentados bajo su padre

#### Scenario: Categoría activa destacada visualmente
- **WHEN** el query param `?categoria={id}` coincide con una categoría
- **THEN** ese ítem se renderiza con estilo activo (fondo o borde de color primario)

#### Scenario: Click en categoría actualiza URL
- **WHEN** el usuario hace click en una categoría del sidebar
- **THEN** se actualiza el query param `?categoria={id}` sin recargar la página

#### Scenario: Opción "Todas" limpia el filtro
- **WHEN** el usuario selecciona "Todas las categorías"
- **THEN** se elimina el query param `?categoria` de la URL

### Requirement: CatalogPage con navegación por categoría
El sistema SHALL reemplazar el placeholder de CatalogPage con una página que integra el sidebar de categorías.

#### Scenario: Layout con sidebar
- **WHEN** el usuario navega a `/` o `/catalog`
- **THEN** se renderiza CatalogPage con sidebar a la izquierda y área de contenido a la derecha

#### Scenario: Categoría seleccionada se muestra en el área de contenido
- **WHEN** hay un query param `?categoria={id}` válido
- **THEN** el área de contenido muestra el nombre de la categoría activa

#### Scenario: Sin categoría seleccionada muestra estado vacío
- **WHEN** no hay query param `?categoria`
- **THEN** el área de contenido muestra "Seleccioná una categoría" o mensaje equivalente

#### Scenario: Categoría inválida limpia el filtro
- **WHEN** `?categoria={id}` tiene un id que no existe en la lista
- **THEN** el sidebar elimina el param y muestra el estado sin selección
