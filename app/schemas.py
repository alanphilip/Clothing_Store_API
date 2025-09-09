from pydantic import BaseModel
from enum import Enum
from typing import Optional
from datetime import datetime

# 🎯 Enums for cloth type and size
class ClothType(str, Enum):
    tops = "tops"
    bottoms = "bottoms"
    outerwear = "outerwear"
    other_garments = "other_garments"
    essentials = "essentials"

class ClothSize(str, Enum):
    S = "S"
    M = "M"
    L = "L"
    XL = "XL"
    XXL = "XXL"

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
