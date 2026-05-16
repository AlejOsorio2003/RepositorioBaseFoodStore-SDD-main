from fastapi import APIRouter, Depends, Request, status

from app.auth import service
from app.auth.models import Usuario
from app.auth.schemas import (
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from app.core.dependencies import get_current_user, get_uow
from app.core.rate_limit import limiter
from app.core.uow import UnitOfWork
from app.usuarios.schemas import (
    CambiarPasswordRequest,
    PerfilUpdate,
    UsuarioRead,
)
from app.usuarios.service import UsuarioService

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=TokenResponse)
def register(data: RegisterRequest, uow: UnitOfWork = Depends(get_uow)) -> TokenResponse:
    return service.register(data, uow)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/15minute")
def login(
    request: Request,
    data: LoginRequest,
    uow: UnitOfWork = Depends(get_uow),
) -> TokenResponse:
    return service.login(data, uow)


@router.post("/refresh", response_model=TokenResponse)
def refresh(data: RefreshRequest, uow: UnitOfWork = Depends(get_uow)) -> TokenResponse:
    return service.refresh(data, uow)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(data: LogoutRequest, uow: UnitOfWork = Depends(get_uow)) -> None:
    service.logout(data, uow)
    return None


@router.get("/me", response_model=UsuarioRead)
def get_me(
    current_user: Usuario = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
):
    return UsuarioService.get_me(uow, current_user.id)


@router.put("/me", response_model=UsuarioRead)
def update_me(
    data: PerfilUpdate,
    current_user: Usuario = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
):
    return UsuarioService.update_me(uow, current_user.id, data)


@router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    data: CambiarPasswordRequest,
    current_user: Usuario = Depends(get_current_user),
    uow: UnitOfWork = Depends(get_uow),
):
    UsuarioService.change_password(uow, current_user.id, data)
    return None
