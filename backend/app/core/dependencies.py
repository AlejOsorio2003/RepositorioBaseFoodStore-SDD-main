from collections.abc import Callable, Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.models import Usuario
from app.core.database import get_session
from app.core.security import decode_access_token
from app.core.uow import UnitOfWork

_bearer = HTTPBearer(auto_error=False)


def get_uow() -> Generator[UnitOfWork, None, None]:
    with UnitOfWork() as uow:
        yield uow


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    uow: UnitOfWork = Depends(get_uow),
) -> Usuario:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    try:
        payload = decode_access_token(credentials.credentials)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado")

    user_id: int | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token sin identificador de usuario")

    user = uow.usuarios.get_by_id(int(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado o inactivo")

    return user


def require_role(roles: list[str]) -> Callable[..., Usuario]:
    def _check(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        user_roles = {ur.rol.nombre for ur in current_user.roles if ur.rol}
        if not user_roles.intersection(roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere uno de los roles: {roles}",
            )
        return current_user

    return _check
