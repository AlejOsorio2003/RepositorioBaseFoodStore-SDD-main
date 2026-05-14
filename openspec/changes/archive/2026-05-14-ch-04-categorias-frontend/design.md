## Context

El frontend sigue Feature-Sliced Design. Las capas `entities/` y `features/` están vacías; este change inaugura ambas. El cliente HTTP (`shared/api/axios.ts`) ya maneja JWT automáticamente. TanStack Query está configurado con `staleTime: 60_000`. La API de categorías expone `GET /api/v1/categorias/` (lista plana con `parent_id`) y `GET /api/v1/categorias/{id}` (con hijos directos).

## Goals / Non-Goals

**Goals:**
- Definir los tipos TypeScript de `Categoria` y `CategoriaWithChildren` en `entities/categoria/`.
- Exponer funciones de API y hooks TanStack Query (`useCategorias`, `useCategoria`) en `features/categoria-nav/`.
- Implementar `CatalogPage` con sidebar de navegación por categoría y filtro por query param `?categoria={id}`.
- Persistir la categoría seleccionada en la URL para que sea linkeable.

**Non-Goals:**
- CRUD de categorías desde el frontend (es responsabilidad de CH-15 Admin Dashboard).
- Paginación o búsqueda de categorías.
- Implementar listado de productos dentro de CatalogPage (eso va en CH-06).
- Ninguna modificación al backend.

## Decisions

### D1 — Tipos en `entities/categoria/`, hooks en `features/categoria-nav/`

FSD prohíbe que `features/` importe de otras `features/`. Separar tipos (entity) de hooks + UI (feature) permite que futuras features (e.g., `producto-card`) importen los tipos sin depender de la feature de navegación.

**Alternativa descartada:** poner todo en `features/categoria-nav/` — viola FSD cuando otra feature necesite el tipo `Categoria`.

### D2 — Selección de categoría por query param `?categoria={id}`

`useSearchParams` de React Router lee y escribe el param sin estado adicional. La URL se vuelve la fuente de verdad: recarga, compartir link, historial del browser funcionan sin lógica extra.

**Alternativa descartada:** Zustand store para categoría seleccionada — duplica estado del servidor y no persiste en la URL.

### D3 — `GET /categorias/` retorna lista plana; el árbol se construye en cliente

El backend ya decidió esto (CH-03). El hook `useCategorias` expone la lista plana; `CategorySidebar` agrupa las raíces (parent_id === null) y muestra sus hijos directos consultando `parent_id` dentro de la misma lista.

**Alternativa considerada:** llamar `GET /categorias/{id}` por cada nodo para obtener hijos — genera N+1 requests innecesarios cuando la lista plana ya tiene todo.

### D4 — Sin cache invalidation manual

Las categorías cambian raramente. `staleTime: 60_000` heredado del QueryClient es suficiente. No se necesita `invalidateQueries` ni estado de mutación en esta feature.

## Risks / Trade-offs

- [Lista plana grande] Si el árbol de categorías crece mucho, construir el árbol en cliente puede ser lento → Mitigation: aceptable para el alcance actual; si escala se puede agregar endpoint de árbol en backend.
- [Query param inválido] Si `?categoria=abc` llega con un id que no existe, `useCategoria(id)` retorna 404 → Mitigation: el sidebar limpia el param si la categoría no se encuentra.
- [CatalogPage sin productos] El filtro existe pero el listado de productos es un placeholder hasta CH-06 → Mitigation: documentar en el componente; CatalogPage muestra la categoría activa y un mensaje "productos próximamente".
