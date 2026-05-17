## ADDED Requirements

### Requirement: cartStore expone computed values
El `cartStore` SHALL exponer los métodos computados: `subtotal(): number` (suma de `precioUnitario * cantidad` por cada item), `costoEnvio(): number` ($50.00 si `items.length > 0`, $0 si el carrito está vacío), `total(): number` (`subtotal() + costoEnvio()`), `itemCount(): number` (suma de todas las `cantidad` de los items). Estos métodos deben ser funciones del store (no selectores externos) para garantizar que el persist los incluya.

#### Scenario: subtotal correcto con múltiples items
- **WHEN** el carrito tiene items con precios y cantidades distintas
- **THEN** `subtotal()` retorna la suma de `precioUnitario * cantidad` de todos los items

#### Scenario: costoEnvio según estado del carrito
- **WHEN** el carrito tiene al menos un item
- **THEN** `costoEnvio()` retorna 50; cuando el carrito está vacío retorna 0

#### Scenario: total es suma de subtotal y costoEnvio
- **WHEN** se llama `total()`
- **THEN** retorna exactamente `subtotal() + costoEnvio()`

#### Scenario: itemCount suma cantidades
- **WHEN** el carrito tiene items con cantidades variadas
- **THEN** `itemCount()` retorna la suma total de unidades

---

### Requirement: paymentStore con status tipado como union
El `paymentStore` SHALL tipar `status` como `'idle' | 'processing' | 'approved' | 'rejected' | 'error'` (no `string | null`). SHALL exponer: `mpPaymentId: string | null`, `statusDetail: string | null`, `setPaymentStatus(status, mpPaymentId?, statusDetail?)`, `reset()`. No SHALL usar persistencia (`persist` middleware).

#### Scenario: Transición a approved
- **WHEN** se llama `setPaymentStatus('approved', 'mp-123')`
- **THEN** el store refleja `status: 'approved'` y `mpPaymentId: 'mp-123'`

#### Scenario: Reset del store
- **WHEN** se llama `reset()`
- **THEN** el store vuelve a `status: 'idle'`, `mpPaymentId: null`, `statusDetail: null`

---

### Requirement: uiStore expone control del CartDrawer
El `uiStore` SHALL exponer: `cartOpen: boolean` (inicial `false`), `openCart(): void`, `closeCart(): void`. Estos controlan la visibilidad del CartDrawer desde cualquier componente. No SHALL usar persistencia para `cartOpen`.

#### Scenario: Abrir el drawer
- **WHEN** se llama `openCart()`
- **THEN** `cartOpen` pasa a `true`

#### Scenario: Cerrar el drawer
- **WHEN** se llama `closeCart()`
- **THEN** `cartOpen` pasa a `false`
