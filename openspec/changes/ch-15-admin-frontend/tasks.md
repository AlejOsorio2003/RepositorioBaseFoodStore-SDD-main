## 1. Entity admin

- [x] 1.1 Crear `frontend/src/entities/admin/index.ts` con tipos `MetricasRead`, `TopProductoRead` y función `getMetricas(): Promise<MetricasRead>` que llama a `GET /api/v1/admin/metricas`

## 2. AdminRoute guard + AdminLayout

- [x] 2.1 Crear `frontend/src/shared/ui/AdminRoute.tsx` — componente que lee `authStore`, redirige a `/login` si no autenticado, redirige a `/` si no tiene ningún rol admin (`ADMIN | STOCK | PEDIDOS`), acepta prop `roles: string[]` para guards granulares por ruta
- [x] 2.2 Crear `frontend/src/shared/ui/AdminLayout.tsx` — sidebar con nav items filtrados por rol del usuario (`{ label, path, icon, roles }[]`), `<Outlet />` para el contenido, header con nombre de usuario y botón logout

## 3. Router — rutas anidadas /admin/*

- [x] 3.1 Actualizar `frontend/src/app/router.tsx`: reemplazar la ruta `/admin` (shell vacío) por un layout route con `element: <AdminLayout />` y rutas hijas:
  - `/admin` → redirect a `/admin/dashboard` (ADMIN) o `/admin/stock` (STOCK) o `/admin/pedidos` (PEDIDOS)
  - `/admin/dashboard` → `AdminDashboardPage` (solo ADMIN)
  - `/admin/pedidos` → `AdminPedidosPage` (ADMIN + PEDIDOS)
  - `/admin/productos` → `AdminProductosPage` (solo ADMIN)
  - `/admin/stock` → `AdminStockPage` (ADMIN + STOCK)
  - `/admin/usuarios` → `AdminUsuariosPage` (solo ADMIN)

## 4. Feature admin — hooks TanStack Query

- [x] 4.1 Crear `frontend/src/features/admin/hooks/useAdminMetricas.ts` — `useQuery` sobre `getMetricas()` con `staleTime: 60_000`
- [x] 4.2 Crear `frontend/src/features/admin/hooks/useAdminPedidos.ts` — `useQuery` sobre `GET /api/v1/pedidos` (todos) + `useAvanzarEstado` mutation sobre `PATCH /api/v1/pedidos/{id}/estado`
- [x] 4.3 Crear `frontend/src/features/admin/hooks/useAdminProductos.ts` — `useQuery` lista + mutations para create (`POST`), update (`PUT`), delete (`DELETE`), toggleDisponibilidad (`PATCH /disponibilidad`)
- [x] 4.4 Crear `frontend/src/features/admin/hooks/useAdminStock.ts` — mutation `useUpdateStock` sobre `PATCH /api/v1/admin/productos/{id}/stock`
- [x] 4.5 Crear `frontend/src/features/admin/hooks/useAdminUsuarios.ts` — `useQuery` lista usuarios + mutations para toggleEstado (`PATCH /usuarios/{id}/estado`) y cambiarRol (`PUT /usuarios/{id}`)

## 5. AdminDashboardPage

- [x] 5.1 Crear `frontend/src/pages/AdminDashboardPage.tsx` — 3 KPI cards (total_ventas, productos_stock_bajo, pedidos activos) usando `useAdminMetricas`
- [x] 5.2 Agregar `<BarChart>` de recharts con `top_productos` (eje X: nombre, eje Y: total_vendido), usando `ResponsiveContainer` y colores del design system (`#721016`)
- [x] 5.3 Agregar `<PieChart>` de recharts con `pedidos_por_estado` (sectores por estado), con leyenda y colores diferenciados por estado
- [x] 5.4 Manejar estado loading (skeleton cards) y estado vacío en ambos gráficos

## 6. AdminPedidosPage

- [x] 6.1 Crear `frontend/src/pages/AdminPedidosPage.tsx` — tabla paginada de pedidos con columnas: ID, cliente, estado (badge de color), fecha, total; usando `useAdminPedidos`
- [x] 6.2 Panel lateral de detalle al seleccionar un pedido: campos del pedido, historial de estados (`GET /api/v1/pedidos/{id}/historial`) como timeline
- [x] 6.3 Botón "Avanzar estado" en el panel: llama a `useAvanzarEstado`, deshabilitado si estado es ENTREGADO o CANCELADO, muestra tooltip "Estado final"
- [x] 6.4 Invalidar query de lista de pedidos tras avanzar estado exitosamente

## 7. AdminProductosPage

- [x] 7.1 Crear `frontend/src/pages/AdminProductosPage.tsx` — tabla de productos con columnas: nombre, categoría, precio, stock, disponible (toggle inline), acciones (editar, eliminar)
- [x] 7.2 Modal crear/editar producto con TanStack Form: campos nombre, descripción, precio, stock_cantidad, categoría (select con `GET /api/v1/categorias`), disponible (checkbox); validación requerida en nombre y precio
- [x] 7.3 Toggle disponibilidad inline: llama a `PATCH /api/v1/productos/{id}/disponibilidad` al hacer clic, actualiza optimistamente la UI
- [x] 7.4 Eliminar con confirmación: dialog de confirmación antes de llamar `DELETE /api/v1/productos/{id}`

## 8. AdminStockPage

- [x] 8.1 Crear `frontend/src/pages/AdminStockPage.tsx` — tabla de productos con columnas: nombre, categoría, stock_cantidad (input editable inline), disponible; badge rojo "Stock bajo" si `stock_cantidad < 5`
- [x] 8.2 Edición inline de stock: al hacer blur o Enter, llama a `useUpdateStock`; validación frontend rechaza valores negativos con mensaje de error inline sin llamar al backend

## 9. AdminUsuariosPage

- [x] 9.1 Crear `frontend/src/pages/AdminUsuariosPage.tsx` — tabla de usuarios con columnas: nombre, email, rol (dropdown editable), activo (toggle), fecha de creación
- [x] 9.2 Toggle activo: llama a `PATCH /api/v1/usuarios/{id}/estado` al hacer clic
- [x] 9.3 Cambio de rol: dropdown con opciones `CLIENT | ADMIN | STOCK | PEDIDOS`; al cambiar llama a `PUT /api/v1/usuarios/{id}` con nuevo rol

## 10. Verificación

- [ ] 10.1 Login como ADMIN → `/admin/dashboard` muestra KPI cards y ambos gráficos recharts con datos reales
- [ ] 10.2 Login como STOCK → redirige a `/admin/stock`, no ve `/admin/dashboard` ni `/admin/usuarios`
- [ ] 10.3 Login como PEDIDOS → redirige a `/admin/pedidos`, no ve otras secciones
- [ ] 10.4 Login como CLIENT → acceder a `/admin` redirige a `/`
- [ ] 10.5 AdminPedidosPage: seleccionar pedido → panel detalle + historial; botón "Avanzar estado" funciona y actualiza la tabla
- [ ] 10.6 AdminProductosPage: crear producto → aparece en tabla; editar → cambios reflejados; eliminar → desaparece de tabla; toggle disponibilidad funciona inline
- [ ] 10.7 AdminStockPage: editar stock de un producto → valor actualizado; ingresar negativo → error inline sin llamada al backend; badge "Stock bajo" visible para productos con stock < 5
- [ ] 10.8 AdminUsuariosPage: toggle activo funciona; cambio de rol se refleja en el dropdown
