from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import jwt
import os
from DB.database_connection import get_database
from bson import ObjectId

PUBLIC_PATHS = ["/", "/v1/send-otp", "/v1/verify-otp", "/favicon.ico"]

class JWTMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)
        
        path = request.url.path

        if path in PUBLIC_PATHS:
            return await call_next(request)

        # Ensure a dummy user exists in the database and get their ID
        db = get_database()
        dummy_user = db.users.find_one({"email": "dummy@gradex.com"})
        if not dummy_user:
            inserted = db.users.insert_one({
                "email": "dummy@gradex.com",
                "paperHistory": [],
                "otp": "",
                "otpExpires": ""
            })
            dummy_user_id = str(inserted.inserted_id)
        else:
            dummy_user_id = str(dummy_user["_id"])

        # Commented out original JWT Authentication logic
        # auth_header = request.headers.get("Authorization")
        # if not auth_header or not auth_header.startswith("Bearer "):
        #     return JSONResponse(status_code=401, content={"detail": "Missing or invalid token"})
        # 
        # token = auth_header.split(" ")[1]
        # 
        # try:
        #     payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        #     request.state.user = payload
        # except jwt.ExpiredSignatureError:
        #     return JSONResponse(status_code=401, content={"detail": "Token expired"})
        # except jwt.InvalidTokenError:
        #     return JSONResponse(status_code=401, content={"detail": "Invalid token"})

        # Injecting dummy user payload for routes
        request.state.user = {
            "user_id": dummy_user_id,
            "email": "dummy@gradex.com"
        }

        return await call_next(request)
