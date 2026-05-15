## ADDED Requirements

### Requirement: Tipos TypeScript de producto definidos en entity
El sistema SHALL exponer los tipos `Producto`, `ProductoDetail`, `PaginatedProductos` e `IngredienteEnProducto` en `entities/producto/types.ts`.

#### Scenario: Tipo Producto tiene campos mínimos
- **WHEN** se usa el tipo `Producto` en cualquier feature
- **THEN** incluye `id`, `nombre`, `slug`, `descripcion`, `precio_base`, `stock_cantidad`, `disponible`, `imagen_url` y `created_at`

#### Scenario: Tipo ProductoDetail extiende Producto
- **WHEN** se usa el tipo `ProductoDetail`
- **THEN** incluye todos los campos de `Producto` más `categorias: CategoriaEnProducto[]` e `ingredientes: IngredienteEnProducto[]`

#### Scenario: Tipo PaginatedProductos tiene estructura de paginación
- **WHEN** se usa el tipo `PaginatedProductos`
- **THEN** incluye `items: Producto[]`, `total: number`, `page: number`, `size: number`

### Requirement: Funciones API de producto en entity
El sistema SHALL exponer funciones `fetchProductos(params)` y `fetchProducto(id)` en `entities/producto/api.ts` que consumen los endpoints de CH-05.

#### Scenario: fetchProductos acepta filtros opcionales
- **WHEN** se llama `fetchProductos({ page, size, categoria_id, search, disponible })`
- **THEN** realiza `GET /api/v1/productos` con los query params correspondientes y retorna `PaginatedProductos`

#### Scenario: fetchProducto retorna detalle completo
- **WHEN** se llama `fetchProducto(id)`
- **THEN** realiza `GET /api/v1/productos/{id}` y retorna `ProductoDetail`

### Requirement: Hooks TanStack Query para productos
El sistema SHALL exponer `useProductos(params)` y `useProducto(id)` en `features/producto-list/hooks/`.

#### Scenario: useProductos cachea por combinación de filtros
- **WHEN** se llama `useProductos` con distintos valores de `page`, `categoria_id` o `search`
- **THEN** cada combinación genera un `queryKey` independiente y se cachea por separado

#### Scenario: useProducto no ejecuta con id nulo
- **WHEN** `useProducto` se llama con `id = null` o `id = undefined`
- **THEN** la query NO se ejecuta (`enabled: false`)

#### Scenario: useProductos filtra solo productos disponibles por defecto
- **WHEN** se llama `useProductos` sin pasar `disponible`
- **THEN** se incluye `disponible=true` en la request al backend

### Requirement: Componente ProductoCard
El sistema SHALL exponer un componente `ProductoCard` en `features/producto-list/ui/` que muestra los datos de un producto.

#### Scenario: ProductoCard muestra imagen con fallback
- **WHEN** `imagen_url` es null o la imagen falla al cargar
- **THEN** se muestra un placeholder de color sólido con las iniciales del nombre

#### Scenario: ProductoCard muestra precio formateado
- **WHEN** se renderiza `ProductoCard`
- **THEN** `precio_base` se muestra como moneda (ej: `$1.200,00`)

#### Scenario: ProductoCard dispara onSelect al hacer click
- **WHEN** el usuario hace click en la card o en el botón "Ver detalle"
- **THEN** se llama la prop `onSelect(producto)` recibida por el componente

### Requirement: Componente ProductoGrid
El sistema SHALL exponer un componente `ProductoGrid` en `features/producto-list/ui/` que renderiza una grilla paginada de `ProductoCard`.

#### Scenario: ProductoGrid muestra estado de carga
- **WHEN** la query está en estado `isLoading`
- **THEN** se muestran skeletons o spinners en lugar de las cards

#### Scenario: ProductoGrid muestra estado vacío
- **WHEN** la query retorna `items: []`
- **THEN** se muestra un mensaje "No se encontraron productos"

#### Scenario: ProductoGrid muestra controles de paginación
- **WHEN** `total > size`
- **THEN** se muestran botones de página anterior y siguiente

### Requirement: Componente ProductoDetailModal
El sistema SHALL exponer un componente `ProductoDetailModal` en `features/producto-detail/ui/` que muestra el detalle completo de un producto en un overlay.

#### Scenario: ProductoDetailModal muestra ingredientes y alérgenos
- **WHEN** el modal está abierto para un producto con ingredientes
- **THEN** lista cada ingrediente indicando visualmente si es alérgeno (`es_alergeno: true`)

#### Scenario: ProductoDetailModal se cierra al hacer click fuera o en botón cerrar
- **WHEN** el usuario hace click fuera del modal o en el botón de cierre
- **THEN** el modal se cierra y se llama la prop `onClose`
