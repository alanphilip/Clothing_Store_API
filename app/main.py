from typing import Optional
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import SessionLocal, engine, Base
from app.schemas import ClothType, ClothesOut

app = FastAPI()
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

@app.put("/restore-cloth/{cloth_id}", response_model=ClothesOut)
def restore_cloth_endpoint(cloth_id: str, db: Session = Depends(get_db)):
    restored = crud.restore_cloth(db, cloth_id)
    if not restored:
        raise HTTPException(404, "Cloth not found or already active")
    return restored
