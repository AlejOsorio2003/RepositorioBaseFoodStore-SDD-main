from fastapi import APIRouter, Depends, Request, status

from app.auth import service
from app.auth.schemas import (
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from app.core.dependencies import get_uow
from app.core.rate_limit import limiter
from app.core.uow import UnitOfWork

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
