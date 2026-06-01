from fastapi import FastAPI
from Routes.routes import router as upload_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from Middlewares.auth import JWTMiddleware
import os

load_dotenv()

app = FastAPI()

# Configure CORS FIRST (before any other middleware)
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://grade-x-utsav.vercel.app",  # Add Vercel domain directly
]

# Add from environment if set
frontend_url = os.getenv("FRONTEND_URL", "").strip()
if frontend_url and frontend_url not in allowed_origins:
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
    max_age=3600,
    expose_headers=["*"],
)

# Add JWT authentication middleware AFTER CORS
app.add_middleware(JWTMiddleware)

# Health check endpoint (no auth required)
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend is running"}

app.include_router(upload_router)
