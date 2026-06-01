from fastapi import FastAPI
from Routes.routes import router as upload_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from Middlewares.auth import JWTMiddleware
import os

load_dotenv()

app = FastAPI()

# Configure CORS for both local development and production
allowed_origins = [
    "http://localhost:5173",  # Local Vite frontend
    "http://localhost:3000",  # Alternative local port
]

# Add Vercel deployment domain if FRONTEND_URL is set
frontend_url = os.getenv("FRONTEND_URL", "").strip()
if frontend_url:
    # Remove trailing slash if present
    frontend_url = frontend_url.rstrip("/")
    allowed_origins.append(frontend_url)
    print(f"CORS enabled for: {frontend_url}")

print(f"All allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enable JWT authentication middleware
app.add_middleware(JWTMiddleware)

# Health check endpoint (no auth required)
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend is running"}

app.include_router(upload_router)
