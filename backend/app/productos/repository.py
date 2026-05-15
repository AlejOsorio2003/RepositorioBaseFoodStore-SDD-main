from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import func
from sqlmodel import select
from sqlmodel.sql.expression import Select

from app.core.repository import BaseRepository
from app.productos.models import Producto, ProductoCategoria, ProductoIngrediente


class ProductoRepository(BaseRepository[Producto]):
    def list_paginado(
        self,
        *,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
        search: Optional[str] = None,
        page: int = 1,
        size: int = 20,
    ) -> tuple[list[Producto], int]:
        # Query base: solo activos (sin soft delete)
        base: Select = select(Producto).where(Producto.deleted_at.is_(None))

        # Filtro por categoría
        if categoria_id is not None:
            subq = select(ProductoCategoria.producto_id).where(
                ProductoCategoria.categoria_id == categoria_id
            )
            base = base.where(Producto.id.in_(subq))

        # Filtro por disponibilidad
        if disponible is not None:
            base = base.where(Producto.disponible == disponible)

        # Búsqueda por texto (ILIKE sobre nombre y descripción)
        if search:
            pattern = f"%{search}%"
            base = base.where(
                Producto.nombre.ilike(pattern) | Producto.descripcion.ilike(pattern)
            )

        # Total antes de paginar
        count_stmt = select(func.count()).select_from(Producto).where(
            Producto.deleted_at.is_(None)
        )
        # Replicar filtros en count
        if categoria_id is not None:
            count_stmt = count_stmt.where(Producto.id.in_(subq))  # type: ignore[arg-type]
        if disponible is not None:
            count_stmt = count_stmt.where(Producto.disponible == disponible)
        if search:
            count_stmt = count_stmt.where(
                Producto.nombre.ilike(pattern) | Producto.descripcion.ilike(pattern)  # type: ignore[arg-type]
            )
        total = self.session.exec(count_stmt).one()

        # Paginación
        offset = (page - 1) * size
        stmt = base.order_by(Producto.id).offset(offset).limit(size)
        items = list(self.session.exec(stmt).all())

        return items, total

    def get_by_id_con_relaciones(self, producto_id: int) -> Optional[Producto]:
        from sqlalchemy.orm import selectinload

        stmt = (
            select(Producto)
            .where(Producto.id == producto_id, Producto.deleted_at.is_(None))
            .options(
                selectinload(Producto.categorias).selectinload(ProductoCategoria.categoria),
                selectinload(Producto.ingredientes).selectinload(ProductoIngrediente.ingrediente),
            )
        )
        return self.session.exec(stmt).first()

    def get_by_slug(self, slug: str) -> Optional[Producto]:
        stmt = select(Producto).where(Producto.slug == slug, Producto.deleted_at.is_(None))
        return self.session.exec(stmt).first()

    def get_pivot_ingrediente(
        self, producto_id: int, ingrediente_id: int
    ) -> Optional[ProductoIngrediente]:
        stmt = select(ProductoIngrediente).where(
            ProductoIngrediente.producto_id == producto_id,
            ProductoIngrediente.ingrediente_id == ingrediente_id,
        )
        return self.session.exec(stmt).first()

    def add_ingrediente(self, pivot: ProductoIngrediente) -> None:
        self.session.add(pivot)

    def remove_ingrediente(self, pivot: ProductoIngrediente) -> None:
        self.session.delete(pivot)

    def soft_delete(self, producto: Producto) -> None:
        producto.deleted_at = datetime.now(timezone.utc)
        self.session.add(producto)
