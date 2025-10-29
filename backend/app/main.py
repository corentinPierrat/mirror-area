from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.database import engine, Base
from app.routers.auth import auth_router
from app.routers.oauth import oauth_router
from app.routers.actions import actions_router
from app.routers.catalog import catalog_router
from app.routers.workflow import workflows_router
from app.routers.about import about_router
from app.routers.admin import admin_router
from app.routers.feed import feed_router
from app.config import settings
from app.services.timer_scheduler import scheduler as timer_scheduler

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY, same_site="lax", https_only=False)

origins = [
    "http://127.0.0.1:8081",
    "http://localhost:8081",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(oauth_router)
app.include_router(actions_router)
app.include_router(catalog_router)
app.include_router(workflows_router)
app.include_router(about_router)
app.include_router(admin_router)
app.include_router(feed_router)


@app.on_event("startup")
async def start_background_services():
    timer_scheduler.start()


@app.on_event("shutdown")
async def stop_background_services():
    await timer_scheduler.shutdown()


@app.get("/")
def read_root():
    return {"message": "Backend FastAPI is running 🚀"}
