from sqlalchemy import Column, String, Float, Boolean, Enum, DateTime
from app.database import Base
from app.schemas import ClothType, ClothSize

class Cloth(Base):
    __tablename__ = "clothes"

    cloth_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    type = Column(Enum(ClothType), nullable=False)
    size = Column(Enum(ClothSize), nullable=False)
    is_active = Column(Boolean, default=True)
    deleted_at = Column(DateTime, nullable=True)
    restored_at = Column(DateTime, nullable=True)
