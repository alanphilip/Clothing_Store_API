from uuid import uuid4
from datetime import datetime, UTC
from app.schemas import ClothesCreate, ClothesUpdate
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models import Cloth
from app.schemas import ClothType


def add_cloth(db: Session, cloth_data: ClothesCreate):
    cloth = Cloth(
        cloth_id=uuid4().hex,
        name=cloth_data.name,
        price=cloth_data.price,
        type=cloth_data.type,
        size=cloth_data.size
    )
    db.add(cloth)
    db.commit()
    db.refresh(cloth)
    return cloth

def get_cloth(db: Session, cloth_id: str):
    return db.query(Cloth).filter(Cloth.cloth_id == cloth_id).first()

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

def restore_cloth(db: Session, cloth_id: str) -> Cloth | None:
    cloth = db.query(Cloth).filter(Cloth.cloth_id == cloth_id).first()
    if not cloth or cloth.is_active:
        return None  # Either not found or already active

    cloth.is_active = True
    cloth.deleted_at = None
    cloth.restored_at = datetime.now(UTC)
    db.commit()
    db.refresh(cloth)
    return cloth


