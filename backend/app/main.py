from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.database import engine, Base
from app.routers.auth import auth_router

app = FastAPI()

origins = [
    "http://127.0.0.1:8081",
    "http://localhost:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"message": "Backend FastAPI is running 🚀"}

