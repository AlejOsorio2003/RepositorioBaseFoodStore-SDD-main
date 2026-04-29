## Why

Food Store no tiene ningún código ejecutable: el repositorio entrega solo documentación y stubs vacíos. Sin una infraestructura base homologada todos los incrementos posteriores (auth, catálogo, pedidos, pagos) dependen de convenciones no escritas que generan deuda técnica o divergencia entre backend y frontend.

## What Changes

- **Backend**: Proyecto FastAPI inicializado con estructura feature-first (`app/`), dependencias pinadas en `requirements.txt`, configuración de entorno vía `pydantic-settings`, middleware CORS y manejador global de errores RFC 7807.
- **Base de datos**: Conexión SQLModel + PostgreSQL, 16 tablas del ERD v5 declaradas como modelos SQLModel, migraciones iniciales con Alembic, script de seed con datos de prueba.
- **Capa de datos compartida**: `BaseRepository[T]` genérico tipado y context-manager `UnitOfWork` que expone todos los repositorios.
- **Seguridad compartida**: dependencias FastAPI `get_current_user` y `require_role(roles)` reutilizables por todos los módulos.
- **Frontend**: Proyecto React 18 + TypeScript strict + Vite 5 inicializado con Feature-Sliced Design, Tailwind CSS 3 configurado, `react-router-dom` con shell de rutas vacías.
- **Estado global**: 4 stores Zustand 4 pre-configurados (`authStore`, `cartStore`, `paymentStore`, `uiStore`) con `persist` según spec.
- **Comunicación HTTP**: instancia Axios con `baseURL = VITE_API_URL`, interceptor de request para inyectar Bearer token, interceptor de response para refresh silencioso (esqueleto).

## Capabilities

### New Capabilities

- `backend-infra`: Proyecto FastAPI, modelos SQLModel del ERD v5, BaseRepository[T], UnitOfWork, dependencias de seguridad reutilizables, manejador RFC 7807, configuración Alembic y seed.
- `frontend-infra`: Proyecto React+Vite+TS, estructura FSD, Tailwind, Zustand stores con persist, instancia Axios con interceptores, shell de rutas.

### Modified Capabilities

## Impact

- **backend/**: Directorio creado desde cero; todos los módulos de negocio futuros importan desde `app/core/` (BaseRepository, UoW, seguridad, errores).
- **frontend/**: Directorio creado desde cero; todas las features futuras siguen la estructura FSD y consumen los stores y la instancia Axios aquí definidos.
- **Dependencias externas**: FastAPI 0.111+, SQLModel 0.0.19+, Alembic 1.13+, psycopg2-binary, pydantic-settings, python-jose[cryptography], passlib[bcrypt], slowapi, mercadopago; React 18, TypeScript 5, Vite 5, TanStack Query v5, Zustand 4, Axios 1, Tailwind CSS 3.
- **Sin breaking changes** (no existe código previo).
