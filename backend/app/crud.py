from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc

from backend.app.schemas import ClothesCreate, ClothesUpdate, ClothType
from backend.app.models import Cloth
from sqlalchemy.orm import Session
from backend.app import models   # ✅ import your models
from sqlalchemy.orm import Session
from backend.app import models


def add_cloth(db: Session, cloth_data: ClothesCreate):
    cloth = Cloth(
        name=cloth_data.name,
        price=cloth_data.price,
        type=cloth_data.type,
        size=cloth_data.size,
        is_active=True
    )
    db.add(cloth)
    db.commit()
    db.refresh(cloth)
    return cloth

def get_cloth(db: Session, cloth_id: str):
    return db.query(Cloth).filter(Cloth.cloth_id == cloth_id).first()


def get_clothes(db: Session):
    return db.query(models.Cloth).all()


def list_clothes(db: Session, active_only: bool = None):
    query = db.query(Cloth)
    if active_only is True:
        query = query.filter(Cloth.is_active == True)
    elif active_only is False:
        query = query.filter(Cloth.is_active == False)
    return query.all()

def update_cloth(db: Session, cloth_id: str, updated_data: ClothesUpdate):
    cloth = get_cloth(db, cloth_id)
    if not cloth:
        return None
    for field, value in updated_data.dict(exclude_unset=True).items():
        setattr(cloth, field, value)
    db.commit()
    db.refresh(cloth)
    return cloth

def soft_delete_cloth(db: Session, cloth_id: str):
    cloth = get_cloth(db, cloth_id)
    if not cloth or not cloth.is_active:
        return None
    cloth.is_active = False
    cloth.deleted_at = datetime.utcnow()
    db.commit()
    return cloth

def filter_clothes(
        db: Session,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        cloth_type: Optional[ClothType] = None,
        is_active: Optional[bool] = None
) -> List[Cloth]:
    query = db.query(Cloth)

    if min_price is not None:
        query = query.filter(Cloth.price >= min_price)
    if max_price is not None:
        query = query.filter(Cloth.price <= max_price)
    if cloth_type is not None:
        query = query.filter(Cloth.type == cloth_type)
    if is_active is not None:
        query = query.filter(Cloth.is_active == is_active)

    return query.all()

def restore_cloth(db: Session, cloth_id: int):
    cloth = db.query(Cloth).filter(Cloth.cloth_id == cloth_id, Cloth.is_active == False).first()
    if not cloth:
        return None
    cloth.is_active = True
    cloth.restored_at = datetime.utcnow()
    db.commit()
    db.refresh(cloth)
    return cloth

def get_paginated_clothes(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        sort_by: str = "price",
        sort_order: str = "asc",
        is_active: bool | None = None,
        cloth_type: ClothType | None = None
):
    query = db.query(Cloth)

    if is_active is not None:
        query = query.filter(Cloth.is_active == is_active)
    if cloth_type is not None:
        query = query.filter(Cloth.type == cloth_type)

    # Sorting logic
    sort_column = getattr(Cloth, sort_by, None)
    if sort_column is not None:
        query = query.order_by(asc(sort_column) if sort_order == "asc" else desc(sort_column))

    return query.offset(skip).limit(limit).all()
