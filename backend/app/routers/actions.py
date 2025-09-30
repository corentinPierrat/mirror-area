from fastapi import APIRouter, Request, Body
from fastapi.responses import JSONResponse
from app.routers.oauth import oauth, get_token

actions_router = APIRouter(prefix="/actions", tags=["actions"])
