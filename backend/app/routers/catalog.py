from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth import get_current_user
from app.services.token_storage import get_token_from_db

catalog_router = APIRouter(prefix="/catalog", tags=["catalog"])

ACTIONS_CATALOG = {
    "discord.member_join": {
        "title": "Un membre rejoint le serveur Discord",
        "service": "discord",
        "event": "member_join",
        "payload_schema": {
            "guild_id": "string"
        },
        "description": "Déclenche l'action lorsqu'un membre rejoint le serveur Discord spécifié."
    },
}

REACTIONS_CATALOG = {
    "twitter.tweet": {
        "title": "Tweeter un message",
        "service": "twitter",
        "event": "tweet",
        "description": "Publie un tweet avec le texte fourni.",
        "payload_schema": None
    },
    "microsoft.send_mail": {
        "title": "Envoyer un email (Microsoft 365)",
        "service": "microsoft",
        "event": "send_mail",
        "payload_schema": {
            "to": "string[] (email)",
            "subject": "string",
            "content": "string",
            "content_type": "string (HTML|Text) = HTML"
        },
        "description": "Envoie un courriel via Microsoft Graph."
    },
}

@catalog_router.get("/actions")
async def get_actions(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    out = {}
    for key, meta in ACTIONS_CATALOG.items():
        token = get_token_from_db(db, current_user.id, meta["service"])
        out[key] = {**meta, "available": bool(token)}
    return JSONResponse(out)

@catalog_router.get("/reactions")
async def get_reactions(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    out = {}
    for key, meta in REACTIONS_CATALOG.items():
        token = get_token_from_db(db, current_user.id, meta["service"])
        out[key] = {**meta, "available": bool(token)}
    return JSONResponse(out)