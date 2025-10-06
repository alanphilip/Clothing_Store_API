from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer
from sqlalchemy import Enum as SQLAEnum

from backend.app.database import Base
from backend.app.enums import ClothType, ClothSize, UserRole

class User(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    #role = Column(SQLAEnum(UserRole, native_enum=False), default=UserRole.user)
    role = Column(SQLAEnum(UserRole, native_enum=False), default=UserRole.user, nullable=False)  # SQLAlchemy Enum for DB

class Cloth(Base):
    __tablename__ = "clothes"

    cloth_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    type = Column(SQLAEnum(ClothType, native_enum=False), nullable=False)
    size = Column(SQLAEnum(ClothSize, native_enum=False), nullable=False)
    is_active = Column(Boolean, default=True)
    deleted_at = Column(DateTime, nullable=True)
    restored_at = Column(DateTime, nullable=True)

