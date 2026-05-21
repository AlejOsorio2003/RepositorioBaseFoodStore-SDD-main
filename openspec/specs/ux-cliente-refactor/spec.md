## Purpose
Experiencia de navegación pública del catálogo sin requerir autenticación, header adaptable al estado de sesión, accesos rápidos a "Mis Pedidos" y "Volver al catálogo", y flujo lazy-auth que solicita login solo al iniciar el checkout.

## Requirements

### Requirement: Catálogo accesible sin autenticación
La ruta `/` SHALL renderizar `CatalogPage` sin requerir que el usuario esté autenticado. El acceso al catálogo no debe bloquearse por falta de sesión.

#### Scenario: Visitante anónimo ve el catálogo
- **WHEN** un usuario no autenticado navega a `/`
- **THEN** se renderiza `CatalogPage` con el catálogo completo de productos, sin redirección a `/login`

#### Scenario: Ruta /catalog redirige a /
- **WHEN** el usuario navega a `/catalog`
- **THEN** es redirigido a `/` sin pérdida del query string

### Requirement: Header visible para todos los usuarios
El `Header` SHALL ser visible tanto para usuarios autenticados como anónimos, adaptando su contenido al estado de sesión.

#### Scenario: Header anónimo muestra acceso al login
- **WHEN** el usuario no está autenticado
- **THEN** el header muestra el nombre del sitio y un botón/link "Iniciar sesión" que lleva a `/login`

#### Scenario: Header autenticado muestra datos del usuario y Mis Pedidos
- **WHEN** el usuario está autenticado
- **THEN** el header muestra el nombre del usuario, el ícono del carrito con badge, el link "Mis Pedidos" y el botón "Cerrar sesión"

#### Scenario: Link Mis Pedidos no aparece para usuarios anónimos
- **WHEN** el usuario no está autenticado
- **THEN** el link "Mis Pedidos" no se renderiza en el header

### Requirement: Link "Volver al catálogo" en páginas de flujo de compra
Las páginas `OrdersPage`, `PaymentPage` y `CartPage` SHALL incluir un link "Volver al catálogo" que navega a `/`.

#### Scenario: Link visible en OrdersPage
- **WHEN** el usuario autenticado navega a `/orders`
- **THEN** hay un link o botón "Volver al catálogo" visible que navega a `/`

#### Scenario: Link visible en PaymentPage
- **WHEN** el usuario navega a `/payment/:pedidoId`
- **THEN** hay un link o botón "Volver al catálogo" visible que navega a `/`

#### Scenario: Link visible en CartPage cuando el carrito está vacío
- **WHEN** el usuario navega a `/cart` con el carrito vacío
- **THEN** hay un call-to-action "Volver al catálogo" visible que navega a `/`

### Requirement: Lazy auth — login solicitado solo al iniciar checkout
El sistema SHALL permitir navegar y agregar productos al carrito sin autenticación, solicitando login únicamente cuando el usuario intente avanzar al checkout.

#### Scenario: Usuario anónimo puede agregar al carrito
- **WHEN** un usuario no autenticado hace click en "Agregar al carrito" en cualquier producto
- **THEN** el producto se agrega al carrito sin solicitar login

#### Scenario: Usuario anónimo es redirigido al intentar checkout
- **WHEN** un usuario no autenticado hace click en "Ir al checkout" en CartPage
- **THEN** es redirigido a `/login?redirect=/checkout`

#### Scenario: Usuario autenticado puede ir directamente al checkout
- **WHEN** un usuario autenticado hace click en "Ir al checkout"
- **THEN** navega directamente a `/checkout` sin pasar por login
