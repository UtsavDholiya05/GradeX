from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, PlainTextResponse
import jwt
import os

PUBLIC_PATHS = ["/", "/health", "/v1/send-otp", "/v1/verify-otp", "/favicon.ico"]

class JWTMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Handle OPTIONS requests immediately - return 200 with CORS headers
        if request.method == "OPTIONS":
            return PlainTextResponse(
                "",
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                    "Access-Control-Max-Age": "3600",
                }
            )
        
        path = request.url.path

        # Allow public paths without auth
        if path in PUBLIC_PATHS:
            response = await call_next(request)
            response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
            return response

        # Check for valid JWT token
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401, 
                content={"detail": "Missing or invalid token"},
                headers={
                    "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                }
            )

        token = auth_header.split(" ")[1]

        try:
            jwt_secret = os.getenv("JWT_SECRET")
            if not jwt_secret:
                return JSONResponse(
                    status_code=500, 
                    content={"detail": "JWT_SECRET not configured"},
                    headers={
                        "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization",
                    }
                )
                
            payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
            request.state.user = payload
        except jwt.ExpiredSignatureError:
            return JSONResponse(
                status_code=401, 
                content={"detail": "Token expired"},
                headers={
                    "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                }
            )
        except jwt.InvalidTokenError as e:
            return JSONResponse(
                status_code=401, 
                content={"detail": f"Invalid token: {str(e)}"},
                headers={
                    "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                }
            )

        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
        return response
