from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.enums import ClothType, ClothSize, UserRole


# 🧵 Shared base schema
class ClothesBase(BaseModel):
    name: str
    price: float
    type: ClothType
    size: ClothSize

# ➕ Create schema (inherits base)
class ClothesCreate(ClothesBase):
    pass

# 🔄 Update schema (adds optional is_active)
class ClothesUpdate(ClothesBase):
    is_active: Optional[bool] = True

# 📤 Output schema (adds ID and audit fields)
class ClothesOut(ClothesBase):
    cloth_id: str
    is_active: bool
    deleted_at: Optional[datetime] = None
    restored_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Auth Schemas

# ✅ Now use it safely
class UserCreate(BaseModel):
    username: str
    password: str
    role: UserRole = UserRole.user


class UserCreate(BaseModel):
    username: str
    password: str
    role: UserRole = UserRole.user

class UserOut(BaseModel):
    user_id: str
    username: str
    role: UserRole

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
