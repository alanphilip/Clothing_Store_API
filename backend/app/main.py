from uuid import uuid4
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Depends
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from backend.app import auth, crud, database, models, schemas
from backend.app.auth import *
from backend.app.database import *
from backend.app.models import *
from backend.app.schemas import *
from fastapi.middleware.cors import CORSMiddleware
import re
from typing import List
from fastapi import Depends, APIRouter
from sqlalchemy.orm import Session
from backend.app import crud, schemas
from backend.app.database import get_db

app = FastAPI(
    title="Clothing Store API",
    description="API for managing clothes with role-based access (admin vs user).",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For dev only. replace with Alembic migrations in prod
Base.metadata.create_all(bind=engine)

# default section
@app.get("/")
def root():
    return {"message": "Welcome to Online Cloth Store"}

@app.get("/cloth/{cloth_id}", response_model=schemas.ClothesOut)
def get_cloth(cloth_id: str, db: Session = Depends(get_db)):
    cloth = crud.get_cloth(db, cloth_id)
    if not cloth:
        raise HTTPException(404, "Cloth not found")
    return cloth



router = APIRouter()

@router.get("/clothes", response_model=List[schemas.ClothesOut])
def get_clothes(db: Session = Depends(get_db)):
    return crud.get_clothes(db)


#========================================================
# Auth section
@app.post("/signup", response_model=UserOut, tags=["Auth"])
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username.ilike(user.username)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    hashed = hash_password(user.password)
    new_user = User(
        user_id=uuid4().hex,
        username=user.username,
        hashed_password=hashed,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=Token, tags=["Auth"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token({"sub": user.username, "role": user.role})
    return {"access_token": token}

@app.get("/users/me", tags=["Auth"])
def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@app.post("/logout", tags=["Auth"])
def logout():
    return {"message": "Logout handled on frontend by clearing token"}

@app.get("/token/verify", tags=["Auth"])
def verify_token(current_user: User = Depends(get_current_user)):
    return {"username": current_user.username, "role": current_user.role}
#=================================================================================

# Admin section
@app.get("/users", response_model=List[UserOut],
         tags=["Admin"],
         summary="Add a cloth (Admin only)",
         description="Requires admin role."
         )
def list_all_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return db.query(User).all()

@app.delete("/delete-user/{user_id}",
            tags=["Admin"],
            summary="Delete a User (Admin only)",
            description="Requires admin role."
            )
def delete_user(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    if current_user.user_id == user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")

    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@app.post("/add-clothes",
          response_model=schemas.ClothesOut,
          tags=["Admin"],
          summary="Add a cloth (Admin only)",
          description="Requires admin role."
          )
def add_clothes(item: ClothesCreate, db: Session = Depends(get_db), current_user: User = Depends(admin_required)):
    return crud.add_cloth(db, item)

@app.delete(
    "/delete-cloth/{cloth_id}",
    response_model=schemas.ClothesOut,
    tags=["Admin"],
    summary="Delete a cloth (Admin only)",
    description="Requires admin role. Soft deletes a cloth by setting is_active=False."
)
def delete_cloth(cloth_id: int, db: Session = Depends(get_db), current_user: User = Depends(admin_required)):
    deleted = crud.soft_delete_cloth(db, cloth_id)
    if not deleted:
        raise HTTPException(404, "Cloth not found or already deleted")
    return deleted

@app.put("/update-cloth/{cloth_id}",
         response_model=schemas.ClothesOut,
         tags=["Admin"],
         summary="Update cloth features (Admin only)",
         description="Requires admin role to update Cloth Price, Size. and Type"
         )
def update_cloth(cloth_id: str, cloth: schemas.ClothesUpdate, db: Session = Depends(get_db)):
    print("Received update:", cloth_id, cloth.dict())
    updated = crud.update_cloth(db, cloth_id, cloth)
    if not updated:
        raise HTTPException(404, "Cloth not found")
    return updated

# Is restore really required??
# @app.put(
#     "/restore-cloth/{cloth_id}",
#     response_model=schemas.ClothesOut,
#     tags=["Admin"],
#     summary="Restore a cloth (Admin only)",
#     description="Requires admin role. Restores a previously deleted cloth."
# )
# def restore_cloth(cloth_id: int, db: Session = Depends(get_db), current_user: User = Depends(admin_required)):
#     restored = crud.restore_cloth(db, cloth_id)
#     if not restored:
#         raise HTTPException(404, "Cloth not found or already active")
#     return restored

#=======================================================================================
# User section
@app.get("/clothes", response_model=List[schemas.ClothesOut], tags=["User"])
def list_all_clothes(db: Session = Depends(get_db)):
    return crud.list_clothes(db, active_only=True)

@app.get("/list-active-clothes", tags=["User"])
def list_active_clothes(db: Session = Depends(get_db)):
    return crud.list_clothes(db, active_only=True)

@app.get("/list-deleted-clothes", tags=["User"])
def list_deleted_clothes(db: Session = Depends(get_db)):
    return crud.list_clothes(db, active_only=False)

@app.get("/filter-clothes", response_model=list[ClothesOut], tags=["User"])
def filter_clothes_endpoint(
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        cloth_type: Optional[ClothType] = None,
        is_active: Optional[bool] = None,
        db: Session = Depends(get_db)
):
    results = crud.filter_clothes(
        db,
        min_price=min_price,
        max_price=max_price,
        cloth_type=cloth_type,
        is_active=is_active
    )
    return results

@app.get("/paginated-clothes", response_model=list[ClothesOut], tags=["User"])
def paginated_clothes(
        skip: int = 0,
        limit: int = 10,
        sort_by: str = "price",
        sort_order: str = "asc",
        is_active: bool | None = None,
        cloth_type: ClothType | None = None,
        db: Session = Depends(get_db)
):
    return crud.get_paginated_clothes(
        db,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order,
        is_active=is_active,
        cloth_type=cloth_type
    )

