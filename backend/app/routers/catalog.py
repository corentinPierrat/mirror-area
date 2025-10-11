from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth import get_current_user
from app.services.token_storage import get_token_from_db

catalog_router = APIRouter(prefix="/catalog", tags=["catalog"])

ACTIONS_CATALOG = {
    "discord.member_join": {
        "title": "A member joins the Discord server",
        "service": "discord",
        "event": "member_join",
        "payload_schema": {
            "guild_id": {
                "type": "string",
                "label": "Server ID"
            }
        },
        "description": "Triggers when a member joins the specified Discord server."
    },
}

REACTIONS_CATALOG = {
    "twitter.tweet": {
        "title": "Post a tweet",
        "service": "twitter",
        "event": "tweet",
        "payload_schema": {
            "text": {
                "type": "string",
                "label": "Tweet text"
            }
        },
        "description": "Posts a tweet with the given text."
    },
    "google.send_mail": {
        "title": "Send an email (Gmail)",
        "service": "google",
        "event": "send_mail",
        "payload_schema": {
            "to": {
                "type": "string[] (email)",
                "label": "Recipients"
            },
            "subject": {
                "type": "string",
                "label": "Subject"
            },
            "content": {
                "type": "string",
                "label": "Body"
            },
            "content_type": {
                "type": "string (HTML|Text)",
                "default": "HTML",
                "label": "Format"
            }
        },
        "description": "Sends an email using the Gmail API."
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