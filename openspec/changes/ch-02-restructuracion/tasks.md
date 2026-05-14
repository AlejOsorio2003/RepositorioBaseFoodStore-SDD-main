## 1. Nuevo módulo refreshtokens

- [ ] 1.1 Crear `backend/app/refreshtokens/__init__.py` vacío
- [ ] 1.2 Crear `backend/app/refreshtokens/models.py` con el modelo `RefreshToken` (mover desde `auth/models.py`, mantener `__tablename__ = "refresh_tokens"` y todos los campos/FKs)
- [ ] 1.3 Crear `backend/app/refreshtokens/schemas.py` con scaffold de schemas Pydantic (clases vacías por ahora: `RefreshTokenCreate`, `RefreshTokenRead`)
- [ ] 1.4 Crear `backend/app/refreshtokens/repository.py` con `RefreshTokenRepository(BaseRepository[RefreshToken])` — scaffold con `pass`
- [ ] 1.5 Crear `backend/app/refreshtokens/service.py` con `RefreshTokenService` — scaffold vacío
- [ ] 1.6 Crear `backend/app/refreshtokens/router.py` con `APIRouter(prefix="/api/v1/refresh-tokens", tags=["refresh-tokens"])` vacío
- [ ] 1.7 Actualizar `backend/app/auth/models.py`: eliminar definición de `RefreshToken` y agregar import desde `app.refreshtokens.models` para compatibilidad temporal
- [ ] 1.8 Actualizar `backend/app/auth/service.py`: actualizar import de `RefreshToken` al nuevo path `app.refreshtokens.models`

## 2. Nuevo módulo ingredientes

- [ ] 2.1 Crear `backend/app/ingredientes/__init__.py` vacío
- [ ] 2.2 Crear `backend/app/ingredientes/models.py` con el modelo `Ingrediente` (mover desde `productos/models.py`, mantener `__tablename__ = "ingredientes"`)
- [ ] 2.3 Crear `backend/app/ingredientes/schemas.py` con scaffold (`IngredienteCreate`, `IngredienteRead`)
- [ ] 2.4 Crear `backend/app/ingredientes/repository.py` con `IngredienteRepository(BaseRepository[Ingrediente])` — scaffold con `pass`
- [ ] 2.5 Crear `backend/app/ingredientes/service.py` con `IngredienteService` — scaffold vacío
- [ ] 2.6 Crear `backend/app/ingredientes/router.py` con `APIRouter(prefix="/api/v1/ingredientes", tags=["ingredientes"])` vacío
- [ ] 2.7 Actualizar `backend/app/productos/models.py`: eliminar definición de `Ingrediente`, agregar `from app.ingredientes.models import Ingrediente` para mantener `ProductoIngrediente` (que referencia `Ingrediente`)

## 3. Nuevo módulo direcciones

- [ ] 3.1 Crear `backend/app/direcciones/__init__.py` vacío
- [ ] 3.2 Crear `backend/app/direcciones/models.py` con el modelo `DireccionEntrega` (mover desde `usuarios/models.py`, mantener `__tablename__ = "direcciones_entrega"`)
- [ ] 3.3 Crear `backend/app/direcciones/schemas.py` con scaffold (`DireccionCreate`, `DireccionRead`)
- [ ] 3.4 Crear `backend/app/direcciones/repository.py` con `DireccionRepository(BaseRepository[DireccionEntrega])` — scaffold con `pass`
- [ ] 3.5 Crear `backend/app/direcciones/service.py` con `DireccionService` — scaffold vacío
- [ ] 3.6 Crear `backend/app/direcciones/router.py` con `APIRouter(prefix="/api/v1/direcciones", tags=["direcciones"])` vacío
- [ ] 3.7 Actualizar `backend/app/usuarios/models.py`: eliminar definición de `DireccionEntrega`

## 4. Scaffolding capas faltantes — módulos existentes

- [ ] 4.1 Crear `backend/app/usuarios/schemas.py` con scaffold (`UsuarioCreate`, `UsuarioRead`, `UsuarioUpdate`)
- [ ] 4.2 Crear `backend/app/usuarios/repository.py` con `UsuarioRepository(BaseRepository[Usuario])` — scaffold con `pass` + comentario `# Implementado en CH-09`
- [ ] 4.3 Crear `backend/app/usuarios/service.py` con `UsuarioService` — scaffold vacío + comentario `# Implementado en CH-09`
- [ ] 4.4 Crear `backend/app/categorias/schemas.py` con scaffold (`CategoriaCreate`, `CategoriaRead`)
- [ ] 4.5 Crear `backend/app/categorias/repository.py` con `CategoriaRepository(BaseRepository[Categoria])` — scaffold + comentario `# Implementado en CH-03`
- [ ] 4.6 Crear `backend/app/categorias/service.py` con `CategoriaService` — scaffold + comentario `# Implementado en CH-03`
- [ ] 4.7 Crear `backend/app/productos/schemas.py` con scaffold (`ProductoCreate`, `ProductoRead`, `ProductoUpdate`)
- [ ] 4.8 Crear `backend/app/productos/repository.py` con `ProductoRepository(BaseRepository[Producto])` — scaffold + comentario `# Implementado en CH-05`
- [ ] 4.9 Crear `backend/app/productos/service.py` con `ProductoService` — scaffold + comentario `# Implementado en CH-05`
- [ ] 4.10 Crear `backend/app/pedidos/schemas.py` con scaffold (`PedidoCreate`, `PedidoRead`)
- [ ] 4.11 Crear `backend/app/pedidos/repository.py` con `PedidoRepository(BaseRepository[Pedido])` — scaffold + comentario `# Implementado en CH-10`
- [ ] 4.12 Crear `backend/app/pedidos/service.py` con `PedidoService` — scaffold + comentario `# Implementado en CH-10`
- [ ] 4.13 Crear `backend/app/pagos/schemas.py` con scaffold (`PagoCreate`, `PagoRead`)
- [ ] 4.14 Crear `backend/app/pagos/repository.py` con `PagoRepository(BaseRepository[Pago])` — scaffold + comentario `# Implementado en CH-12`
- [ ] 4.15 Crear `backend/app/pagos/service.py` con `PagoService` — scaffold + comentario `# Implementado en CH-12`
- [ ] 4.16 Crear `backend/app/admin/models.py` vacío (sin tablas propias en esta etapa)
- [ ] 4.17 Crear `backend/app/admin/schemas.py` con scaffold (`MetricasRead`)
- [ ] 4.18 Crear `backend/app/admin/repository.py` con `AdminRepository` — scaffold + comentario `# Implementado en CH-14`
- [ ] 4.19 Crear `backend/app/admin/service.py` con `AdminService` — scaffold + comentario `# Implementado en CH-14`

## 5. Actualizar all_models.py y main.py

- [ ] 5.1 Reescribir `backend/app/core/all_models.py` para importar todos los modelos desde sus nuevos paths correctos (ver diseño D1)
- [ ] 5.2 Agregar imports y `app.include_router()` para `refreshtokens`, `ingredientes` y `direcciones` en `backend/app/main.py`
- [ ] 5.3 Verificar que `backend/app/db/seed.py` no tenga imports de modelos movidos (actualizar si es necesario)

## 6. Verificación backend

- [ ] 6.1 Ejecutar `python -c "from app.core.all_models import *"` — debe completar sin errores
- [ ] 6.2 Ejecutar `alembic check` — debe reportar "No new upgrade operations detected"
- [ ] 6.3 Ejecutar `uvicorn app.main:app --reload` — debe arrancar sin errores y responder 200 en `GET /health`

## 7. Frontend — Corregir estructura FSD

- [ ] 7.1 Eliminar el directorio `frontend/src/widgets/` (está vacío)
- [ ] 7.2 Crear `frontend/src/features/index.ts` con `export {}` y comentario de intención
- [ ] 7.3 Crear `frontend/src/entities/index.ts` con `export {}` y comentario de intención
- [ ] 7.4 Reescribir `frontend/src/shared/types/index.ts` con los tipos base: `UUID`, `ISODateString`, `PaginatedResponse<T>`, `ApiError`
- [ ] 7.5 Actualizar `frontend/src/shared/ui/index.ts` con `export {}` y comentario de intención (si no existe, crearlo)
- [ ] 7.6 Actualizar `frontend/src/shared/lib/index.ts` con `export {}` y comentario de intención (si no existe, crearlo)

## 8. Verificación frontend

- [ ] 8.1 Ejecutar `npx tsc --noEmit` en `frontend/` — debe pasar sin errores
- [ ] 8.2 Verificar que `src/widgets/` no existe en el árbol de directorios
- [ ] 8.3 Verificar que `from '@/shared/types'` importa correctamente `UUID`, `PaginatedResponse`, `ApiError`
