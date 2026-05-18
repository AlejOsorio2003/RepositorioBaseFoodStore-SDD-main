## Why

El backend admin (CH-14) ya expone métricas, actualización de stock y los módulos de pedidos/usuarios/productos están completos. La ruta `/admin` del frontend es un shell vacío — ningún rol administrativo (ADMIN, STOCK, PEDIDOS) puede operar el sistema desde la interfaz. Este change cierra esa brecha entregando el panel completo.

## What Changes

- **AdminLayout** con sidebar de navegación condicional por rol (ADMIN ve todo, STOCK ve catálogo/stock, PEDIDOS ve pedidos)
- **Rutas anidadas** `/admin/*` con `ProtectedRoute` para roles `ADMIN | STOCK | PEDIDOS`
- **AdminDashboardPage** — KPI cards + 3 gráficos recharts (LineChart ventas, BarChart top productos, PieChart pedidos por estado) — solo ADMIN
- **AdminPedidosPage** — tabla paginada de pedidos, panel de detalle, botón "Avanzar estado" (FSM), historial — ADMIN + PEDIDOS
- **AdminProductosPage** — tabla + modal crear/editar producto, toggle disponibilidad, soft delete — solo ADMIN
- **AdminStockPage** — tabla de productos con campo stock editable inline, PATCH `/admin/productos/{id}/stock` — ADMIN + STOCK
- **AdminUsuariosPage** — tabla de usuarios, toggle activo/inactivo, cambio de rol — solo ADMIN
- **feature/admin** — hooks TanStack Query, componentes de UI del panel (tabla, modales, formularios)
- **entities/admin** — tipos `MetricasRead`, `TopProductoRead` y función `getMetricas()`
- Primera integración de **recharts** en el proyecto

## Capabilities

### New Capabilities

- `admin-frontend`: Panel administrativo completo — dashboard de métricas con recharts, gestión de pedidos con FSM, CRUD catálogo, actualización de stock, gestión de usuarios; navegación por rol en sidebar

### Modified Capabilities

_(ninguna — los endpoints de backend ya están spec-eados en `admin-backend` y `pedidos-backend`)_

## Impact

- **Frontend — rutas**: `router.tsx` + `AdminPage.tsx` → reemplazado por `AdminLayout` + rutas anidadas
- **Frontend — pages nuevas**: `AdminDashboardPage`, `AdminPedidosPage`, `AdminProductosPage`, `AdminStockPage`, `AdminUsuariosPage`
- **Frontend — features**: nueva slice `features/admin/` (hooks, UI components)
- **Frontend — entities**: nueva `entities/admin/` (tipos + API calls para métricas)
- **Dependencias**: `recharts` (ya en stack, primera vez usado); `@mercadopago/sdk-react` sin cambios
- **Backend**: sin cambios — consume endpoints existentes de `/api/v1/admin/*`, `/api/v1/pedidos/*`, `/api/v1/productos/*`, `/api/v1/usuarios/*`
