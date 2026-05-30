from fastapi import FastAPI
from Routes.routes import router as upload_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from Middlewares.auth import JWTMiddleware

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174",
        "https://*.vercel.app",
        os.getenv("FRONTEND_URL", "http://localhost:5173")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 

app.add_middleware(JWTMiddleware)

app.include_router(upload_router)
