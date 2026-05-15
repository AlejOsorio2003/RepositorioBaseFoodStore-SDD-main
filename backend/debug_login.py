from app.core.uow import UnitOfWork
from app.auth.schemas import LoginRequest
from app.auth import service
from sqlmodel import select
from app.auth.models import Usuario

with UnitOfWork() as uow:
    try:
        data = LoginRequest(email='admin@foodstore.com', password='admin123')
        usuario = uow.session.exec(select(Usuario).where(Usuario.email == data.email)).first()
        print('Usuario from DB:', usuario)
        if usuario:
            print('password_hash repr:', repr(usuario.password_hash))
        # call service.login and print result
        token = service.login(data, uow)
        print('Login succeeded:', token)
    except Exception as e:
        import traceback
        traceback.print_exc()
        print('Error:', e)
