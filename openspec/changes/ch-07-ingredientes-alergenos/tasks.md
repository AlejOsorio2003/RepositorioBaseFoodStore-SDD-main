## 1. Schemas Pydantic

- [ ] 1.1 Reescribir `ingredientes/schemas.py`: definir `IngredienteCreate` (nombre str max 100, es_alergeno bool default False)
- [ ] 1.2 Agregar `IngredienteUpdate` con campos opcionales `nombre` y `es_alergeno`
- [ ] 1.3 Agregar `IngredienteRead` con campos `id`, `nombre`, `es_alergeno`, `created_at`
- [ ] 1.4 Agregar `ProductoIngredienteRead` con campos `producto_id`, `ingrediente_id`, `es_removible`

## 2. Repository

- [ ] 2.1 Implementar `get_by_nombre(nombre: str) -> Ingrediente | None` en `IngredienteRepository`
- [ ] 2.2 Implementar `list_alergenos() -> list[Ingrediente]` (filter `es_alergeno == True`)
- [ ] 2.3 Implementar `has_productos_asociados(ingrediente_id: int) -> bool` (query a `producto_ingredientes`)

## 3. Service

- [ ] 3.1 Implementar `listar(uow, skip, limit) -> list[Ingrediente]` usando `uow.ingredientes.list_all`
- [ ] 3.2 Implementar `listar_alergenos(uow) -> list[Ingrediente]` usando `uow.ingredientes.list_alergenos`
- [ ] 3.3 Implementar `obtener(uow, id) -> Ingrediente` con 404 si no existe
- [ ] 3.4 Implementar `crear(uow, data: IngredienteCreate) -> Ingrediente` con 409 si nombre duplicado
- [ ] 3.5 Implementar `actualizar(uow, id, data: IngredienteUpdate) -> Ingrediente` con 404/409
- [ ] 3.6 Implementar `eliminar(uow, id) -> None` con 404 y 409 si tiene productos asociados

## 4. Router

- [ ] 4.1 Implementar `GET /api/v1/ingredientes` con params `skip`, `limit`, `solo_alergenos: bool = False`; `response_model=list[IngredienteRead]`
- [ ] 4.2 Implementar `GET /api/v1/ingredientes/{id}` público; `response_model=IngredienteRead`
- [ ] 4.3 Implementar `POST /api/v1/ingredientes` con `Depends(require_role("ADMIN"))`; `response_model=IngredienteRead`; status `201`
- [ ] 4.4 Implementar `PATCH /api/v1/ingredientes/{id}` con `Depends(require_role("ADMIN"))`; `response_model=IngredienteRead`
- [ ] 4.5 Implementar `DELETE /api/v1/ingredientes/{id}` con `Depends(require_role("ADMIN"))`; status `204`

## 5. Unit of Work

- [ ] 5.1 Actualizar `core/uow.py`: importar `IngredienteRepository` desde `app.ingredientes.repository`
- [ ] 5.2 Cambiar tipo de `self.ingredientes` de `BaseRepository[Ingrediente]` a `IngredienteRepository`
- [ ] 5.3 Actualizar import de `Ingrediente` en `_init_repositories`: usar `app.ingredientes.models` directamente (no via `app.productos.models`)

## 6. Verificación

- [ ] 6.1 Arrancar uvicorn y verificar que no hay errores de startup
- [ ] 6.2 `GET /api/v1/ingredientes` retorna `200 []` (sin datos iniciales)
- [ ] 6.3 `POST /api/v1/ingredientes` con token ADMIN crea ingrediente y retorna `201`
- [ ] 6.4 `POST /api/v1/ingredientes` con nombre duplicado retorna `409`
- [ ] 6.5 `GET /api/v1/ingredientes?solo_alergenos=true` retorna solo alérgenos
- [ ] 6.6 `PATCH /api/v1/ingredientes/{id}` actualiza correctamente
- [ ] 6.7 `DELETE /api/v1/ingredientes/{id}` retorna `204` si sin productos asociados
- [ ] 6.8 `DELETE` retorna `409` si el ingrediente tiene productos asociados
- [ ] 6.9 `GET /api/v1/ingredientes/{id}` sin auth retorna `200` (endpoint público)
- [ ] 6.10 `POST /api/v1/ingredientes` sin token retorna `401`
