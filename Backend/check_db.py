from DB.database_connection import get_database
import os
from dotenv import load_dotenv

load_dotenv()
try:
    db = get_database()
    print("Database connected successfully!")
    user = db.users.find_one({"email": "dummy@gradex.com"})
    print("Dummy User:", user)
except Exception as e:
    print("Error:", e)
