## Context

El frontend tiene rutas públicas y de cliente completamente implementadas (catálogo, carrito, checkout, pagos, pedidos). La ruta `/admin` existe pero devuelve una página vacía. El backend expone todos los endpoints necesarios: métricas (`/api/v1/admin/metricas`), stock (`/api/v1/admin/productos/{id}/stock`), pedidos (`/api/v1/pedidos/*`), productos (`/api/v1/productos/*`) y usuarios (`/api/v1/usuarios/*`). El proyecto usa FSD estricto: Pages → Features → Entities → Shared. TanStack Query gestiona todo el estado del servidor. recharts está en el stack pero aún no se usa.

## Goals / Non-Goals

**Goals:**
- AdminLayout con sidebar condicional por rol (ADMIN / STOCK / PEDIDOS)
- Rutas anidadas `/admin/*` protegidas con guard de roles
- AdminDashboardPage: KPI cards + LineChart (ventas) + BarChart (top productos) + PieChart (pedidos por estado) — solo ADMIN
- AdminPedidosPage: tabla de pedidos + panel detalle + avanzar estado FSM — ADMIN + PEDIDOS
- AdminProductosPage: tabla + modal crear/editar producto + toggle disponibilidad + delete — solo ADMIN
- AdminStockPage: tabla con stock editable inline — ADMIN + STOCK
- AdminUsuariosPage: tabla de usuarios + toggle activo + cambio de rol — solo ADMIN
- Toda la lógica de servidor via TanStack Query hooks en `features/admin/`
- Tipos y función API en `entities/admin/`

**Non-Goals:**
- Nuevos endpoints de backend (todo consume lo existente)
- Gráfico de ventas por período con filtros de fecha (US-057 requiere endpoint no implementado — se puede mostrar con datos estáticos o se omite)
- Gestión de categorías e ingredientes desde el panel (los endpoints existen, no está en scope de CH-15)
- Tests automatizados de componentes (verificación manual)

## Decisions

### D1: Layout anidado con `<Outlet />` de React Router

El router actual usa `createBrowserRouter`. Se reemplaza la ruta `/admin` (shell vacío) por un layout route con `<AdminLayout>` como elemento y rutas hijas para cada página. `AdminLayout` renderiza el sidebar + `<Outlet />`.

**Alternativa descartada:** páginas admin separadas sin layout compartido — duplicaría el sidebar en cada página.

### D2: Guard de roles como wrapper component

Se crea `<AdminRoute roles={[...]}>` que lee `authStore` y redirige a `/login` si no autenticado, o a `/` si no tiene el rol requerido. Cada ruta hija declara sus roles permitidos.

**Alternativa descartada:** loader de React Router para auth check — más complejo y rompe el patrón Zustand ya establecido en el proyecto.

### D3: Sidebar condicional basado en rol activo

El sidebar lee el rol del usuario desde `authStore` y filtra los ítems de navegación. Los roles STOCK y PEDIDOS ven solo sus secciones. ADMIN ve todo.

**Implementación:** array de nav items con `{ label, path, icon, roles: string[] }` — el sidebar filtra por `roles.includes(userRole)`.

### D4: feature/admin como slice único

Todos los hooks, componentes de UI y lógica del panel admin viven en `features/admin/`. Se organiza en subcarpetas por dominio: `hooks/`, `ui/dashboard/`, `ui/pedidos/`, `ui/productos/`, `ui/stock/`, `ui/usuarios/`.

**Alternativa descartada:** una feature por sección (feature/admin-dashboard, feature/admin-pedidos) — fragmentación innecesaria para un panel cohesivo.

### D5: Inline edit para stock en AdminStockPage

El stock se edita directamente en la tabla con un input numérico por fila. Al hacer blur o presionar Enter, dispara `PATCH /api/v1/admin/productos/{id}/stock`. No hay modal.

**Alternativa descartada:** modal de edición — peor UX para actualizaciones masivas de stock.

### D6: recharts con `ResponsiveContainer`

Todos los gráficos usan `<ResponsiveContainer width="100%" height={300}>` para adaptarse al layout. Sin configuración de tema adicional — colores coherentes con el design system (`#721016` primary, `#D95D2B` secondary).

### D7: MetricasRead en entities/admin

La función `getMetricas()` y los tipos `MetricasRead` / `TopProductoRead` se colocan en `entities/admin/` (no en features/admin/) porque son datos de dominio que podrían usarse en múltiples features. El hook `useAdminMetricas()` vive en `features/admin/hooks/`.

## Risks / Trade-offs

- **[Risk] `GET /admin/metricas` puede ser lento con muchos datos** → Mitigation: TanStack Query con `staleTime: 60_000` (1 min) — no refetch en cada navegación
- **[Risk] AdminUsuariosPage llama `GET /api/v1/usuarios` que requiere ADMIN** → Mitigation: guard de ruta ya previene el acceso; error boundary como fallback
- **[Risk] LineChart de ventas por período requiere endpoint no implementado** → Mitigation: el dashboard muestra KPIs + BarChart + PieChart con datos de `MetricasRead`; el LineChart se omite en CH-15
- **[Risk] Formulario de producto tiene muchos campos (categoría, ingredientes, precio, stock)** → Mitigation: TanStack Form con validación inline; los selects de categoría e ingredientes usan los endpoints ya implementados
