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
    "discord.member_remove": {
        "title": "A member leaves the Discord server",
        "service": "discord",
        "event": "member_remove",
        "payload_schema": {
            "guild_id": {
                "type": "string",
                "label": "Server ID"
            }
        },
        "description": "Triggers when a member leaves the specified Discord server."
    },
    "discord.member_update": {
        "title": "A member updates their nickname",
        "service": "discord",

        "event": "member_update",
        "payload_schema": {
            "guild_id": {
                "type": "string",
                "label": "Server ID"
            }
        },
        "description": "Triggers when a member changes their nickname in the specified Discord server."
    },
    "twitch.stream_online": {
        "title": "Stream goes live",
        "service": "twitch",
        "event": "stream.online",
        "payload_schema": {
            "username_streamer": {
                "type": "string",
                "label": "Streamer Username"
            }
        },
        "description": "Triggers when a Twitch stream goes live."
    },
    "twitch.new_follow": {
        "title": "New follower",
        "service": "twitch",
        "event": "channel.follow",
        "payload_schema": {
            "username_streamer": {
                "type": "string",
                "label": "Streamer Username"
            }
        },
        "description": "Triggers when someone follows the channel."
    },
    "twitch.new_subscriber": {
        "title": "New subscriber",
        "service": "twitch",
        "event": "channel.subscribe",
        "payload_schema": {
            "username_streamer": {
                "type": "string",
                "label": "Streamer Username"
            }
        },
        "description": "Triggers when someone subscribes to the channel."
    },
    "faceit.stats": {
        "title": "FACEIT – My lifetime stats",
        "service": "faceit",
        "event": "stats",
        "payload_schema": {
            "game": { "type": "string", "label": "Game", "default": "cs2" }
        },
        "description": "Fetches YOUR lifetime stats (wins, ELO, skill level, etc.) from your connected FACEIT account."
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