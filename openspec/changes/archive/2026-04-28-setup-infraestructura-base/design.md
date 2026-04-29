## Context

El repositorio parte de cero: solo existen documentación en `docs/` y stubs vacíos en `backend/` y `frontend/`. El diseño debe establecer las convenciones que todos los incrementos posteriores (auth, catálogo, pedidos, pagos) asumirán como invariantes. Cualquier decisión tomada aquí es costosa de cambiar después porque todos los módulos dependen de ella.

Stack obligatorio definido en `docs/Descripcion.txt` y `docs/Integrador.txt`:
- Backend: FastAPI 0.111+, SQLModel 0.0.19+, PostgreSQL 15+, Alembic 1.13+, pydantic-settings
- Frontend: React 18, TypeScript 5 strict, Vite 5, Zustand 4, TanStack Query v5, Axios 1, Tailwind CSS 3

## Goals / Non-Goals

**Goals:**
- Directorio `backend/` con `app/` feature-first ejecutable (`uvicorn app.main:app`)
- Directorio `frontend/` con proyecto Vite ejecutable (`npm run dev`)
- 16 modelos SQLModel mapeando el ERD v5 con todas las constraints
- `BaseRepository[T]` genérico y `UnitOfWork` context-manager en `app/core/`
- Dependencias FastAPI `get_current_user` y `require_role` reutilizables
- Manejador global de errores RFC 7807 (Problem Details)
- 4 stores Zustand con persist según spec + instancia Axios con interceptores
- Alembic configurado + migración inicial + seed de datos

**Non-Goals:**
- Lógica de negocio de ningún módulo (auth endpoints, catálogo, pedidos, pagos)
- Tests (se agregan en cada change de feature)
- Deploy / Docker / CI-CD
- Panel de administración

## Decisions

### D-01: Estructura feature-first en backend
**Decisión**: `app/{modulo}/router.py | service.py | repository.py | models.py | schemas.py`  
**Alternativa descartada**: estructura por capa (`routers/`, `services/`, `repositories/`)  
**Razón**: La estructura por feature permite mover o eliminar un módulo completo tocando un solo directorio. La estructura por capa fuerza cambios en múltiples carpetas para cada feature y dificulta el encapsulamiento.

### D-02: SQLModel como ORM
**Decisión**: SQLModel (hereda SQLAlchemy + Pydantic v2) en lugar de SQLAlchemy puro  
**Alternativa descartada**: SQLAlchemy + Pydantic schemas separados  
**Razón**: SQLModel elimina la duplicación modelo/schema para casos simples. Los casos complejos (snapshots, paginación) igualmente definen schemas Pydantic separados, pero la base gana consistencia.

### D-03: BaseRepository[T] genérico con TypeVar
**Decisión**: `BaseRepository[T]` con `get_by_id`, `list_all`, `count`, `create`, `update`, `soft_delete`, `hard_delete`. Todos los repositorios concretos heredan de él.  
**Razón**: Elimina boilerplate CRUD repetido en 8+ módulos. El costo: operaciones muy específicas (queries con JOINs complejos) se agregan como métodos adicionales en el repo concreto.

### D-04: UnitOfWork como context-manager
**Decisión**: `class UnitOfWork` con `__enter__`/`__exit__`; commit en `__exit__` normal, rollback en excepción. Expone `self.usuarios`, `self.productos`, etc. como atributos lazy-init.  
**Razón**: Garantiza que un service nunca deja una transacción a medias. El service recibe la UoW por inyección de dependencia FastAPI, facilitando el testing (se puede mockear la UoW).

### D-05: Pydantic Settings para configuración
**Decisión**: `class Settings(BaseSettings)` en `app/core/config.py` leyendo `.env`  
**Razón**: Validación de tipos en startup (el servidor no arranca si falta `DATABASE_URL`). Las variables quedan documentadas en código y en `.env.example`.

### D-06: RFC 7807 Problem Details para errores
**Decisión**: Manejador global que convierte `HTTPException` y excepciones de dominio en `{"type", "title", "status", "detail", "instance"}`.  
**Razón**: Requerido por la spec del proyecto. Estandariza el contrato de error para el frontend y facilita debugging.

### D-07: Feature-Sliced Design (FSD) en frontend
**Decisión**: Capas `app/ → pages/ → widgets/ → features/ → entities/ → shared/`. Regla: una capa solo puede importar de capas inferiores.  
**Alternativa descartada**: estructura ad-hoc por tipo (`components/`, `hooks/`, `utils/`)  
**Razón**: Requerido por la spec del proyecto. Previene el acoplamiento entre features que hace inmantenibles las SPA grandes.

### D-08: Zustand con persist selectivo
**Decisión**: 4 stores con middleware `persist` según tabla de la spec:
- `authStore`: persiste solo `accessToken`
- `cartStore`: persiste `items` completo
- `paymentStore`: sin persist (estado transitorio)
- `uiStore`: persiste `theme`

**Razón**: Evita que el estado de pago sobreviva recargas (riesgo de doble cobro si el usuario retorna al checkout). El carrito sobrevive para UX.

### D-09: Axios con interceptores de auth
**Decisión**: Instancia única en `shared/api/axios.ts` con interceptor de request (inyecta Bearer token desde `authStore`) e interceptor de response (detecta 401 y llama refresh — esqueleto para CH-01).  
**Razón**: Centraliza la lógica de auth HTTP. Todos los hooks de TanStack Query usan esta instancia sin duplicar headers.

## Risks / Trade-offs

- **[Riesgo] SQLModel v0.0.19 tiene breaking changes frecuentes** → Pinar versión exacta en `requirements.txt`; no usar `>=` sin techo.
- **[Riesgo] Alembic autogenerate no detecta constraints complejas** (CHECK, EXCLUDE) → Revisar y editar la migración inicial manualmente antes de `upgrade head`.
- **[Riesgo] `persist` de Zustand con `accessToken` en localStorage** es vulnerable a XSS → Mitigación parcial en CH-01 via HttpOnly refresh cookie; aceptado como trade-off de arquitectura SPA.
- **[Trade-off] UoW expone todos los repos como atributos** → Acoplamiento entre UoW y todos los módulos. Alternativa (repos inyectados individualmente) complica la firma de los services. Aceptado.
- **[Riesgo] Seed de datos con contraseñas en texto plano en el script** → El seed hashea las contraseñas con bcrypt en runtime; nunca guardar hashes pre-computados en el repo.

## Migration Plan

1. Crear `backend/` desde cero: `requirements.txt`, estructura `app/`, `alembic.ini`
2. Crear `frontend/` desde cero: `npm create vite`, instalar dependencias
3. Ejecutar `alembic revision --autogenerate -m "initial"` y revisar la migración
4. Ejecutar `alembic upgrade head`
5. Ejecutar `python -m app.db.seed`
6. Verificar `uvicorn app.main:app --reload` y `npm run dev` sin errores
7. Sin rollback necesario (no existe estado previo)

## Open Questions

- ¿PostgreSQL corre en local o en contenedor Docker? → No afecta el código; el `DATABASE_URL` en `.env` abstrae la diferencia.
- ¿Se agrega `pytest` y `httpx` como dev-dependencies en este change? → Sí, para habilitar `pytest -x` en CH-01+; pero no se escriben tests aquí.
