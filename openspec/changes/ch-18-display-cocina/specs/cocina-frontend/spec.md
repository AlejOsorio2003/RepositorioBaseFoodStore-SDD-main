### Requirement: Ruta protegida /cocina

El sistema SHALL registrar la ruta `/cocina` en el router de React como una ruta protegida accesible únicamente para usuarios con rol `COCINA`. Si un usuario autenticado con otro rol intenta acceder, MUST ser redirigido a `/` (home). Si el usuario no está autenticado, MUST ser redirigido a `/login`. La ruta MUST renderizar la página `KitchenDisplayPage`.

#### Scenario: Acceso autorizado

- **WHEN** un usuario autenticado con rol COCINA navega a `/cocina`
- **THEN** el sistema renderiza `KitchenDisplayPage` sin redirecciones

#### Scenario: Acceso con rol incorrecto

- **WHEN** un usuario autenticado con rol CLIENT, ADMIN, GESTOR_PEDIDOS o GESTOR_STOCK navega a `/cocina`
- **THEN** el sistema redirige a `/` sin renderizar la página

#### Scenario: Acceso sin autenticación

- **WHEN** un usuario no autenticado navega a `/cocina`
- **THEN** el sistema redirige a `/login`

---

### Requirement: Layout KDS — dos columnas

El sistema SHALL renderizar en `KitchenDisplayPage` un layout de dos columnas fijas con encabezados:

- Columna izquierda: **"Por preparar"** — muestra tarjetas de pedidos en estado `CONFIRMADO`
- Columna derecha: **"En preparación"** — muestra tarjetas de pedidos en estado `EN_PREP`

Las columnas MUST ser responsivas en pantallas grandes (desktop) y apilarse verticalmente en pantallas pequeñas (mobile). Cada columna muestra el conteo de pedidos activos en su encabezado. Si una columna está vacía, MUST mostrar un mensaje de placeholder ("Sin pedidos").

#### Scenario: Pedidos distribuidos en columnas correctas

- **WHEN** existen pedidos CONFIRMADO y EN_PREP
- **THEN** cada pedido aparece en la columna correspondiente a su estado actual

#### Scenario: Columna vacía

- **WHEN** no hay pedidos en estado CONFIRMADO
- **THEN** la columna "Por preparar" muestra el placeholder "Sin pedidos" y el conteo `0`

#### Scenario: Render inicial con datos de API

- **WHEN** la página carga y la API retorna pedidos
- **THEN** ambas columnas se populan sin parpadeo (datos cargados antes de mostrar esqueletos)

---

### Requirement: Tarjeta de pedido KDS

Cada pedido SHALL renderizarse como una tarjeta (`KitchenOrderCard`) que muestra:

- Número de pedido (`#id`)
- Lista de ítems: nombre del producto, cantidad y personalización (ingredientes removidos, si los hay)
- Timer de urgencia: tiempo transcurrido desde que el pedido entró a estado CONFIRMADO, actualizado cada segundo
- Indicador de urgencia visual: color neutro si < 10 min, **amarillo** (warning) si ≥ 10 min, **rojo** (danger) si ≥ 20 min
- Botón de avance de estado (ver Requirement: Botón de avance de estado)

El timer MUST continuar actualizándose en tiempo real sin recargar datos del servidor.

#### Scenario: Timer en estado neutro

- **WHEN** el pedido lleva menos de 10 minutos en CONFIRMADO
- **THEN** el timer se muestra con estilo neutro (sin color de urgencia)

#### Scenario: Timer en estado warning

- **WHEN** el pedido lleva entre 10 y 19 minutos en CONFIRMADO
- **THEN** el timer se muestra con fondo o borde amarillo

#### Scenario: Timer en estado danger

- **WHEN** el pedido lleva 20 minutos o más en CONFIRMADO
- **THEN** el timer se muestra con fondo o borde rojo

#### Scenario: Personalización de ítems visible

- **WHEN** un ítem tiene ingredientes removidos en `personalizacion`
- **THEN** la tarjeta muestra la lista de nombres de ingredientes removidos debajo del nombre del producto

#### Scenario: Ítem sin personalización

- **WHEN** un ítem no tiene personalizaciones
- **THEN** la tarjeta no muestra sección de personalización para ese ítem

---

### Requirement: Botón de avance de estado

Cada tarjeta SHALL incluir un botón de acción primaria que avanza el pedido al siguiente estado según la FSM de cocina:

- Si el pedido está en `CONFIRMADO`: el botón dice **"Iniciar preparación"** y ejecuta la transición a `EN_PREP`
- Si el pedido está en `EN_PREP`: el botón dice **"Listo para envío"** y ejecuta la transición a `EN_CAMINO`

El botón MUST estar deshabilitado y mostrar un spinner mientras la petición PATCH está en vuelo (loading state). Al completarse exitosamente, la tarjeta MUST desaparecer de la columna actual (el pedido ya no está en CONFIRMADO ni EN_PREP) y la UI se actualiza sin recarga completa.

#### Scenario: Avance de CONFIRMADO a EN_PREP

- **WHEN** el operador hace clic en "Iniciar preparación" en una tarjeta CONFIRMADO
- **THEN** el sistema llama a `PATCH /api/v1/cocina/pedidos/{id}/estado` con `nuevo_estado: "EN_PREP"`, mueve la tarjeta a la columna derecha y actualiza el estado local

#### Scenario: Avance de EN_PREP a EN_CAMINO

- **WHEN** el operador hace clic en "Listo para envío" en una tarjeta EN_PREP
- **THEN** el sistema llama a `PATCH /api/v1/cocina/pedidos/{id}/estado` con `nuevo_estado: "EN_CAMINO"`, retira la tarjeta de la columna y actualiza el estado local

#### Scenario: Loading state durante la petición

- **WHEN** el operador hace clic en el botón de avance y la petición está en vuelo
- **THEN** el botón muestra un spinner y queda deshabilitado hasta que la petición resuelve

#### Scenario: Error en el avance

- **WHEN** la petición PATCH retorna un error (4xx / 5xx)
- **THEN** el botón vuelve a su estado activo, la tarjeta permanece en su columna y se muestra un toast de error con el mensaje de la API

---

### Requirement: Conexión WebSocket con fallback polling

El sistema SHALL establecer una conexión WebSocket a `/api/v1/cocina/ws` al montar `KitchenDisplayPage`. La autenticación MUST realizarse enviando el JWT como primer mensaje tras abrir la conexión. Al recibir un mensaje push de nuevo pedido CONFIRMADO, el sistema MUST agregar la nueva tarjeta a la columna "Por preparar" sin recargar la lista completa. Si la conexión WS falla o se cierra inesperadamente, el sistema MUST activar un mecanismo de polling cada 30 segundos como fallback, haciendo `GET /api/v1/cocina/pedidos` hasta que la conexión WS se restablezca.

#### Scenario: Conexión WS exitosa al montar

- **WHEN** `KitchenDisplayPage` monta y el JWT es válido
- **THEN** el cliente abre la conexión WS, envía el JWT y queda escuchando eventos push

#### Scenario: Nuevo pedido recibido por WS

- **WHEN** el servidor emite un mensaje WS con un nuevo pedido CONFIRMADO
- **THEN** el frontend agrega la tarjeta del pedido a la columna "Por preparar" sin recargar la lista

#### Scenario: Fallo de conexión WS — activación de polling

- **WHEN** la conexión WS falla al intentar abrirse o se cierra inesperadamente
- **THEN** el sistema activa polling cada 30 segundos con `GET /api/v1/cocina/pedidos` y muestra un indicador visual de "Modo offline (actualizando cada 30 s)"

#### Scenario: Reconexión WS — desactivación de polling

- **WHEN** la conexión WS se restablece exitosamente tras un período de polling
- **THEN** el sistema desactiva el polling y vuelve al modo push, ocultando el indicador de modo offline

#### Scenario: Desmontaje limpio

- **WHEN** el usuario navega fuera de `/cocina` y `KitchenDisplayPage` desmonta
- **THEN** la conexión WS se cierra limpiamente y los timers de polling se cancelan (cleanup en `useEffect`)

---

### Requirement: Carga inicial de datos

El sistema SHALL cargar los pedidos activos al montar `KitchenDisplayPage` mediante una llamada a `GET /api/v1/cocina/pedidos` gestionada con TanStack Query. El query key SHALL ser `["cocina", "pedidos"]`. Durante la carga inicial, la página MUST mostrar un estado de esqueleto (skeleton) en lugar de columnas vacías. Si la carga falla, MUST mostrarse un mensaje de error con botón de reintento.

#### Scenario: Carga exitosa

- **WHEN** la página monta y la API responde con pedidos
- **THEN** las columnas se populan con las tarjetas correspondientes y los skeletons desaparecen

#### Scenario: Estado de carga (skeleton)

- **WHEN** la petición inicial está pendiente
- **THEN** ambas columnas muestran placeholders skeleton en lugar de tarjetas reales

#### Scenario: Error de carga

- **WHEN** la petición inicial retorna un error de red o HTTP
- **THEN** se muestra un mensaje de error y un botón "Reintentar" que dispara un refetch del query
