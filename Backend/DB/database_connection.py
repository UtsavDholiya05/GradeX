from pymongo import MongoClient
import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=env_path)
load_dotenv()

_client = None
_db = None

def get_database():
    """
    Returns a pooled, singleton MongoDB database instance.
    Reuses connection across requests instead of reconnecting on every call.
    """
    global _client, _db
    if _db is not None:
        return _db
    try:
        _client = MongoClient(
            os.getenv("MONGODB_URI"),
            maxPoolSize=50,
            minPoolSize=5,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=20000
        )
        _db = _client["Gradex"]
        return _db
    except Exception as e:
        raise Exception(f"Database connection error: {e}")
