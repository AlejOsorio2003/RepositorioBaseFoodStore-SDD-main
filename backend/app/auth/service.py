from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlmodel import select

from app.auth.models import Rol, Usuario, UsuarioRol
from app.refreshtokens.models import RefreshToken
from app.auth.schemas import (
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from app.core.config import settings
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.core.uow import UnitOfWork


def register(data: RegisterRequest, uow: UnitOfWork) -> TokenResponse:
    """Registra un nuevo usuario con rol CLIENT y retorna tokens."""
    # Verificar email único
    existing = uow.session.exec(
        select(Usuario).where(Usuario.email == data.email)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El email ya está registrado",
        )

    # Crear usuario
    usuario = Usuario(
        email=data.email,
        password_hash=hash_password(data.password),
        nombre=data.nombre,
        apellido=data.apellido,
        telefono=data.telefono,
    )
    uow.usuarios.create(usuario)

    # Buscar rol CLIENT por nombre
    rol = uow.session.exec(
        select(Rol).where(Rol.nombre == "CLIENT")
    ).first()
    if not rol:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Rol CLIENT no encontrado — ejecutar seed",
        )

    # Asignar rol CLIENT
    usuario_rol = UsuarioRol(usuario_id=usuario.id, rol_id=rol.id)
    uow.session.add(usuario_rol)
    uow.session.flush()

    # Generar refresh token
    raw_token, token_hash = generate_refresh_token()
    refresh_entry = RefreshToken(
        usuario_id=usuario.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    uow.refresh_tokens.create(refresh_entry)

    # Generar access token
    access_token = create_access_token(
        data={
            "sub": str(usuario.id),
            "email": usuario.email,
            "roles": ["CLIENT"],
        }
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_token,
        token_type="bearer",
    )


def login(data: LoginRequest, uow: UnitOfWork) -> TokenResponse:
    """Autentica usuario y retorna tokens. Error 401 genérico si falla."""
    usuario = uow.session.exec(
        select(Usuario).where(Usuario.email == data.email)
    ).first()

    # Respuesta genérica — no diferenciar email inexistente de password incorrecta
    if not usuario or not verify_password(data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    if not usuario.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ACCOUNT_DISABLED",
        )

    # Obtener roles del usuario
    roles = [ur.rol.nombre for ur in usuario.roles if ur.rol]

    # Generar refresh token
    raw_token, token_hash = generate_refresh_token()
    refresh_entry = RefreshToken(
        usuario_id=usuario.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    uow.refresh_tokens.create(refresh_entry)

    # Generar access token
    access_token = create_access_token(
        data={
            "sub": str(usuario.id),
            "email": usuario.email,
            "roles": roles,
        }
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_token,
        token_type="bearer",
    )


def refresh(data: RefreshRequest, uow: UnitOfWork) -> TokenResponse:
    """Refresca tokens con rotación obligatoria y detección de replay."""
    token_hash_value = hash_token(data.refresh_token)

    stored = uow.session.exec(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash_value)
    ).first()

    if not stored:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
        )

    # Replay attack: token ya revocado
    if stored.revoked_at is not None:
        # Revocar TODOS los tokens activos del usuario
        active_tokens = uow.session.exec(
            select(RefreshToken).where(
                RefreshToken.usuario_id == stored.usuario_id,
                RefreshToken.revoked_at.is_(None),
            )
        ).all()
        now = datetime.now(timezone.utc)
        for t in active_tokens:
            t.revoked_at = now
            uow.session.add(t)
        uow.session.flush()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
        )

    # Token expirado
    if stored.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
        )

    # Revocar token actual
    stored.revoked_at = datetime.now(timezone.utc)
    uow.session.add(stored)
    uow.session.flush()

    # Obtener usuario para generar nuevo access token
    usuario = uow.usuarios.get_by_id(stored.usuario_id)
    if not usuario or not usuario.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
        )

    roles = [ur.rol.nombre for ur in usuario.roles if ur.rol]

    # Generar nuevo par
    raw_token, token_hash = generate_refresh_token()
    refresh_entry = RefreshToken(
        usuario_id=usuario.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    uow.refresh_tokens.create(refresh_entry)

    access_token = create_access_token(
        data={
            "sub": str(usuario.id),
            "email": usuario.email,
            "roles": roles,
        }
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_token,
        token_type="bearer",
    )


def logout(data: LogoutRequest, uow: UnitOfWork) -> None:
    """Revoca el refresh token si existe. Idempotente."""
    token_hash_value = hash_token(data.refresh_token)

    stored = uow.session.exec(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash_value)
    ).first()

    if stored:
        stored.revoked_at = datetime.now(timezone.utc)
        uow.session.add(stored)
        uow.session.flush()

    # Idempotente: si no existe, igual retorna 204 (no error)
