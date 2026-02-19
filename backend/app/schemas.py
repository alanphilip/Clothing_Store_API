from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
from backend.app.enums import ClothType, ClothSize, UserRole
import re

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
class ClothesUpdate(BaseModel):
    price: Optional[float] = None
    size: Optional[ClothSize] = None
    type: Optional[ClothType] = None
    is_active: Optional[bool] = True

# 📤 Output schema (adds ID and audit fields)
class ClothesOut(BaseModel):
    cloth_id: int
    name: str
    price: float
    type: ClothType
    size: ClothSize
    is_active: bool
    deleted_at: Optional[datetime] = None
    restored_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Auth Schemas
class UserCreate(BaseModel):
    username: str
    password: str
    role: UserRole = UserRole.user
    @validator("username")
    def validate_username(cls, v):
        # Must start with a letter, min length 3
        if not re.match(r"^[A-Za-z][A-Za-z0-9_]{2,}$", v):
            raise ValueError("Username must be at least 3 characters and start with a letter.")
        return v
    @validator("password")
    def validate_password(cls, v):
        # Must be at least 6 chars, contain number + special char
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number.")
        if not re.search(r"[^\w\s]", v):
            raise ValueError("Password must contain at least one special character.")
        return v

class UserOut(BaseModel):
    user_id: str
    username: str
    role: UserRole

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
