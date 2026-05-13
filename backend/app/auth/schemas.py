from typing import Optional

from pydantic import BaseModel


class RegisterRequest(BaseModel):
    email: str
    password: str
    nombre: str
    apellido: str
    telefono: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str
