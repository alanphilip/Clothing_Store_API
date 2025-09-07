from uuid import uuid4
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import random
import os, json
from fastapi.encoders import jsonable_encoder
from enum import Enum

# Initialize FastAPI app
app = FastAPI()

# Load existing clothes data from JSON file if available
CLOTHES_DATABASE = []
CLOTHES_FILE = "clothes.json"
if os.path.exists(CLOTHES_FILE):
    with open(CLOTHES_FILE, "r") as f:
        CLOTHES_DATABASE = json.load(f)

# Enum for predefined cloth categories
class Cloth_type(str, Enum):
    tops = "tops"
    bottoms = "bottoms"
    outerwear = "outerwear"
    other_garments = "other_garments"
    essentials = "essentials"

# Pydantic model for cloth item
class Clothes(BaseModel):
    cloth_name: str
    price: float
    type: Cloth_type
    cloth_id: Optional[str] = None

# Root endpoint for welcome message
@app.get("/")
async def root():
    return {"message": "Welcome to Online Cloth Store"}

# Retrieve all clothes in the store
@app.get("/list-clothes")
async def list_clothes():
    return {"clothes": CLOTHES_DATABASE}

# Retrieve a cloth item by its index in the database
@app.get("/cloth-by-index/{index}")
async def cloth_by_index(index: int):
    if index < 0 or index >= len(CLOTHES_DATABASE):
        raise HTTPException(404, f"Cloth index '{index}' out of range.")
    return {"cloth": CLOTHES_DATABASE[index]}

# Retrieve a random cloth item from the store
@app.get("/random-cloth")
async def random_cloth():
    return random.choice(CLOTHES_DATABASE)

# Add a new cloth item to the store and persist it to JSON
@app.post("/add-cloth")
async def add_cloth(cloth: Clothes):
    cloth.cloth_id = uuid4().hex
    json_cloth = jsonable_encoder(cloth)
    CLOTHES_DATABASE.append(json_cloth)
    with open(CLOTHES_FILE, "w") as f:
        json.dump(CLOTHES_DATABASE, f, indent=2)
    return {"message": f"{cloth} added successfully.", "cloth_id": cloth.cloth_id}

# Retrieve a cloth item by its unique ID
@app.get("/get-cloth")
async def get_cloth(cloth_id: str):
    for item in CLOTHES_DATABASE:
        if item["cloth_id"] == cloth_id:
            return item
    raise HTTPException(404, f"Cloth not found: {cloth_id}")
