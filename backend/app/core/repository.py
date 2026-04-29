from datetime import datetime, timezone
from typing import Generic, Optional, Type, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: Type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, id: int) -> Optional[T]:
        return self.session.get(self.model, id)

    def list_all(self, skip: int = 0, limit: int = 100) -> list[T]:
        return list(self.session.exec(select(self.model).offset(skip).limit(limit)).all())

    def count(self) -> int:
        from sqlalchemy import func
        result = self.session.exec(select(func.count()).select_from(self.model))
        return result.one()

    def create(self, obj: T) -> T:
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def update(self, id: int, data: dict) -> Optional[T]:
        obj = self.get_by_id(id)
        if not obj:
            return None
        for key, value in data.items():
            setattr(obj, key, value)
        if hasattr(obj, "updated_at"):
            obj.updated_at = datetime.now(timezone.utc)  # type: ignore[attr-defined]
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def soft_delete(self, id: int) -> bool:
        obj = self.get_by_id(id)
        if not obj:
            return False
        if not hasattr(obj, "deleted_at"):
            raise AttributeError(f"{self.model.__name__} does not support soft delete")
        obj.deleted_at = datetime.now(timezone.utc)  # type: ignore[attr-defined]
        self.session.add(obj)
        self.session.flush()
        return True

    def hard_delete(self, id: int) -> bool:
        obj = self.get_by_id(id)
        if not obj:
            return False
        self.session.delete(obj)
        self.session.flush()
        return True
