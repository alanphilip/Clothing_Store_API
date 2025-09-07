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
ARCHIVE_FILE = "deleted_clothes.json"

if not os.path.exists(ARCHIVE_FILE):
    with open(ARCHIVE_FILE, "w") as f:
        json.dump([], f)

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

class Cloth_size(str, Enum):
    S = "S"
    M = "M"
    L = "L"
    XL = "XL"
    XXL = "XXL"

# Pydantic model for cloth item
class Clothes(BaseModel):
    name: str
    price: float
    type: Cloth_type
    size: Cloth_size
    cloth_id: Optional[str] = None
    is_active: bool = True # default = true


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

# Filter clothes by price range
@app.get("/filter-by-price")
async def filter_by_price(min_price: Optional[float] = None, max_price: Optional[float] = None):
    if min_price is None and max_price is None:
        raise HTTPException(400, "Please provide at least one price filter: min_price or max_price.")

    filtered = []
    for item in CLOTHES_DATABASE:
        price = item.get("price", 0)
        if min_price is not None and price < min_price:
            continue
        if max_price is not None and price > max_price:
            continue
        filtered.append(item)

    return {"filtered_clothes": filtered, "count": len(filtered)}

# Filter clothes by type
@app.get("/filter-by-type")
async def filter_by_type(cloth_type: Cloth_type):
    filtered = [item for item in CLOTHES_DATABASE if item["type"] == cloth_type]
    if not filtered:
        raise HTTPException(404, f"No clothes found for type: {cloth_type}")
    return {"filtered_clothes": filtered, "count": len(filtered)}

# Update an existing cloth item by cloth_id
@app.put("/update-cloth/{cloth_id}")
async def update_cloth(cloth_id: str, updated_cloth: Clothes):
    for index, item in enumerate(CLOTHES_DATABASE):
        if item["cloth_id"] == cloth_id:
            updated_cloth.cloth_id = cloth_id  # Preserve original ID
            CLOTHES_DATABASE[index] = jsonable_encoder(updated_cloth)
            with open(CLOTHES_FILE, "w") as f:
                json.dump(CLOTHES_DATABASE, f, indent=2)
            return {"message": f"Cloth with ID {cloth_id} updated successfully."}
    raise HTTPException(404, f"Cloth not found: {cloth_id}")

# Delete a cloth item by cloth_id (Soft delete)
@app.delete("/delete-cloth/{cloth_id}")
async def soft_delete_cloth(cloth_id: str):
    for item in CLOTHES_DATABASE:
        if item["cloth_id"] == cloth_id:
            if not item.get("is_active", True):
                raise HTTPException(400, f"Cloth {cloth_id} already deleted.")

            item["is_active"] = False

            # Load archive and append deleted item
            with open(ARCHIVE_FILE, "r") as f:
                archive = json.load(f)
            archive.append(item)

            # Save updated archive
            with open(ARCHIVE_FILE, "w") as f:
                json.dump(archive, f, indent=2)

            # Save updated main DB
            with open(CLOTHES_FILE, "w") as f:
                json.dump(CLOTHES_DATABASE, f, indent=2)

            return {"message": f"Cloth {cloth_id} marked as inactive and archived.", "cloth": item}

    raise HTTPException(404, f"Cloth not found: {cloth_id}")


@app.get("/list-active-clothes")
async def list_active_clothes():
    active_items = [item for item in CLOTHES_DATABASE if item.get("is_active", True)]
    return {"clothes": active_items}

@app.get("/list-deleted-clothes")
async def list_deleted_clothes():
    inactive_items = [item for item in CLOTHES_DATABASE if item.get("is_active") is False]
    return {"deleted_clothes": inactive_items}

@app.get("/archived-clothes")
async def get_archived_clothes():
    with open(ARCHIVE_FILE, "r") as f:
        archive = json.load(f)
    return {"archived_clothes": archive, "count": len(archive)}
