## MODIFIED Requirements

### Requirement: Dependencias de seguridad FastAPI reutilizables
El módulo `app/core/security.py` SHALL exponer `get_current_user` (dependencia FastAPI que valida Bearer JWT y retorna `Usuario`) y `require_role(roles: list[str])` (factory que retorna una dependencia que verifica que `current_user` tenga al menos uno de los roles indicados). El módulo SHALL además exponer `create_refresh_token(user_id: int, session: Session) -> str` que genera un UUID v4, lo almacena como hash SHA-256 en `refresh_tokens` con `expires_at = now + REFRESH_TOKEN_EXPIRE_DAYS` y retorna el UUID en texto plano. SHALL también exponer `hash_token(token: str) -> str` que retorna el SHA-256 hex del token.

#### Scenario: Token válido
- **WHEN** el header `Authorization: Bearer <token_válido>` está presente en el request
- **THEN** `get_current_user` retorna el `Usuario` correspondiente al `sub` del JWT

#### Scenario: Token inválido o expirado
- **WHEN** el token JWT está expirado o tiene firma incorrecta
- **THEN** `get_current_user` lanza `HTTPException` con status 401

#### Scenario: Rol insuficiente
- **WHEN** el usuario autenticado no tiene ninguno de los roles requeridos por `require_role`
- **THEN** la dependencia lanza `HTTPException` con status 403

#### Scenario: create_refresh_token persiste en BD
- **WHEN** se llama `create_refresh_token(user_id=1, session=session)`
- **THEN** se inserta un registro en `refresh_tokens` con `token_hash = SHA256(uuid)` y `expires_at` dentro de `REFRESH_TOKEN_EXPIRE_DAYS` días

#### Scenario: hash_token es determinista
- **WHEN** se llama `hash_token(token)` dos veces con el mismo valor
- **THEN** ambas llamadas retornan el mismo string hexadecimal

## ADDED Requirements

### Requirement: Rate limiting via slowapi
El módulo `app/main.py` SHALL registrar un `slowapi.Limiter` con `key_func=get_remote_address` como estado de la aplicación y añadir `SlowAPIMiddleware` como middleware FastAPI. El paquete `slowapi>=0.1.9` SHALL estar declarado en `backend/requirements.txt`.

#### Scenario: Middleware registrado
- **WHEN** la aplicación arranca con `uvicorn app.main:app`
- **THEN** `app.state.limiter` existe y es instancia de `slowapi.Limiter`

#### Scenario: Dependencia declarada
- **WHEN** se ejecuta `pip install -r requirements.txt`
- **THEN** `slowapi` queda disponible para importar sin error
