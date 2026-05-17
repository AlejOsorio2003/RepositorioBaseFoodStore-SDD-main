## ADDED Requirements

### Requirement: ProductoDetailModal tiene botón Agregar al carrito
El `ProductoDetailModal` SHALL incluir un botón "Agregar al carrito" que invoca `useCartStore().addItem()` con los datos del producto seleccionado (`productoId`, `nombre`, `precioUnitario`, `imagenUrl`). Solo SHALL mostrarse si el producto tiene `disponible: true`. Al agregar, SHALL mostrar feedback visual (toast o cambio de label) y cerrar el modal.

#### Scenario: Agregar producto disponible al carrito
- **WHEN** el usuario hace clic en "Agregar al carrito" en el modal de un producto disponible
- **THEN** el item se agrega al `cartStore` (o incrementa cantidad si ya existe), se muestra feedback visual y el modal se cierra

#### Scenario: Producto no disponible — botón deshabilitado
- **WHEN** el modal muestra un producto con `disponible: false`
- **THEN** el botón "Agregar al carrito" aparece deshabilitado o no se renderiza

#### Scenario: Producto ya en el carrito
- **WHEN** el usuario agrega un producto que ya está en el carrito
- **THEN** la cantidad del item en el `cartStore` se incrementa en 1 (comportamiento ya implementado en `addItem`)
