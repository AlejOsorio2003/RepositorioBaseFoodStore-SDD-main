## ADDED Requirements

### Requirement: Proyecto React+Vite+TypeScript ejecutable
El proyecto frontend SHALL arrancar con `npm run dev` sin errores en `http://localhost:5173`. TypeScript SHALL estar en modo strict (`"strict": true` en `tsconfig.json`). La variable de entorno `VITE_API_URL` SHALL ser requerida y tipada en `src/env.d.ts`.

#### Scenario: Arranque del servidor de desarrollo
- **WHEN** se ejecuta `npm run dev` con `.env` que contiene `VITE_API_URL=http://localhost:8000`
- **THEN** Vite inicia en `http://localhost:5173` y el browser muestra la shell de la aplicación sin errores de consola

#### Scenario: Variable de entorno faltante
- **WHEN** `VITE_API_URL` no está definida en `.env`
- **THEN** TypeScript detecta el uso de `import.meta.env.VITE_API_URL` como posiblemente undefined y el tipo en `env.d.ts` lo marca como `string` (no `string | undefined`) para forzar la presencia

---

### Requirement: Estructura Feature-Sliced Design
El directorio `src/` SHALL organizarse en las capas FSD: `app/`, `pages/`, `features/`, `entities/`, `shared/`. El directorio `widgets/` NO SHALL existir en `src/` — no forma parte de FSD. Cada capa SHALL tener un `index.ts` de barril. No SHALL existir imports cross-feature (una feature no puede importar directamente de otra feature).

#### Scenario: Barril de capa shared
- **WHEN** se importa `from '@/shared/api'`
- **THEN** el path alias `@` apunta a `src/` y el módulo se resuelve correctamente

#### Scenario: Sin imports circulares
- **WHEN** se ejecuta `tsc --noEmit`
- **THEN** no se reportan errores de imports circulares ni violaciones de capas FSD

#### Scenario: widgets no existe
- **WHEN** se lista el contenido de `frontend/src/`
- **THEN** no existe ningún directorio llamado `widgets/`

---

### Requirement: Tipos base de dominio en shared/types
El archivo `src/shared/types/index.ts` SHALL exportar los tipos utilitarios base reutilizables en toda la aplicación: `UUID` (alias de `string`), `ISODateString` (alias de `string`), `PaginatedResponse<T>` (con campos `items: T[]`, `total: number`, `page: number`, `size: number`), y `ApiError` (con campos `type: string`, `title: string`, `status: number`, `detail: string`, `instance: string`). Estos tipos corresponden al contrato RFC 7807 del backend.

#### Scenario: Importación de UUID
- **WHEN** se importa `import type { UUID } from '@/shared/types'`
- **THEN** TypeScript resuelve `UUID` como alias de `string` sin errores

#### Scenario: PaginatedResponse tipado
- **WHEN** se usa `PaginatedResponse<Product>` en un componente
- **THEN** TypeScript infiere correctamente los campos `items: Product[]`, `total: number`, etc.

#### Scenario: ApiError usable en catch
- **WHEN** se importa `ApiError` y se usa para tipar el error de una query de TanStack Query
- **THEN** el type checker acepta la asignación sin errores

---

### Requirement: Tailwind CSS configurado
Tailwind CSS 3 SHALL estar configurado con `content` apuntando a `./src/**/*.{ts,tsx}`. El archivo `src/app/styles/globals.css` SHALL incluir las directivas `@tailwind base/components/utilities`. El tema SHALL extender los colores del design system del proyecto.

#### Scenario: Clase Tailwind aplicada
- **WHEN** un componente usa la clase `bg-primary text-white`
- **THEN** el color corresponde al definido en `tailwind.config.ts` y se renderiza correctamente en el browser

---

### Requirement: Instancia Axios con interceptores
El módulo `src/shared/api/axios.ts` SHALL exportar una instancia Axios con `baseURL` igual a `import.meta.env.VITE_API_URL`. SHALL incluir un interceptor de request que lea el `accessToken` de `authStore` (si existe) y agregue el header `Authorization: Bearer <token>`. SHALL incluir un interceptor de response que detecte status 401 y ejecute el flujo de refresh (placeholder que rechaza el request en este change; se implementa en CH-01).

#### Scenario: Header de autorización inyectado
- **WHEN** `authStore.accessToken` tiene un valor y se realiza cualquier request con la instancia
- **THEN** el header `Authorization: Bearer <token>` está presente en el request HTTP saliente

#### Scenario: Request sin token autenticado
- **WHEN** `authStore.accessToken` es null o undefined
- **THEN** el header `Authorization` no se agrega al request

#### Scenario: Interceptor de 401
- **WHEN** el servidor responde con status 401
- **THEN** el interceptor de response captura el error y lo rechaza con un error tipado (el refresh real se implementa en CH-01)

---

### Requirement: Stores Zustand con persist
El directorio `src/shared/store/` SHALL exportar 4 stores Zustand:
- `authStore`: estado `{ accessToken, user }`, persist con key `auth`, almacena solo `accessToken`.
- `cartStore`: estado `{ items, addItem, removeItem, clearCart }`, persist con key `cart`, almacena `items` completo.
- `paymentStore`: estado `{ status, preferenceId }`, sin persist (estado volátil).
- `uiStore`: estado `{ theme }`, persist con key `ui`, almacena `theme`.

#### Scenario: Persistencia de accessToken
- **WHEN** se asigna un valor a `authStore.accessToken` y se recarga el browser
- **THEN** `authStore.accessToken` mantiene el valor después del reload

#### Scenario: paymentStore no persiste
- **WHEN** se asigna un valor a `paymentStore.status` y se recarga el browser
- **THEN** `paymentStore.status` es `null` o el valor inicial después del reload

#### Scenario: cartStore persiste items
- **WHEN** se agrega un item con `cartStore.addItem(item)` y se recarga el browser
- **THEN** el item sigue en `cartStore.items` después del reload

---

### Requirement: Shell de rutas con React Router
El archivo `src/app/router.tsx` SHALL definir las rutas shell del sistema usando `react-router-dom`. Las rutas declaradas SHALL incluir las páginas principales previstas (`/`, `/login`, `/register`, `/catalog`, `/cart`, `/checkout`, `/orders`, `/admin`). Las páginas que aún no existen SHALL renderizar un placeholder `<div>` con el nombre de la ruta.

#### Scenario: Navegación a ruta existente
- **WHEN** el usuario navega a `/login`
- **THEN** el componente de la ruta `/login` se renderiza sin errores (aunque sea un placeholder)

#### Scenario: Ruta no encontrada
- **WHEN** el usuario navega a una ruta no definida en el router
- **THEN** se renderiza un componente 404 con mensaje "Página no encontrada"

---

### Requirement: TanStack Query configurado
El `QueryClient` de TanStack Query v5 SHALL estar configurado en `src/app/providers.tsx` con `staleTime: 1000 * 60` (1 minuto) y `retry: 1`. El provider SHALL envolver toda la aplicación.

#### Scenario: QueryClient disponible globalmente
- **WHEN** cualquier componente dentro del árbol de la aplicación llama `useQueryClient()`
- **THEN** retorna el `QueryClient` configurado sin error de contexto faltante

---

### Requirement: Barrels de capas FSD vacías
Los archivos `src/features/index.ts`, `src/entities/index.ts`, `src/shared/ui/index.ts` y `src/shared/lib/index.ts` SHALL existir con al menos un comentario de intención o un `export {}` para que TypeScript los reconozca como módulos válidos. Su contenido real se expande en CHs posteriores.

#### Scenario: Importación de features no falla
- **WHEN** se importa `from '@/features'` en un archivo TypeScript
- **THEN** el módulo resuelve sin error (aunque exporte vacío)

#### Scenario: tsc sin errores de módulo faltante
- **WHEN** se ejecuta `tsc --noEmit` en el frontend
- **THEN** no se reportan errores de tipo `Cannot find module '@/features'` ni similares
