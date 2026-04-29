## ADDED Requirements

### Requirement: Proyecto FastAPI ejecutable
La aplicación backend SHALL arrancar con `uvicorn app.main:app --reload` sin errores. El entry-point `app/main.py` SHALL registrar todos los routers de módulo, configurar CORS con `CORS_ORIGINS` del entorno, e incluir el manejador global de errores RFC 7807.

#### Scenario: Arranque limpio del servidor
- **WHEN** se ejecuta `uvicorn app.main:app` con variables de entorno válidas
- **THEN** el servidor inicia en puerto 8000 y responde HTTP 200 en `GET /health`

#### Scenario: Variables de entorno faltantes
- **WHEN** falta la variable `DATABASE_URL` en el entorno
- **THEN** la aplicación termina en startup con un error de validación de Pydantic Settings, no un error en runtime

---

### Requirement: Configuración vía Pydantic Settings
El módulo `app/core/config.py` SHALL exponer una instancia singleton `settings: Settings` con todos los campos requeridos tipados: `DATABASE_URL`, `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS`, `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`, `CORS_ORIGINS`.

#### Scenario: Lectura de archivo .env
- **WHEN** existe un archivo `.env` con todos los campos requeridos
- **THEN** `settings.DATABASE_URL` retorna el valor del archivo sin necesidad de variables de sistema

#### Scenario: Campo inválido
- **WHEN** `ACCESS_TOKEN_EXPIRE_MINUTES` tiene un valor no numérico en `.env`
- **THEN** Pydantic Settings lanza `ValidationError` durante la importación del módulo

---

### Requirement: Modelos SQLModel del ERD v5
El módulo `app/core/models.py` (o módulos distribuidos en cada feature) SHALL declarar los 16 modelos SQLModel que corresponden al ERD v5: `Usuario`, `Rol`, `UsuarioRol`, `RefreshToken`, `DireccionEntrega`, `Categoria`, `Producto`, `Ingrediente`, `ProductoCategoria`, `ProductoIngrediente`, `FormaPago`, `EstadoPedido`, `Pedido`, `DetallePedido`, `HistorialEstadoPedido`, `Pago`. Cada modelo SHALL mapear todos los campos, tipos, constraints y FK definidos en la spec del ERD.

#### Scenario: Migración inicial sin errores
- **WHEN** se ejecuta `alembic upgrade head` contra una base de datos vacía
- **THEN** las 16 tablas son creadas sin errores y `alembic_version` registra la revisión

#### Scenario: Soft delete disponible
- **WHEN** un modelo tiene el campo `deleted_at: Optional[datetime]`
- **THEN** el campo es nullable en la base de datos y el modelo hereda de una clase base que lo declara

---

### Requirement: Migración Alembic inicializada
El directorio `alembic/` SHALL existir con `alembic.ini` en la raíz de `backend/`. La URL de conexión SHALL leerse de `settings.DATABASE_URL` en `env.py`, no estar hardcodeada. La migración `initial` SHALL ser reproducible (ejecutar `downgrade base` seguido de `upgrade head` debe dejar la base en el mismo estado).

#### Scenario: Idempotencia de migración
- **WHEN** se ejecuta `alembic downgrade base` y luego `alembic upgrade head`
- **THEN** las 16 tablas existen con la misma estructura que la primera aplicación

---

### Requirement: BaseRepository[T] genérico
La clase `BaseRepository[T]` en `app/core/repository.py` SHALL implementar los métodos: `get_by_id(id) → Optional[T]`, `list_all(skip, limit) → list[T]`, `count() → int`, `create(obj) → T`, `update(id, data) → Optional[T]`, `soft_delete(id) → bool`, `hard_delete(id) → bool`. Todos los métodos SHALL operar sobre la sesión SQLAlchemy recibida en el constructor.

#### Scenario: Get por ID existente
- **WHEN** se llama `repo.get_by_id(1)` y existe un registro con id=1
- **THEN** retorna la instancia del modelo correspondiente

#### Scenario: Get por ID inexistente
- **WHEN** se llama `repo.get_by_id(999)` y no existe un registro con id=999
- **THEN** retorna `None`

#### Scenario: Soft delete
- **WHEN** se llama `repo.soft_delete(id)` sobre un registro existente
- **THEN** el campo `deleted_at` se establece con el timestamp actual y el registro sigue en la base de datos

---

### Requirement: Unit of Work context-manager
La clase `UnitOfWork` en `app/core/uow.py` SHALL funcionar como context-manager Python. En `__enter__` SHALL abrir una sesión SQLAlchemy y exponer repos como atributos. En `__exit__` sin excepción SHALL hacer `commit`. En `__exit__` con excepción SHALL hacer `rollback` y re-raise la excepción.

#### Scenario: Commit automático en flujo normal
- **WHEN** se usa `with UnitOfWork() as uow:` y no se lanza excepción
- **THEN** la sesión ejecuta `commit` al salir del bloque

#### Scenario: Rollback automático en excepción
- **WHEN** se lanza una excepción dentro del bloque `with UnitOfWork() as uow:`
- **THEN** la sesión ejecuta `rollback` y la excepción se propaga al caller

---

### Requirement: Dependencias de seguridad FastAPI reutilizables
El módulo `app/core/security.py` SHALL exponer `get_current_user` (dependencia FastAPI que valida Bearer JWT y retorna `Usuario`) y `require_role(roles: list[str])` (factory que retorna una dependencia que verifica que `current_user` tenga al menos uno de los roles indicados).

#### Scenario: Token válido
- **WHEN** el header `Authorization: Bearer <token_válido>` está presente en el request
- **THEN** `get_current_user` retorna el `Usuario` correspondiente al `sub` del JWT

#### Scenario: Token inválido o expirado
- **WHEN** el token JWT está expirado o tiene firma incorrecta
- **THEN** `get_current_user` lanza `HTTPException` con status 401

#### Scenario: Rol insuficiente
- **WHEN** el usuario autenticado no tiene ninguno de los roles requeridos por `require_role`
- **THEN** la dependencia lanza `HTTPException` con status 403

---

### Requirement: Manejador de errores RFC 7807
El manejador global SHALL convertir toda `HTTPException` en una respuesta JSON con campos `type`, `title`, `status`, `detail`, `instance`. El `Content-Type` SHALL ser `application/problem+json`.

#### Scenario: HTTPException 404
- **WHEN** un endpoint lanza `HTTPException(status_code=404, detail="Recurso no encontrado")`
- **THEN** la respuesta tiene status 404 y body `{"type": "...", "title": "Not Found", "status": 404, "detail": "Recurso no encontrado", "instance": "/ruta/del/request"}`

#### Scenario: Error 422 de validación Pydantic
- **WHEN** el body del request no cumple el schema Pydantic
- **THEN** la respuesta tiene status 422 con el campo `detail` listando los errores de validación en formato RFC 7807

---

### Requirement: Seed de datos inicial
El script `app/db/seed.py` SHALL insertar los datos de prueba definidos en la spec: roles (ADMIN, STOCK, PEDIDOS, CLIENT), un usuario por rol con contraseña hasheada con bcrypt cost≥12, estados de pedido (PENDIENTE, CONFIRMADO, EN_PREP, EN_CAMINO, ENTREGADO, CANCELADO) con `es_terminal` correcto, formas de pago habilitadas, y al menos 3 categorías raíz.

#### Scenario: Seed idempotente
- **WHEN** se ejecuta `python -m app.db.seed` dos veces
- **THEN** no se duplican registros (usar `ON CONFLICT DO NOTHING` o verificar existencia previa)

#### Scenario: Contraseñas hasheadas
- **WHEN** se consulta la tabla `usuarios` después del seed
- **THEN** el campo `password_hash` no contiene texto plano y el hash empieza con `$2b$12$`
