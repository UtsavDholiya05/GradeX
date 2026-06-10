from fastapi import FastAPI
from Routes.routes import router as upload_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from Middlewares.auth import JWTMiddleware
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://grade-x-utsav.vercel.app",
        os.getenv("FRONTEND_URL", "https://grade-x-utsav.vercel.app")
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(JWTMiddleware)

app.include_router(upload_router)
