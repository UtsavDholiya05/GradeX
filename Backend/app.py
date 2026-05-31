from fastapi import FastAPI
from Routes.routes import router as upload_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from Middlewares.auth import JWTMiddleware
import os

load_dotenv()

app = FastAPI()

# CORS configuration for development and production
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://grade-x-utsav.vercel.app",
]

# Add Vercel deployment URL if provided
vercel_url = os.getenv("VERCEL_URL")
if vercel_url:
    allowed_origins.append(f"https://{vercel_url}")

# Add Render domain if provided via environment variable
render_domain = os.getenv("RENDER_DOMAIN")
if render_domain:
    allowed_origins.append(render_domain)

# Add custom domain if provided
custom_frontend_domain = os.getenv("FRONTEND_DOMAIN")
if custom_frontend_domain:
    allowed_origins.append(custom_frontend_domain)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(JWTMiddleware)

app.include_router(upload_router)
