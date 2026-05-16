## ADDED Requirements

### Requirement: Roles fijos del sistema
El sistema SHALL mantener exactamente 4 roles con IDs estables: ADMIN (ID=1), STOCK (ID=2), PEDIDOS (ID=3), CLIENT (ID=4). Estos roles SHALL ser insertados por el seed y no crearse ni modificarse por lógica de negocio en este sprint.

#### Scenario: Roles presentes tras el seed
- **WHEN** se ejecuta `python -m app.db.seed` contra una BD vacía
- **THEN** la tabla `roles` contiene exactamente 4 filas con `id` y `nombre` correctos

#### Scenario: IDs estables tras re-seed
- **WHEN** se ejecuta el seed dos veces
- **THEN** los IDs de los roles no cambian (idempotencia)

---

### Requirement: Asignación automática de rol CLIENT al registro
Al crear un usuario nuevo vía `POST /auth/register`, el sistema SHALL insertar automáticamente un registro en `usuario_roles` vinculando al usuario con el rol CLIENT (ID=4). Esta asignación SHALL ocurrir dentro de la misma transacción que la creación del usuario.

#### Scenario: Nuevo usuario tiene rol CLIENT
- **WHEN** un usuario se registra exitosamente
- **THEN** `SELECT ur.rol_id FROM usuario_roles ur WHERE ur.usuario_id = :id` retorna exactamente `[4]`

#### Scenario: El rol no viene del request
- **WHEN** el body del request de registro incluye un campo `rol_id` o `roles`
- **THEN** el sistema ignora esos campos y asigna CLIENT de todas formas

---

### Requirement: Enforcement de roles via require_role
La dependencia `require_role(roles: list[str])` SHALL rechazar con HTTP 403 todo request de un usuario autenticado que no posea ninguno de los roles indicados. Un usuario con múltiples roles satisface el check si tiene AL MENOS UNO de los roles requeridos.

#### Scenario: Acceso permitido con rol correcto
- **WHEN** un usuario con rol ADMIN accede a un endpoint protegido con `require_role(["ADMIN"])`
- **THEN** el sistema procesa el request normalmente

#### Scenario: Acceso denegado por rol insuficiente
- **WHEN** un usuario con solo rol CLIENT accede a un endpoint protegido con `require_role(["ADMIN", "STOCK"])`
- **THEN** el sistema retorna HTTP 403

#### Scenario: Usuario con múltiples roles
- **WHEN** un usuario tiene roles [CLIENT, STOCK] y accede a un endpoint con `require_role(["STOCK"])`
- **THEN** el sistema permite el acceso

---

### Requirement: Rutas públicas sin autenticación
Los endpoints `POST /auth/register`, `POST /auth/login`, `GET /catalog` (y futuras rutas de catálogo público) SHALL ser accesibles sin Bearer token. Un request sin header `Authorization` a estas rutas SHALL ser procesado normalmente.

#### Scenario: Registro sin token
- **WHEN** se envía `POST /auth/register` sin header `Authorization`
- **THEN** el sistema procesa el registro normalmente (HTTP 201 si datos válidos)

#### Scenario: Ruta protegida sin token
- **WHEN** se envía un request a un endpoint protegido sin header `Authorization`
- **THEN** el sistema retorna HTTP 401
