## 1. Schemas (schemas.py)

- [ ] 1.1 Definir `CategoriaCreate` con campos: nombre (str), slug (str), parent_id (Optional[int])
- [ ] 1.2 Definir `CategoriaUpdate` con todos los campos opcionales
- [ ] 1.3 Definir `CategoriaRead` con id, nombre, slug, parent_id, created_at
- [ ] 1.4 Definir `CategoriaWithChildren` extendiendo `CategoriaRead` con campo `hijos: list[CategoriaRead]`

## 2. Repositorio (repository.py)

- [ ] 2.1 Crear `CategoriaRepository` heredando `BaseRepository[Categoria]`
- [ ] 2.2 Implementar `get_all_active()` → lista de categorías con `deleted_at IS NULL`
- [ ] 2.3 Implementar `get_active_by_id(id)` → categoría activa o None
- [ ] 2.4 Implementar `get_by_slug(slug)` → categoría por slug (incluyendo eliminadas, para validación)
- [ ] 2.5 Implementar `get_children(parent_id)` → hijos directos activos
- [ ] 2.6 Implementar `get_descendants(id)` → todos los descendientes usando CTE recursiva (`WITH RECURSIVE`)
- [ ] 2.7 Implementar `has_active_products(id)` → bool, si la categoría tiene productos activos en `producto_categorias`

## 3. Servicio (service.py)

- [ ] 3.1 Implementar `list_categorias(uow)` → llama `repo.get_all_active()`
- [ ] 3.2 Implementar `get_categoria(id, uow)` → retorna `CategoriaWithChildren` con hijos directos; 404 si no existe
- [ ] 3.3 Implementar `create_categoria(data, uow)` → valida slug único (409), valida parent existe (404), crea y retorna
- [ ] 3.4 Implementar `update_categoria(id, data, uow)` → valida slug único (409), valida anti-ciclo con `get_descendants` (422), actualiza
- [ ] 3.5 Implementar `delete_categoria(id, uow)` → valida hijos activos (409), valida productos activos (409), hace soft delete

## 4. Router (router.py)

- [ ] 4.1 `GET /` → `list_categorias`, público, retorna `list[CategoriaRead]`
- [ ] 4.2 `GET /{id}` → `get_categoria`, público, retorna `CategoriaWithChildren`
- [ ] 4.3 `POST /` → `create_categoria`, requiere rol ADMIN, retorna `CategoriaRead` con 201
- [ ] 4.4 `PATCH /{id}` → `update_categoria`, requiere rol ADMIN, retorna `CategoriaRead`
- [ ] 4.5 `DELETE /{id}` → `delete_categoria`, requiere rol ADMIN, retorna 204

## 5. UoW — actualizar repositorio

- [ ] 5.1 Cambiar `uow.categorias` de `BaseRepository[Categoria]` a `CategoriaRepository` en `core/uow.py`

## 6. Verificación

- [ ] 6.1 Reiniciar backend y confirmar que `GET /api/v1/categorias` retorna lista del seed
- [ ] 6.2 Probar `POST /api/v1/categorias` desde Swagger con token ADMIN
- [ ] 6.3 Probar `PATCH` con parent_id circular y verificar 422
- [ ] 6.4 Probar `DELETE` de categoría con hijos y verificar 409
- [ ] 6.5 Probar `DELETE` exitoso y verificar que no aparece en listado
