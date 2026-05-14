## 1. Schemas Pydantic

- [x] 1.1 Reescribir `ingredientes/schemas.py`: definir `IngredienteCreate` (nombre str max 100, es_alergeno bool default False)
- [x] 1.2 Agregar `IngredienteUpdate` con campos opcionales `nombre` y `es_alergeno`
- [x] 1.3 Agregar `IngredienteRead` con campos `id`, `nombre`, `es_alergeno`, `created_at`
- [x] 1.4 Agregar `ProductoIngredienteRead` con campos `producto_id`, `ingrediente_id`, `es_removible`

## 2. Repository

- [x] 2.1 Implementar `get_by_nombre(nombre: str) -> Ingrediente | None` en `IngredienteRepository`
- [x] 2.2 Implementar `list_alergenos() -> list[Ingrediente]` (filter `es_alergeno == True`)
- [x] 2.3 Implementar `has_productos_asociados(ingrediente_id: int) -> bool` (query a `producto_ingredientes`)

## 3. Service

- [x] 3.1 Implementar `listar(uow, skip, limit) -> list[Ingrediente]` usando `uow.ingredientes.list_all`
- [x] 3.2 Implementar `listar_alergenos(uow) -> list[Ingrediente]` usando `uow.ingredientes.list_alergenos`
- [x] 3.3 Implementar `obtener(uow, id) -> Ingrediente` con 404 si no existe
- [x] 3.4 Implementar `crear(uow, data: IngredienteCreate) -> Ingrediente` con 409 si nombre duplicado
- [x] 3.5 Implementar `actualizar(uow, id, data: IngredienteUpdate) -> Ingrediente` con 404/409
- [x] 3.6 Implementar `eliminar(uow, id) -> None` con 404 y 409 si tiene productos asociados

## 4. Router

- [x] 4.1 Implementar `GET /api/v1/ingredientes` con params `skip`, `limit`, `solo_alergenos: bool = False`; `response_model=list[IngredienteRead]`
- [x] 4.2 Implementar `GET /api/v1/ingredientes/{id}` público; `response_model=IngredienteRead`
- [x] 4.3 Implementar `POST /api/v1/ingredientes` con `Depends(require_role("ADMIN"))`; `response_model=IngredienteRead`; status `201`
- [x] 4.4 Implementar `PATCH /api/v1/ingredientes/{id}` con `Depends(require_role("ADMIN"))`; `response_model=IngredienteRead`
- [x] 4.5 Implementar `DELETE /api/v1/ingredientes/{id}` con `Depends(require_role("ADMIN"))`; status `204`

## 5. Unit of Work

- [x] 5.1 Actualizar `core/uow.py`: importar `IngredienteRepository` desde `app.ingredientes.repository`
- [x] 5.2 Cambiar tipo de `self.ingredientes` de `BaseRepository[Ingrediente]` a `IngredienteRepository`
- [x] 5.3 Actualizar import de `Ingrediente` en `_init_repositories`: usar `app.ingredientes.models` directamente (no via `app.productos.models`)

## 6. Verificación

- [x] 6.1 Arrancar uvicorn y verificar que no hay errores de startup
- [x] 6.2 `GET /api/v1/ingredientes` retorna `200 []` (sin datos iniciales)
- [x] 6.3 `POST /api/v1/ingredientes` con token ADMIN crea ingrediente y retorna `201`
- [x] 6.4 `POST /api/v1/ingredientes` con nombre duplicado retorna `409`
- [x] 6.5 `GET /api/v1/ingredientes?solo_alergenos=true` retorna solo alérgenos
- [x] 6.6 `PATCH /api/v1/ingredientes/{id}` actualiza correctamente
- [x] 6.7 `DELETE /api/v1/ingredientes/{id}` retorna `204` si sin productos asociados
- [x] 6.8 `DELETE` retorna `409` si el ingrediente tiene productos asociados
- [x] 6.9 `GET /api/v1/ingredientes/{id}` sin auth retorna `200` (endpoint público)
- [x] 6.10 `POST /api/v1/ingredientes` sin token retorna `401`
