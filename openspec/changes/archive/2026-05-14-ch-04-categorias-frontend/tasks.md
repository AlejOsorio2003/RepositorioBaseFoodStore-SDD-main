## 1. Entity — tipos y API client (entities/categoria/)

- [x] 1.1 Crear `frontend/src/entities/categoria/types.ts` con tipos `Categoria` y `CategoriaWithChildren`
- [x] 1.2 Crear `frontend/src/entities/categoria/api.ts` con funciones `fetchCategorias()` y `fetchCategoria(id)`
- [x] 1.3 Crear `frontend/src/entities/categoria/index.ts` que re-exporta tipos y funciones de API

## 2. Feature — hooks TanStack Query (features/categoria-nav/)

- [x] 2.1 Crear `frontend/src/features/categoria-nav/hooks/useCategorias.ts` con `useCategorias()` usando `useQuery`
- [x] 2.2 Crear `frontend/src/features/categoria-nav/hooks/useCategoria.ts` con `useCategoria(id)` usando `useQuery`
- [x] 2.3 Crear `frontend/src/features/categoria-nav/hooks/index.ts` re-exportando los hooks

## 3. Feature — componente CategorySidebar

- [x] 3.1 Crear `frontend/src/features/categoria-nav/ui/CategorySidebar.tsx` que construye árbol desde lista plana (raíces con `parent_id === null` e hijos agrupados)
- [x] 3.2 Implementar opción "Todas las categorías" que limpia el query param `?categoria`
- [x] 3.3 Implementar click en ítem que actualiza `?categoria={id}` con `useSearchParams`
- [x] 3.4 Aplicar estilo activo (color primario) al ítem que coincide con el query param actual
- [x] 3.5 Manejar estado de carga (skeleton o spinner) mientras `useCategorias` carga
- [x] 3.6 Manejar estado de error con mensaje de fallback
- [x] 3.7 Crear `frontend/src/features/categoria-nav/ui/index.ts` re-exportando `CategorySidebar`
- [x] 3.8 Crear `frontend/src/features/categoria-nav/index.ts` re-exportando hooks y componentes

## 4. Page — CatalogPage

- [x] 4.1 Reemplazar el placeholder de `frontend/src/pages/CatalogPage.tsx` con layout de dos columnas (sidebar + contenido)
- [x] 4.2 Integrar `CategorySidebar` en la columna izquierda
- [x] 4.3 Leer `?categoria={id}` con `useSearchParams` y pasarlo al área de contenido
- [x] 4.4 Si hay categoría seleccionada: mostrar su nombre como título del área de contenido
- [x] 4.5 Si no hay categoría seleccionada: mostrar mensaje "Seleccioná una categoría para explorar el menú"
- [x] 4.6 Si el id del query param no existe en la lista: limpiar el param con `setSearchParams`

## 5. Verificación

- [x] 5.1 Navegar a `/catalog` y confirmar que el sidebar muestra las 7 categorías del seed organizadas jerárquicamente
- [x] 5.2 Hacer click en una categoría y confirmar que la URL cambia a `?categoria={id}` y el ítem se marca como activo
- [x] 5.3 Hacer click en "Todas" y confirmar que el query param desaparece
- [x] 5.4 Navegar directamente a `/catalog?categoria=1` y confirmar que la categoría correcta aparece activa
- [x] 5.5 Navegar a `/catalog?categoria=9999` y confirmar que el param se limpia automáticamente
