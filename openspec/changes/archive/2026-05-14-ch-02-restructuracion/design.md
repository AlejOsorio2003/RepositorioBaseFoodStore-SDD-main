## Context

El proyecto FoodStore fue inicializado en CH-00 con scaffold completo de directorios y modelos SQLModel (ERD v5: 16 tablas). Sin embargo, por razones de velocidad de setup inicial, varios modelos quedaron agrupados en módulos que no son su dominio natural y todas las capas de negocio (service, repository, schemas) de los módulos no-auth quedaron vacías. El estado actual es:

- `auth/models.py` contiene `RefreshToken` (debería ser `refreshtokens/`)
- `productos/models.py` contiene `Ingrediente`, `ProductoIngrediente`, `FormaPago` (Ingrediente debería ser `ingredientes/`)
- `usuarios/models.py` contiene `DireccionEntrega` (debería ser `direcciones/`)
- `usuarios`, `categorias`, `productos`, `pedidos`, `pagos`, `admin` tienen solo `models.py` y `router.py` vacío
- `frontend/src/widgets/` existe pero no es parte de FSD
- `frontend/src/features/`, `entities/` existen pero están vacíos sin ningún barrel

La migración Alembic existente ya generó las tablas correctas en PostgreSQL. Las tablas en BD **no cambian** — solo cambia dónde vive el código Python que las define.

## Goals / Non-Goals

**Goals:**
- Mover modelos a sus módulos de dominio correctos sin alterar las tablas de BD
- Crear scaffolding mínimo (`schemas.py`, `repository.py`, `service.py`) para todos los módulos
- Mantener `core/all_models.py` como punto único de importación para Alembic
- Corregir estructura FSD del frontend: eliminar `widgets/`, agregar barrels y tipos base
- Dejar todos los módulos listos para que CHs posteriores solo agreguen implementación

**Non-Goals:**
- Implementar lógica de negocio en los services/repositories (eso es de CH-03 en adelante)
- Crear endpoints funcionales (los routers permanecen como placeholders)
- Nuevas migraciones de Alembic
- Cambios en contratos de API existentes

## Decisions

### D1: Mover modelos sin nueva migración Alembic

**Decisión:** Mover los modelos Python a nuevos módulos pero mantener exactamente los mismos `__tablename__` y columnas. Actualizar `core/all_models.py` para importar desde los nuevos paths. No ejecutar `alembic revision --autogenerate`.

**Alternativa considerada:** Generar una nueva revisión de migración vacía para documentar el cambio. Descartado porque Alembic detecta los cambios por `__tablename__`, no por path del módulo Python — si el nombre de tabla no cambia, la migración queda vacía y solo agrega ruido.

**Rationale:** El ORM de SQLModel vincula modelos a tablas mediante `__tablename__`, no mediante el path de importación. Mover el archivo Python es puramente una decisión de organización de código.

### D2: Scaffolding mínimo (no implementación)

**Decisión:** Los nuevos `schemas.py`, `repository.py`, `service.py` se crean con la estructura correcta (clase con herencia, imports, typing) pero sin lógica de negocio. Los métodos que vendrán se documentan como `pass` o `raise NotImplementedError`.

```python
# Ejemplo repository scaffold
class UsuarioRepository(BaseRepository[Usuario]):
    pass  # Implementado en CH-09
```

**Alternativa considerada:** Crear los archivos completamente vacíos (solo el `import`). Descartado porque un scaffold con la clase correctamente definida permite que los tests y type-checkers funcionen desde el día uno.

### D3: `FormaPago` permanece en `productos/models.py`

**Decisión:** `FormaPago` (enum) no se mueve a `pagos/` aún porque está íntimamente acoplado al modelo `Producto` (campo `formas_pago`). Se moverá naturalmente cuando CH-12 implemente el módulo de pagos.

**Rationale:** Moverlo ahora requeriría actualizar el modelo `Producto` y potencialmente afectar la migración existente. El costo de moverlo ahora supera el beneficio.

### D4: `ProductoIngrediente` permanece en `productos/models.py`

**Decisión:** La tabla de relación M:M entre `Producto` e `Ingrediente` queda en `productos/models.py` porque `Producto` es el propietario de la relación en el ORM (define `relationship`).

**Rationale:** En SQLModel/SQLAlchemy, la tabla de join M:M vive con el modelo que define la relación principal. `productos/models.py` importará desde `ingredientes/models.py` para referenciar `Ingrediente`.

### D5: Frontend — eliminar `widgets/` sin reemplazar

**Decisión:** Eliminar `frontend/src/widgets/` completamente. No crear un directorio de reemplazo.

**Alternativa considerada:** Renombrar a `features/` y mover contenido allí. Descartado porque `widgets/` está completamente vacío — solo existe el directorio, no hay código que migrar.

## Risks / Trade-offs

- **[Riesgo] Import circular entre módulos** → Los módulos que se referencian mutuamente (ej: `productos` importa `ingredientes`) deben hacerlo con imports tardíos o `TYPE_CHECKING`. Mitigación: revisar imports en `all_models.py` con `python -c "from app.core.all_models import *"` tras cada movimiento.

- **[Riesgo] Alembic pierde tracking de modelos** → Si `all_models.py` no importa un modelo, Alembic lo "ve como eliminado" y podría generar DROP TABLE en la próxima revisión automática. Mitigación: verificar que cada tabla sigue apareciendo en `alembic/env.py` → `target_metadata`.

- **[Trade-off] Scaffolding vacío puede confundir** → Archivos con clases vacías podrían parecer implementación real. Mitigación: agregar comentario `# Implementado en CH-XX` en cada método placeholder.

## Migration Plan

1. Crear los nuevos módulos con sus modelos (refreshtokens, ingredientes, direcciones)
2. Actualizar `auth/models.py` para eliminar `RefreshToken` (y dejar import de compatibilidad temporario si `auth/service.py` lo referencia)
3. Actualizar todos los imports del codebase que referencien los modelos movidos
4. Actualizar `core/all_models.py`
5. Verificar Alembic: `alembic check` debe reportar "No new upgrade operations detected"
6. Crear scaffolding de capas faltantes en módulos existentes
7. Registrar nuevos routers en `main.py`
8. Frontend: eliminar `widgets/`, agregar barrels, definir tipos base

**Rollback:** revertir todos los archivos Python a su estado anterior mediante `git revert`. No hay operaciones de BD, por lo que el rollback es seguro.

## Open Questions

- ¿`DireccionEntrega` debería tener su propio router ahora o solo el módulo sin router registrado? → Decisión: registrar router placeholder en `/api/v1/direcciones` para mantener coherencia con el resto.
- ¿Los tipos base en `shared/types/index.ts` deben incluir tipos de respuesta de auth (`TokenResponse`, `UserResponse`)? → Decisión: no por ahora; esos tipos irán en `entities/auth/` cuando CH-01 se complete en frontend.
