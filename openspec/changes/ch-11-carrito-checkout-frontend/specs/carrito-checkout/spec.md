## ADDED Requirements

### Requirement: CartPage — visualización y gestión del carrito
La CartPage SHALL mostrar todos los items del carrito con nombre, precio unitario, cantidad y subtotal por ítem. El usuario SHALL poder modificar cantidades (mínimo 1) y eliminar items. La página SHALL mostrar el subtotal, costo de envío fijo ($50.00) y total. Si el carrito está vacío, SHALL mostrar un mensaje con enlace al catálogo. El botón "Ir al Checkout" SHALL estar deshabilitado si el carrito está vacío o si el usuario no está autenticado.

#### Scenario: Carrito con items
- **WHEN** el usuario navega a `/cart` con items en el carrito
- **THEN** la página muestra la lista de items, subtotal, costo de envío $50.00 y total; el botón "Ir al Checkout" está habilitado

#### Scenario: Carrito vacío
- **WHEN** el usuario navega a `/cart` sin items
- **THEN** la página muestra un mensaje "Tu carrito está vacío" y un enlace "Ver catálogo"

#### Scenario: Modificar cantidad de un item
- **WHEN** el usuario incrementa o decrementa la cantidad de un item
- **THEN** el subtotal del item y el total del carrito se actualizan inmediatamente (reactivo al store)

#### Scenario: Eliminar un item
- **WHEN** el usuario hace clic en el botón eliminar de un item
- **THEN** el item desaparece del carrito y los totales se recalculan

#### Scenario: Usuario no autenticado intenta ir al checkout
- **WHEN** el usuario no está autenticado y hace clic en "Ir al Checkout"
- **THEN** el sistema redirige a `/login` con `redirect=/checkout` como query param

---

### Requirement: CheckoutPage — confirmación y creación del pedido
La CheckoutPage SHALL mostrar un resumen del pedido (items, subtotal, costo de envío, total). El usuario SHALL poder confirmar el pedido mediante un botón que dispara `POST /api/v1/pedidos`. Durante el envío SHALL mostrarse un estado de carga. Si el pedido se crea exitosamente (HTTP 201), SHALL limpiar el carrito y redirigir a `/orders`. Si falla, SHALL mostrar el mensaje de error sin limpiar el carrito.

#### Scenario: Confirmación exitosa del pedido
- **WHEN** el usuario hace clic en "Confirmar pedido" con el carrito válido
- **THEN** el sistema llama `POST /api/v1/pedidos`, muestra estado de carga, y al recibir HTTP 201 limpia el carrito y redirige a `/orders`

#### Scenario: Producto no disponible al confirmar
- **WHEN** el backend responde 422 con `PRODUCTO_NO_DISPONIBLE`
- **THEN** la página muestra un mensaje de error indicando qué producto no está disponible; el carrito no se limpia

#### Scenario: Error de red o servidor
- **WHEN** el backend responde con error 500 o hay fallo de red
- **THEN** la página muestra un mensaje genérico de error; el carrito no se limpia

#### Scenario: Botón deshabilitado durante envío
- **WHEN** la mutación está en estado `pending`
- **THEN** el botón "Confirmar pedido" está deshabilitado y muestra un spinner

#### Scenario: Acceso sin autenticación
- **WHEN** un usuario no autenticado navega a `/checkout`
- **THEN** el sistema redirige a `/login`

---

### Requirement: CartDrawer — acceso rápido al carrito desde el header
El CartDrawer SHALL ser un panel lateral (overlay) que se abre desde el ícono del carrito en el header. SHALL mostrar los items del carrito con nombre, cantidad y precio. SHALL tener botones para ir a CartPage y para ir al checkout. SHALL mostrar el badge con `itemCount()` en el ícono del carrito cuando hay items.

#### Scenario: Abrir y cerrar el drawer
- **WHEN** el usuario hace clic en el ícono del carrito en el header
- **THEN** el CartDrawer se abre mostrando los items actuales del carrito

#### Scenario: Badge de cantidad
- **WHEN** hay items en el carrito
- **THEN** el ícono del carrito en el header muestra un badge con el total de items (`itemCount()`)

#### Scenario: Drawer con carrito vacío
- **WHEN** el CartDrawer se abre con el carrito vacío
- **THEN** el drawer muestra "Tu carrito está vacío"

---

### Requirement: cartStore — computed values completos
El `cartStore` SHALL exponer los métodos: `subtotal(): number` (suma de `precio * cantidad` por item), `costoEnvio(): number` (retorna fijo $50.00 si hay items, $0 si está vacío), `total(): number` (`subtotal() + costoEnvio()`), `itemCount(): number` (suma de `cantidad` de todos los items).

#### Scenario: subtotal con múltiples items
- **WHEN** el carrito tiene 2 productos con precios $100 y $200 con cantidades 1 y 2 respectivamente
- **THEN** `subtotal()` retorna $500.00

#### Scenario: costoEnvio con carrito no vacío
- **WHEN** hay al menos un item en el carrito
- **THEN** `costoEnvio()` retorna $50.00

#### Scenario: costoEnvio con carrito vacío
- **WHEN** el carrito está vacío
- **THEN** `costoEnvio()` retorna $0.00

#### Scenario: total
- **WHEN** `subtotal()` es $500.00 y `costoEnvio()` es $50.00
- **THEN** `total()` retorna $550.00

#### Scenario: itemCount
- **WHEN** el carrito tiene 3 items con cantidades 1, 2 y 3
- **THEN** `itemCount()` retorna 6
