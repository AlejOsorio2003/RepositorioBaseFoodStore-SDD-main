## Why

El backend de categorías (CH-03) está completo y verificado, pero `CatalogPage` es un placeholder vacío de 4 líneas. Los usuarios no pueden explorar el catálogo por categoría; la navegación jerárquica es el punto de entrada principal al catálogo de productos.

## What Changes

- Crear `entities/categoria/` con tipos TypeScript (`Categoria`, `CategoriaWithChildren`) y funciones de API que consumen `GET /api/v1/categorias` y `GET /api/v1/categorias/{id}`.
- Crear `features/categoria-nav/` con hooks TanStack Query (`useCategorias`, `useCategoria`) y el componente `CategorySidebar` para navegación lateral.
- Implementar `CatalogPage` con sidebar de categorías, filtro por categoría activa y estado de carga/error.
- Agregar query param `?categoria={id}` en la URL para que la categoría seleccionada sea linkeable y persistente en navegación.

## Capabilities

### New Capabilities
- `categorias-frontend`: Navegación y filtrado del catálogo por categoría jerárquica — entity types, API client, TanStack Query hooks, componente sidebar, integración en CatalogPage.

### Modified Capabilities
<!-- ninguna -->

## Impact

- `frontend/src/entities/categoria/` — nuevo módulo de entidad
- `frontend/src/features/categoria-nav/` — nueva feature
- `frontend/src/pages/CatalogPage.tsx` — reemplazo del placeholder
- Sin cambios en backend, stores Zustand, ni otras páginas
