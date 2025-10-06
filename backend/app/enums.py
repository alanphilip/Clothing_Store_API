from pydantic import BaseModel
from enum import Enum

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

class UserRole(str, Enum):
    admin = "admin"
    user = "user"