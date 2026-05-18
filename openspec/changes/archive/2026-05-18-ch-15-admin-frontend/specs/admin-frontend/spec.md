## ADDED Requirements

### Requirement: Panel admin protegido por rol
El sistema SHALL mostrar el panel administrativo únicamente a usuarios autenticados con rol ADMIN, STOCK o PEDIDOS. Un usuario sin esos roles SHALL ser redirigido a `/` al intentar acceder a cualquier ruta `/admin/*`. Un usuario no autenticado SHALL ser redirigido a `/login`.

#### Scenario: ADMIN accede al panel
- **WHEN** un usuario con rol ADMIN navega a `/admin`
- **THEN** el sistema muestra el AdminLayout con sidebar completo y redirige a `/admin/dashboard`

#### Scenario: STOCK accede al panel
- **WHEN** un usuario con rol STOCK navega a `/admin`
- **THEN** el sistema muestra el AdminLayout con sidebar filtrado (solo secciones de catálogo/stock) y redirige a `/admin/stock`

#### Scenario: PEDIDOS accede al panel
- **WHEN** un usuario con rol PEDIDOS navega a `/admin`
- **THEN** el sistema muestra el AdminLayout con sidebar filtrado (solo sección de pedidos) y redirige a `/admin/pedidos`

#### Scenario: CLIENT intenta acceder al panel
- **WHEN** un usuario con rol CLIENT navega a `/admin`
- **THEN** el sistema redirige a `/`

#### Scenario: Usuario no autenticado intenta acceder al panel
- **WHEN** un usuario no autenticado navega a `/admin/*`
- **THEN** el sistema redirige a `/login`

---

### Requirement: Dashboard de métricas (solo ADMIN)
El sistema SHALL mostrar en `/admin/dashboard` un panel con KPIs y gráficos derivados de `GET /api/v1/admin/metricas`. El acceso SHALL estar restringido al rol ADMIN.

El dashboard SHALL incluir:
- KPI card: `total_ventas` (suma de pagos aprobados)
- KPI card: `productos_stock_bajo` (count de productos con stock < 5)
- KPI card: total de pedidos activos (suma de `pedidos_por_estado` excluyendo CANCELADO)
- `<BarChart>` de recharts: top 5 productos más vendidos (`top_productos`) por `total_vendido`
- `<PieChart>` de recharts: distribución de pedidos por estado (`pedidos_por_estado`)

#### Scenario: ADMIN ve el dashboard con datos
- **WHEN** un usuario ADMIN navega a `/admin/dashboard`
- **THEN** el sistema llama a `GET /api/v1/admin/metricas`, muestra los KPI cards con los valores reales y renderiza los dos gráficos recharts

#### Scenario: Dashboard con lista de top productos vacía
- **WHEN** `top_productos` retorna lista vacía (no hay pedidos)
- **THEN** el BarChart muestra un estado vacío ("Sin datos de ventas aún")

#### Scenario: STOCK intenta acceder al dashboard
- **WHEN** un usuario con rol STOCK navega a `/admin/dashboard`
- **THEN** el sistema redirige a `/admin/stock`

---

### Requirement: Gestión de pedidos (ADMIN + PEDIDOS)
El sistema SHALL mostrar en `/admin/pedidos` una tabla paginada con todos los pedidos del sistema, accesible para roles ADMIN y PEDIDOS.

La tabla SHALL incluir: ID, cliente (nombre), estado actual, fecha de creación, total.
Al seleccionar un pedido, SHALL mostrarse un panel lateral con el detalle completo, historial de estados y el botón "Avanzar estado" (deshabilitado si no hay transición válida disponible o el pedido está ENTREGADO/CANCELADO).

#### Scenario: Gestor de Pedidos ve todos los pedidos
- **WHEN** un usuario con rol PEDIDOS navega a `/admin/pedidos`
- **THEN** el sistema llama a `GET /api/v1/pedidos` (sin filtro de usuario) y muestra la tabla completa

#### Scenario: Avanzar estado de un pedido
- **WHEN** el usuario hace clic en "Avanzar estado" en el panel de detalle
- **THEN** el sistema llama a `PATCH /api/v1/pedidos/{id}/estado` con el siguiente estado válido según la FSM, actualiza la tabla y el historial

#### Scenario: Pedido en estado terminal
- **WHEN** el pedido está en estado ENTREGADO o CANCELADO
- **THEN** el botón "Avanzar estado" está deshabilitado y muestra tooltip "Estado final"

---

### Requirement: Gestión de productos (solo ADMIN)
El sistema SHALL mostrar en `/admin/productos` una tabla de todos los productos con opciones de crear, editar, cambiar disponibilidad y eliminar. Acceso restringido al rol ADMIN.

La tabla SHALL mostrar: nombre, categoría, precio, stock, disponible (toggle), acciones (editar / eliminar).
Crear y editar SHALL abrir un modal con formulario TanStack Form con campos: nombre, descripción, precio, stock_cantidad, categoría (select), disponible (checkbox).
Eliminar SHALL requerir confirmación antes de llamar `DELETE /api/v1/productos/{id}`.

#### Scenario: ADMIN crea un producto nuevo
- **WHEN** el ADMIN hace clic en "Nuevo Producto" y completa el formulario
- **THEN** el sistema llama a `POST /api/v1/productos`, cierra el modal y actualiza la tabla

#### Scenario: ADMIN edita un producto existente
- **WHEN** el ADMIN hace clic en "Editar" en una fila y modifica campos
- **THEN** el sistema llama a `PUT /api/v1/productos/{id}` y refleja los cambios en la tabla

#### Scenario: ADMIN elimina un producto
- **WHEN** el ADMIN confirma la eliminación
- **THEN** el sistema llama a `DELETE /api/v1/productos/{id}` y quita el producto de la tabla

#### Scenario: ADMIN cambia disponibilidad inline
- **WHEN** el ADMIN hace clic en el toggle "disponible" en la tabla
- **THEN** el sistema llama a `PATCH /api/v1/productos/{id}/disponibilidad` y actualiza el toggle visualmente

---

### Requirement: Gestión de stock (ADMIN + STOCK)
El sistema SHALL mostrar en `/admin/stock` una tabla de productos con campo de stock editable inline. El acceso SHALL estar permitido para roles ADMIN y STOCK.

La tabla SHALL mostrar: nombre, categoría, stock_cantidad (editable inline), disponible. Editar el stock inline (blur o Enter) SHALL llamar a `PATCH /api/v1/admin/productos/{id}/stock`. Un valor negativo SHALL mostrar error de validación sin realizar la llamada.

#### Scenario: Gestor de Stock actualiza stock de un producto
- **WHEN** el usuario edita el campo stock_cantidad de un producto y confirma (Enter o blur)
- **THEN** el sistema llama a `PATCH /api/v1/admin/productos/{id}/stock` con el nuevo valor y muestra feedback de éxito

#### Scenario: Stock negativo es rechazado en frontend
- **WHEN** el usuario ingresa un valor negativo en el campo stock_cantidad
- **THEN** el sistema muestra error de validación inline y NO realiza la llamada al backend

#### Scenario: Productos con stock bajo se destacan
- **WHEN** un producto tiene `stock_cantidad < 5`
- **THEN** la fila se muestra con indicador visual (badge rojo "Stock bajo")

---

### Requirement: Gestión de usuarios (solo ADMIN)
El sistema SHALL mostrar en `/admin/usuarios` una tabla de todos los usuarios del sistema. El acceso SHALL estar restringido al rol ADMIN.

La tabla SHALL mostrar: nombre, email, rol, activo (toggle), fecha de creación, acción de cambio de rol.
Toggle activo SHALL llamar a `PATCH /api/v1/usuarios/{id}/estado`.
Cambio de rol SHALL llamar a `PUT /api/v1/usuarios/{id}` con el nuevo rol seleccionado desde un dropdown.

#### Scenario: ADMIN ve la lista de usuarios
- **WHEN** un usuario ADMIN navega a `/admin/usuarios`
- **THEN** el sistema llama a `GET /api/v1/usuarios` y muestra la tabla paginada

#### Scenario: ADMIN desactiva un usuario
- **WHEN** el ADMIN hace clic en el toggle "activo" de un usuario activo
- **THEN** el sistema llama a `PATCH /api/v1/usuarios/{id}/estado` y actualiza el toggle

#### Scenario: ADMIN cambia el rol de un usuario
- **WHEN** el ADMIN selecciona un nuevo rol en el dropdown de un usuario
- **THEN** el sistema llama a `PUT /api/v1/usuarios/{id}` con el nuevo rol y actualiza la tabla
