## ADDED Requirements

### Requirement: Módulo direcciones independiente
El módulo `app/direcciones/` SHALL existir como dominio separado. SHALL contener los archivos `models.py`, `schemas.py`, `repository.py`, `service.py`, `router.py`. El modelo `DireccionEntrega` SHALL vivir únicamente en `app/direcciones/models.py` y NO en `app/usuarios/models.py`.

#### Scenario: Importación desde módulo correcto
- **WHEN** se importa `from app.direcciones.models import DireccionEntrega`
- **THEN** la importación resuelve sin error y la clase es el modelo SQLModel con `__tablename__ = "direcciones_entrega"`

#### Scenario: No existe DireccionEntrega en usuarios
- **WHEN** se inspecciona `app/usuarios/models.py`
- **THEN** el archivo no define `DireccionEntrega` (importa desde `app.direcciones.models` si necesita referenciarla)

---

### Requirement: DireccionRepository scaffold
La clase `DireccionRepository(BaseRepository[DireccionEntrega])` en `app/direcciones/repository.py` SHALL heredar de `BaseRepository[DireccionEntrega]`. En esta etapa (CH-02) SHALL ser scaffold con `pass` — la implementación real se completa en CH-08.

#### Scenario: Instanciación válida
- **WHEN** se instancia `DireccionRepository(session=session)`
- **THEN** la instancia se crea sin errores y hereda los métodos CRUD de `BaseRepository`

---

### Requirement: DireccionService scaffold
La clase `DireccionService` en `app/direcciones/service.py` SHALL existir como scaffold vacío. Se implementa en CH-08.

#### Scenario: Importación del servicio
- **WHEN** se importa `from app.direcciones.service import DireccionService`
- **THEN** la importación resuelve sin error

---

### Requirement: Router de direcciones registrado
El archivo `app/direcciones/router.py` SHALL definir un `APIRouter` con `prefix="/api/v1/direcciones"` y `tags=["direcciones"]`. En esta etapa será placeholder sin endpoints. SHALL estar registrado en `app/main.py`.

#### Scenario: Registro sin errores en startup
- **WHEN** arranca `uvicorn app.main:app`
- **THEN** el router de direcciones está montado sin errores de startup
