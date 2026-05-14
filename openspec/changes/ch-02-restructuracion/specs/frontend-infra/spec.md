## MODIFIED Requirements

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

## ADDED Requirements

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

### Requirement: Barrels de capas FSD vacías
Los archivos `src/features/index.ts`, `src/entities/index.ts`, `src/shared/ui/index.ts` y `src/shared/lib/index.ts` SHALL existir con al menos un comentario de intención o un `export {}` para que TypeScript los reconozca como módulos válidos. Su contenido real se expande en CHs posteriores.

#### Scenario: Importación de features no falla
- **WHEN** se importa `from '@/features'` en un archivo TypeScript
- **THEN** el módulo resuelve sin error (aunque exporte vacío)

#### Scenario: tsc sin errores de módulo faltante
- **WHEN** se ejecuta `tsc --noEmit` en el frontend
- **THEN** no se reportan errores de tipo `Cannot find module '@/features'` ni similares
