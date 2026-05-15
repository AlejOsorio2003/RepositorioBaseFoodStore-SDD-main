import inspect
from app.auth import models

print('Annotations for Rol:', models.Rol.__annotations__)
print('Rol.__dict__["usuarios"]:', models.Rol.__dict__.get('usuarios'))
print('Annotations for Usuario:', models.Usuario.__annotations__)
print('Usuario.__dict__["roles"]:', models.Usuario.__dict__.get('roles'))
print('UsuarioRol.__annotations__:', models.UsuarioRol.__annotations__)
print('UsuarioRol.usuario attr:', models.UsuarioRol.__dict__.get('usuario'))
print('UsuarioRol.rol attr:', models.UsuarioRol.__dict__.get('rol'))

# Show SQLModel stored relationship info
from sqlmodel import SQLModel

for cls in (models.Rol, models.UsuarioRol, models.Usuario):
    rels = getattr(cls, '__sqlmodel_relationships__', None)
    print(f'Class {cls.__name__} __sqlmodel_relationships__ =', rels)
    if rels:
        for k, info in rels.items():
            sa_rel = info.sa_relationship
            print(f'  - {k}: sa_relationship repr={sa_rel!r}')
            try:
                print('    argument:', getattr(sa_rel, 'argument', None))
            except Exception as e:
                print('    argument error', e)
            try:
                print('    dir:', [a for a in dir(sa_rel) if not a.startswith('_')])
            except Exception as e:
                print('    dir error', e)

print('Done')
