from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import jwt
import os
from DB.database_connection import get_database
from bson import ObjectId

PUBLIC_PATHS = ["/", "/v1/send-otp", "/v1/verify-otp", "/favicon.ico"]

cached_dummy_user_id = None

class JWTMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        global cached_dummy_user_id
        if request.method == "OPTIONS":
            return await call_next(request)
        
        path = request.url.path

        if path in PUBLIC_PATHS:
            return await call_next(request)

        # Cache dummy user ID in memory so we don't query MongoDB Atlas on every single request
        if not cached_dummy_user_id:
            try:
                db = get_database()
                dummy_user = db.users.find_one({"email": "dummy@gradex.com"})
                if not dummy_user:
                    inserted = db.users.insert_one({
                        "email": "dummy@gradex.com",
                        "paperHistory": [],
                        "otp": "",
                        "otpExpires": ""
                    })
                    cached_dummy_user_id = str(inserted.inserted_id)
                else:
                    cached_dummy_user_id = str(dummy_user["_id"])
            except Exception as e:
                print(f"Error resolving dummy user in middleware: {e}")
                cached_dummy_user_id = "000000000000000000000000"

        # Inject dummy user payload for routes
        request.state.user = {
            "user_id": cached_dummy_user_id,
            "email": "dummy@gradex.com"
        }

        return await call_next(request)
