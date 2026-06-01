from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import jwt
import os

PUBLIC_PATHS = ["/", "/health", "/v1/send-otp", "/v1/verify-otp", "/favicon.ico"]

class JWTMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow all OPTIONS requests (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)
        
        path = request.url.path

        # Allow public paths without auth
        if path in PUBLIC_PATHS:
            return await call_next(request)

        # Check for valid JWT token
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Missing or invalid token"})

        token = auth_header.split(" ")[1]

        try:
            jwt_secret = os.getenv("JWT_SECRET")
            if not jwt_secret:
                return JSONResponse(status_code=500, content={"detail": "JWT_SECRET not configured"})
                
            payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
            request.state.user = payload
        except jwt.ExpiredSignatureError:
            return JSONResponse(status_code=401, content={"detail": "Token expired"})
        except jwt.InvalidTokenError as e:
            return JSONResponse(status_code=401, content={"detail": f"Invalid token: {str(e)}"})

        return await call_next(request)
