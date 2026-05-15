import re
import unicodedata
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status

from app.core.uow import UnitOfWork
from sqlmodel import select

from app.productos.models import Producto, ProductoCategoria, ProductoIngrediente
from app.productos.repository import ProductoRepository
from app.productos.schemas import (
    CategoriaEnProductoRead,
    DisponibilidadUpdate,
    IngredienteEnProductoRead,
    PaginatedProductos,
    ProductoCreate,
    ProductoDetail,
    ProductoIngredienteCreate,
    ProductoIngredienteRead,
    ProductoRead,
    ProductoUpdate,
)


def _slugify(text: str) -> str:
    """Convierte un texto a slug URL-safe."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text).strip("-")
    return text


def _get_repo(uow: UnitOfWork) -> ProductoRepository:
    repo: ProductoRepository = uow.productos  # type: ignore[assignment]
    return repo


def _generar_slug_unico(repo: ProductoRepository, nombre: str) -> str:
    base_slug = _slugify(nombre)
    if not base_slug:
        base_slug = "producto"

    slug = base_slug
    contador = 1
    while repo.get_by_slug(slug) is not None:
        slug = f"{base_slug}-{contador}"
        contador += 1
    return slug


def _producto_to_read(p: Producto) -> ProductoRead:
    return ProductoRead(
        id=p.id,
        nombre=p.nombre,
        slug=p.slug,
        descripcion=p.descripcion,
        precio_base=p.precio_base,
        stock_cantidad=p.stock_cantidad,
        disponible=p.disponible,
        imagen_url=p.imagen_url,
        created_at=p.created_at,
    )


def _producto_to_detail(p: Producto) -> ProductoDetail:
    categorias = [
        CategoriaEnProductoRead(id=pc.categoria.id, nombre=pc.categoria.nombre)
        for pc in p.categorias
        if pc.categoria
    ]
    ingredientes = [
        IngredienteEnProductoRead(
            id=pi.ingrediente.id,
            nombre=pi.ingrediente.nombre,
            es_alergeno=pi.ingrediente.es_alergeno,
            es_removible=pi.es_removible,
        )
        for pi in p.ingredientes
        if pi.ingrediente
    ]
    return ProductoDetail(
        id=p.id,
        nombre=p.nombre,
        slug=p.slug,
        descripcion=p.descripcion,
        precio_base=p.precio_base,
        stock_cantidad=p.stock_cantidad,
        disponible=p.disponible,
        imagen_url=p.imagen_url,
        created_at=p.created_at,
        categorias=categorias,
        ingredientes=ingredientes,
    )


def listar_productos(
    uow: UnitOfWork,
    *,
    categoria_id: Optional[int] = None,
    disponible: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = 1,
    size: int = 20,
) -> PaginatedProductos:
    repo = _get_repo(uow)
    items, total = repo.list_paginado(
        categoria_id=categoria_id,
        disponible=disponible,
        search=search,
        page=page,
        size=size,
    )
    return PaginatedProductos(
        items=[_producto_to_read(p) for p in items],
        total=total,
        page=page,
        size=size,
    )


def get_producto(uow: UnitOfWork, producto_id: int) -> ProductoDetail:
    repo = _get_repo(uow)
    producto = repo.get_by_id_con_relaciones(producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )
    return _producto_to_detail(producto)


def crear_producto(uow: UnitOfWork, data: ProductoCreate) -> ProductoRead:
    repo = _get_repo(uow)

    # Generar slug único
    slug = _generar_slug_unico(repo, data.nombre)

    # Crear producto
    producto = Producto(
        nombre=data.nombre,
        slug=slug,
        descripcion=data.descripcion,
        precio_base=data.precio_base,
        stock_cantidad=data.stock_cantidad,
        disponible=data.disponible,
        imagen_url=data.imagen_url,
    )
    repo.create(producto)

    # Asociar categorías
    for cat_id in data.categoria_ids:
        pivot = ProductoCategoria(producto_id=producto.id, categoria_id=cat_id)
        uow.session.add(pivot)

    # Asociar ingredientes
    for ing_id in data.ingrediente_ids:
        pivot = ProductoIngrediente(
            producto_id=producto.id, ingrediente_id=ing_id, es_removible=False
        )
        uow.session.add(pivot)

    uow.session.flush()
    uow.session.refresh(producto)
    return _producto_to_read(producto)


def actualizar_producto(
    uow: UnitOfWork, producto_id: int, data: ProductoUpdate
) -> ProductoRead:
    repo = _get_repo(uow)
    producto = repo.get_by_id_con_relaciones(producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )

    update_data = data.model_dump(exclude_unset=True)

    # Si cambia el nombre, regenerar slug
    if "nombre" in update_data:
        new_slug = _generar_slug_unico(repo, update_data["nombre"])
        update_data["slug"] = new_slug

    # Separar relaciones del update directo
    categoria_ids = update_data.pop("categoria_ids", None)
    ingrediente_ids = update_data.pop("ingrediente_ids", None)

    # Aplicar campos escalares
    for key, value in update_data.items():
        setattr(producto, key, value)

    producto.updated_at = datetime.now(timezone.utc)
    uow.session.add(producto)
    uow.session.flush()

    # Reemplazar categorías si se enviaron
    if categoria_ids is not None:
        # Eliminar pivots existentes
        existing_cats = uow.session.exec(
            select(ProductoCategoria).where(
                ProductoCategoria.producto_id == producto_id
            )
        ).all()
        for pc in existing_cats:
            uow.session.delete(pc)
        # Crear nuevos
        for cat_id in categoria_ids:
            pivot = ProductoCategoria(producto_id=producto_id, categoria_id=cat_id)
            uow.session.add(pivot)

    # Reemplazar ingredientes si se enviaron
    if ingrediente_ids is not None:
        existing_ings = uow.session.exec(
            select(ProductoIngrediente).where(
                ProductoIngrediente.producto_id == producto_id
            )
        ).all()
        for pi in existing_ings:
            uow.session.delete(pi)
        for ing_id in ingrediente_ids:
            pivot = ProductoIngrediente(
                producto_id=producto_id, ingrediente_id=ing_id, es_removible=False
            )
            uow.session.add(pivot)

    uow.session.flush()
    uow.session.refresh(producto)
    return _producto_to_read(producto)


def cambiar_disponibilidad(
    uow: UnitOfWork, producto_id: int, data: DisponibilidadUpdate
) -> ProductoRead:
    repo = _get_repo(uow)
    producto = repo.get_by_id(producto_id)
    if not producto or producto.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )

    producto.disponible = data.disponible
    producto.updated_at = datetime.now(timezone.utc)
    uow.session.add(producto)
    uow.session.flush()
    uow.session.refresh(producto)
    return _producto_to_read(producto)


def eliminar_producto(uow: UnitOfWork, producto_id: int) -> None:
    repo = _get_repo(uow)
    producto = repo.get_by_id(producto_id)
    if not producto or producto.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )
    repo.soft_delete(producto)


def listar_ingredientes_producto(
    uow: UnitOfWork, producto_id: int
) -> list[IngredienteEnProductoRead]:
    repo = _get_repo(uow)
    producto = repo.get_by_id_con_relaciones(producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )

    return [
        IngredienteEnProductoRead(
            id=pi.ingrediente.id,
            nombre=pi.ingrediente.nombre,
            es_alergeno=pi.ingrediente.es_alergeno,
            es_removible=pi.es_removible,
        )
        for pi in producto.ingredientes
        if pi.ingrediente
    ]


def asociar_ingrediente(
    uow: UnitOfWork, producto_id: int, data: ProductoIngredienteCreate
) -> ProductoIngredienteRead:
    repo = _get_repo(uow)

    # Verificar producto existe
    producto = repo.get_by_id_con_relaciones(producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )

    # Verificar ingrediente existe
    from app.ingredientes.repository import IngredienteRepository

    ing_repo: IngredienteRepository = uow.ingredientes  # type: ignore[assignment]
    ingrediente = ing_repo.get_by_id(data.ingrediente_id)
    if not ingrediente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingrediente no encontrado",
        )

    # Verificar que no exista ya la asociación
    existing = repo.get_pivot_ingrediente(producto_id, data.ingrediente_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El ingrediente ya está asociado a este producto",
        )

    pivot = ProductoIngrediente(
        producto_id=producto_id,
        ingrediente_id=data.ingrediente_id,
        es_removible=data.es_removible,
    )
    repo.add_ingrediente(pivot)
    uow.session.flush()

    return ProductoIngredienteRead(
        producto_id=pivot.producto_id,
        ingrediente_id=pivot.ingrediente_id,
        es_removible=pivot.es_removible,
        ingrediente=IngredienteEnProductoRead(
            id=ingrediente.id,
            nombre=ingrediente.nombre,
            es_alergeno=ingrediente.es_alergeno,
            es_removible=data.es_removible,
        ),
    )


def quitar_ingrediente(
    uow: UnitOfWork, producto_id: int, ingrediente_id: int
) -> None:
    repo = _get_repo(uow)

    # Verificar producto existe
    producto = repo.get_by_id(producto_id)
    if not producto or producto.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )

    # Verificar asociación existe
    pivot = repo.get_pivot_ingrediente(producto_id, ingrediente_id)
    if not pivot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El ingrediente no está asociado a este producto",
        )

    repo.remove_ingrediente(pivot)
