from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

def get_database():
    try:
        client = MongoClient(os.getenv("MONGODB_URI"))
        db = client["Gradex"]
        return db
    except Exception as e:
        raise Exception(f"Database connection error: {e}")
