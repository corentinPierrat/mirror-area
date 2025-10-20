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
    "discord.list_guilds": {
        "title": "List my Discord servers",
        "service": "discord",
        "event": "list_guilds",
        "payload_schema": {},
        "description": "Retrieves the list of Discord servers linked to your account."
    },
    "google.recent_emails_from_sender": {
        "title": "Fetch recent emails from a sender",
        "service": "google",
        "event": "recent_emails_from_sender",
        "payload_schema": {
            "sender": {
                "type": "string (email)",
                "label": "Sender email"
            },
            "limit": {
                "type": "number",
                "label": "Number of messages",
                "default": 20
            }
        },
        "description": "Returns up to N recent emails received from the specified sender."
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
    "google.create_calendar_event": {
        "title": "Create a calendar event (today)",
        "service": "google",
        "event": "create_calendar_event",
        "payload_schema": {
            "title": {
                "type": "string",
                "label": "Title"
            },
            "description": {
                "type": "string",
                "label": "Description"
            },
            "calendar_id": {
                "type": "string",
                "label": "Calendar ID",
                "default": "primary"
            }
        },
        "description": "Creates an all-day event for today in your Google Calendar."
    },
    "discord.send_channel_message": {
        "title": "Send a message to a Discord channel",
        "service": "discord",
        "event": "send_channel_message",
        "payload_schema": {
            "channel_id": {
                "type": "string",
                "label": "Channel ID"
            },
            "message": {
                "type": "string",
                "label": "Message content"
            }
        },
        "description": "Sends a message to the specified Discord channel using the connected bot."
    },
    "faceit.send_room_message": {
        "title": "Send a message to a FACEIT room",
        "service": "faceit",
        "event": "send_room_message",
        "payload_schema": {
            "room_id": {
                "type": "string",
                "label": "Room ID"
            },
            "body": {
                "type": "string",
                "label": "Message body"
            }
        },
        "description": "Posts a message in the specified FACEIT chat room."
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
