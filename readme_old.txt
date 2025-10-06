# Online Clothing Store API
A lightweight FastAPI application for managing an online clothing store. It supports listing, adding, and retrieving clothes with persistent storage via a JSON file. Ideal for learning RESTful design, enum usage, and basic file I/O in Python.

# Features
List all clothes in the store.

Retrieve clothes by index or unique ID.

Add new clothes with automatic UUID generation.

Fetch a random item from the store.

Persist data using a local JSON file.

Categorize clothes using an Enum (tops, bottoms, outerwear, etc.)

# Tech Stack
FastAPI for API development.

Pydantic for data validation. 

Enum for structured cloth types. 

JSON for lightweight storage. 

# Setup Instructions
Clone the repository: 
git clone https://github.com/alanphilip/Clothing_Store_API.git

cd clothing-store-api

Create a virtual environment: 
python -m venv .venv

source .venv/bin/activate  # On Windows: venv\Scripts\activate

Install dependencies
pip install -r requirements.txt

Run the server: 
uvicorn main:app --reload

# API Endpoints
| Method | Endpoint             | Description            |
|--------|----------------------|------------------------|
| GET    | /                    | Welcome message        |
| GET    | /list-clothes        | List all clothes       |
| GET    | /cloth-by-index{i}   | Get cloth by index     |
| GET    | /random-cloth        | Fetch a random cloth   |
| GET    | /get-cloth?cloth_id= | Retrieve cloth by UUID |
| POST   | /add-cloth           | Add a new cloth item   |

# Sample POST /add-cloth Request (Json)
{
"cloth_name": "Denim Jacket",
"price": 49.99,
"type": "outerwear"
}

# Data Persistence
All cloth items are stored in clothes.json. On app startup, the file is loaded into memory. New items are appended and saved automatically.

# Future Enhancements

Test token expiration at 1 minute

add smoke test for backend main.py

add a front end UI

deploy as a web app in azure 

Alembic migrations

upgrade to PostgreSQL

# Author
Built by Alan Philip