## ADDED Requirements

### Requirement: Módulo ingredientes independiente
El módulo `app/ingredientes/` SHALL existir como dominio separado. SHALL contener los archivos `models.py`, `schemas.py`, `repository.py`, `service.py`, `router.py`. El modelo `Ingrediente` SHALL vivir únicamente en `app/ingredientes/models.py` y NO en `app/productos/models.py`. El modelo `ProductoIngrediente` (tabla de join M:M) SHALL permanecer en `app/productos/models.py` dado que `Producto` es el propietario de la relación.

#### Scenario: Importación desde módulo correcto
- **WHEN** se importa `from app.ingredientes.models import Ingrediente`
- **THEN** la importación resuelve sin error y la clase es el modelo SQLModel con `__tablename__ = "ingredientes"`

#### Scenario: ProductoIngrediente permanece en productos
- **WHEN** se inspecciona `app/productos/models.py`
- **THEN** el archivo define `ProductoIngrediente` (la tabla de join) e importa `Ingrediente` desde `app.ingredientes.models`

---

### Requirement: IngredienteRepository scaffold
La clase `IngredienteRepository(BaseRepository[Ingrediente])` en `app/ingredientes/repository.py` SHALL heredar de `BaseRepository[Ingrediente]`. En esta etapa (CH-02) SHALL ser un scaffold con `pass` — la implementación real se completa en CH-07.

#### Scenario: Instanciación válida
- **WHEN** se instancia `IngredienteRepository(session=session)`
- **THEN** la instancia se crea sin errores y hereda los métodos CRUD de `BaseRepository`

---

### Requirement: IngredienteService scaffold
La clase `IngredienteService` en `app/ingredientes/service.py` SHALL existir como scaffold vacío. Se implementa en CH-07.

#### Scenario: Importación del servicio
- **WHEN** se importa `from app.ingredientes.service import IngredienteService`
- **THEN** la importación resuelve sin error

---

### Requirement: Router de ingredientes registrado
El archivo `app/ingredientes/router.py` SHALL definir un `APIRouter` con `prefix="/api/v1/ingredientes"` y `tags=["ingredientes"]`. En esta etapa será placeholder sin endpoints. SHALL estar registrado en `app/main.py`.

#### Scenario: Registro sin errores en startup
- **WHEN** arranca `uvicorn app.main:app`
- **THEN** el router de ingredientes está montado sin errores de startup
