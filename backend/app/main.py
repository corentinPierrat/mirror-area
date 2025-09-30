from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.database import engine, Base
from app.routers.auth import auth_router
from app.routers.oauth import oauth_router
from app.routers.actions import actions_router
from app.routers.reactions import reactions_router

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key="!secret!", same_site="lax", https_only=False)

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
app.include_router(oauth_router)
app.include_router(actions_router)
app.include_router(reactions_router)

@app.get("/")
def read_root():
    return {"message": "Backend FastAPI is running 🚀"}