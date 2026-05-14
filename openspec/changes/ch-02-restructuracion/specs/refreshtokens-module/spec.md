## ADDED Requirements

### Requirement: Módulo refreshtokens independiente
El módulo `app/refreshtokens/` SHALL existir como dominio separado, desacoplado de `app/auth/`. SHALL contener los archivos `models.py`, `schemas.py`, `repository.py`, `service.py`, `router.py`. El modelo `RefreshToken` SHALL vivir únicamente en `app/refreshtokens/models.py` y NO en `app/auth/models.py`.

#### Scenario: Importación desde módulo correcto
- **WHEN** se importa `from app.refreshtokens.models import RefreshToken`
- **THEN** la importación resuelve sin error y la clase es el modelo SQLModel con `__tablename__ = "refresh_tokens"`

#### Scenario: No existe RefreshToken en auth
- **WHEN** se inspecciona `app/auth/models.py`
- **THEN** el archivo no define ni exporta `RefreshToken` (puede tener un import de compatibilidad con alias temporal durante la transición)

---

### Requirement: RefreshTokenRepository
La clase `RefreshTokenRepository(BaseRepository[RefreshToken])` en `app/refreshtokens/repository.py` SHALL heredar de `BaseRepository[RefreshToken]`. En esta etapa (CH-02) SHALL ser un scaffold con `pass` — la implementación real se completa en CH-01.

#### Scenario: Instanciación válida
- **WHEN** se instancia `RefreshTokenRepository(session=session)`
- **THEN** la instancia se crea sin errores y tiene acceso a los métodos heredados de `BaseRepository`

---

### Requirement: RefreshTokenService scaffold
La clase `RefreshTokenService` en `app/refreshtokens/service.py` SHALL existir como scaffold vacío. En esta etapa SHALL contener solo la firma de clase sin lógica (se implementa en CH-01).

#### Scenario: Importación del servicio
- **WHEN** se importa `from app.refreshtokens.service import RefreshTokenService`
- **THEN** la importación resuelve sin error

---

### Requirement: Router de refreshtokens registrado
El archivo `app/refreshtokens/router.py` SHALL definir un `APIRouter` con `prefix="/api/v1/refresh-tokens"` y `tags=["refresh-tokens"]`. En esta etapa no tendrá endpoints — será un placeholder. El router SHALL estar registrado en `app/main.py`.

#### Scenario: Registro sin errores en startup
- **WHEN** arranca `uvicorn app.main:app`
- **THEN** el router de refreshtokens está montado y no genera errores en el startup de FastAPI
