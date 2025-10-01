from typing import Optional
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import SessionLocal, engine, Base, get_db
from app.schemas import ClothType, ClothesOut
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.auth import verify_password, hash_password, create_access_token, require_admin
from app.models import User
from app.schemas import UserCreate, UserOut, Token
from uuid import uuid4
from fastapi import Depends
from app.auth import get_current_user

app = FastAPI()
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Welcome to Online Cloth Store"}

@app.post("/add-cloth", response_model=schemas.ClothesOut)
def add_cloth(cloth: schemas.ClothesCreate, db: Session = Depends(get_db)):
    return crud.add_cloth(db, cloth)

@app.get("/get-cloth", response_model=schemas.ClothesOut)
def get_cloth(cloth_id: str, db: Session = Depends(get_db)):
    cloth = crud.get_cloth(db, cloth_id)
    if not cloth:
        raise HTTPException(404, "Cloth not found")
    return cloth

@app.get("/list-clothes")
def list_clothes(db: Session = Depends(get_db)):
    return crud.list_clothes(db)

@app.put("/update-cloth/{cloth_id}", response_model=schemas.ClothesOut)
def update_cloth(cloth_id: str, cloth: schemas.ClothesUpdate, db: Session = Depends(get_db)):
    updated = crud.update_cloth(db, cloth_id, cloth)
    if not updated:
        raise HTTPException(404, "Cloth not found")
    return updated


@app.delete("/delete-cloth/{cloth_id}", response_model=ClothesOut)
def delete_cloth(cloth_id: str, db: Session = Depends(get_db)):
    deleted = crud.soft_delete_cloth(db, cloth_id)
    if not deleted:
        raise HTTPException(404, "Cloth not found or already deleted")
    return deleted


@app.get("/list-active-clothes")
def list_active_clothes(db: Session = Depends(get_db)):
    return crud.list_clothes(db, active_only=True)

@app.get("/list-deleted-clothes")
def list_deleted_clothes(db: Session = Depends(get_db)):
    return crud.list_clothes(db, active_only=False)


@app.get("/filter-clothes", response_model=list[ClothesOut])
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

from app.schemas import ClothesOut

@app.get("/paginated-clothes", response_model=list[ClothesOut])
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

# Auth Routes
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.post("/signup", response_model=UserOut)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    hashed = hash_password(user.password)
    new_user = User(user_id=uuid4().hex, username=user.username, hashed_password=hashed, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token({"sub": user.username, "role": user.role})
    return {"access_token": token}

#Role-Based Access Dependency
@app.put("/restore-cloth/{cloth_id}", response_model=ClothesOut)
def restore_cloth(cloth_id: str, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    restored = crud.restore_cloth(db, cloth_id)
    if not restored:
        raise HTTPException(404, "Cloth not found or already active")
    return restored


@app.get("/users/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user


