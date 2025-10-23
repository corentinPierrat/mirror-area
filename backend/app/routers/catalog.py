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
        "action_kind": "trigger",
        "payload_schema": {
            "guild_id": {
                "type": "string",
                "label": "Server ID"
            }
        },
        "description": "Triggers when a member joins the specified Discord server.",
        "output_schema": {
            "guild_id": {
                "type": "string",
                "label": "Server ID",
                "path": "guild_id"
            },
            "member_id": {
                "type": "string",
                "label": "Member ID",
                "path": "user.id"
            },
            "member_username": {
                "type": "string",
                "label": "Member Username",
                "path": "user.username"
            }
        }
    },
    "discord.member_remove": {
        "title": "A member leaves the Discord server",
        "service": "discord",
        "event": "member_remove",
        "action_kind": "trigger",
        "payload_schema": {
            "guild_id": {
                "type": "string",
                "label": "Server ID"
            }
        },
        "description": "Triggers when a member leaves the specified Discord server.",
        "output_schema": {
            "guild_id": {
                "type": "string",
                "label": "Server ID",
                "path": "guild_id"
            },
            "member_id": {
                "type": "string",
                "label": "Member ID",
                "path": "user.id"
            },
            "member_username": {
                "type": "string",
                "label": "Member Username",
                "path": "user.username"
            }
        }
    },
    "discord.member_update": {
        "title": "A member updates their nickname",
        "service": "discord",

        "event": "member_update",
        "action_kind": "trigger",
        "payload_schema": {
            "guild_id": {
                "type": "string",
                "label": "Server ID"
            }
        },
        "description": "Triggers when a member changes their nickname in the specified Discord server.",
        "output_schema": {
            "guild_id": {
                "type": "string",
                "label": "Server ID",
                "path": "guild_id"
            },
            "member_id": {
                "type": "string",
                "label": "Member ID",
                "path": "user.id"
            },
            "new_nickname": {
                "type": "string",
                "label": "New Nickname",
                "path": "new_nick"
            },
            "old_nickname": {
                "type": "string",
                "label": "Old Nickname",
                "path": "old_nick"
            }
        }
    },
    "twitch.stream_online": {
        "title": "Stream goes live",
        "service": "twitch",
        "event": "stream.online",
        "action_kind": "trigger",
        "payload_schema": {
            "username_streamer": {
                "type": "string",
                "label": "Streamer Username"
            }
        },
        "description": "Triggers when a Twitch stream goes live.",
        "output_schema": {
            "broadcaster_user_id": {
                "type": "string",
                "label": "Broadcaster ID",
                "path": "broadcaster_user_id"
            },
            "broadcaster_user_name": {
                "type": "string",
                "label": "Broadcaster Name",
                "path": "broadcaster_user_name"
            },
            "message": {
                "type": "string",
                "label": "Message",
                "path": "message"
            }
        }
    },
    "twitch.new_follow": {
        "title": "New follower",
        "service": "twitch",
        "event": "channel.follow",
        "action_kind": "trigger",
        "payload_schema": {
            "username_streamer": {
                "type": "string",
                "label": "Streamer Username"
            }
        },
        "description": "Triggers when someone follows the channel.",
        "output_schema": {
            "broadcaster_user_id": {
                "type": "string",
                "label": "Broadcaster ID",
                "path": "broadcaster_user_id"
            },
            "follower_name": {
                "type": "string",
                "label": "Follower Name",
                "path": "follower_name"
            },
            "message": {
                "type": "string",
                "label": "Message",
                "path": "message"
            }
        }
    },
    "twitch.new_subscriber": {
        "title": "New subscriber",
        "service": "twitch",
        "event": "channel.subscribe",
        "action_kind": "trigger",
        "payload_schema": {
            "username_streamer": {
                "type": "string",
                "label": "Streamer Username"
            }
        },
        "description": "Triggers when someone subscribes to the channel.",
        "output_schema": {
            "broadcaster_user_id": {
                "type": "string",
                "label": "Broadcaster ID",
                "path": "broadcaster_user_id"
            },
            "subscriber_name": {
                "type": "string",
                "label": "Subscriber Name",
                "path": "subscriber_name"
            },
            "tier": {
                "type": "string",
                "label": "Subscription Tier",
                "path": "tier"
            },
            "message": {
                "type": "string",
                "label": "Message",
                "path": "message"
            }
        }
    },
    "discord.list_guilds": {
        "title": "List my Discord servers",
        "service": "discord",
        "event": "list_guilds",
        "action_kind": "getter",
        "payload_schema": {},
        "description": "Retrieves the list of Discord servers linked to your account.",
        "output_schema": {
            "text": {
                "type": "string",
                "label": "Guild names (one per line)",
                "path": "text"
            }
        }
    },
    "google.recent_emails_from_sender": {
        "title": "Fetch recent emails from a sender",
        "service": "google",
        "event": "recent_emails_from_sender",
        "action_kind": "getter",
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
        "description": "Returns up to N recent emails received from the specified sender.",
        "output_schema": {
            "count": {
                "type": "number",
                "label": "Email count",
                "path": "count"
            },
            "messages": {
                "type": "array",
                "label": "Messages",
                "path": "messages"
            }
        }
    },
    "faceit.retrieve_player_stats": {
        "title": "Retrieve FACEIT player statistics",
        "service": "faceit",
        "event": "retrieve_player_stats",
        "action_kind": "getter",
        "payload_schema": {
            "player_id": {
                "type": "string",
                "label": "Player ID"
            },
            "game_id": {
                "type": "string",
                "label": "Game ID",
                "default": "csgo"
            },
            "limit": {
                "type": "number",
                "label": "Limit",
                "default": 20,
                "optional": True
            },
            "from": {
                "type": "number",
                "label": "From (epoch ms)",
                "optional": True
            },
            "to": {
                "type": "number",
                "label": "To (epoch ms)",
                "optional": True
            }
        },
        "description": "Fetches aggregated statistics for a player over recent FACEIT matches.",
        "output_schema": {
            "stats": {
                "type": "object",
                "label": "Statistics payload",
                "path": "stats"
            }
        }
    },
    "faceit.retrieve_player_ranking": {
        "title": "Retrieve FACEIT player ranking",
        "service": "faceit",
        "event": "retrieve_player_ranking",
        "action_kind": "getter",
        "payload_schema": {
            "player_id": {
                "type": "string",
                "label": "Player ID"
            },
            "game_id": {
                "type": "string",
                "label": "Game ID",
                "default": "cs2"
            },
            "region": {
                "type": "string",
                "label": "Region",
                "default": "EU"
            },
            "country": {
                "type": "string",
                "label": "Country (ISO code)",
                "optional": True
            },
            "limit": {
                "type": "number",
                "label": "Limit",
                "default": 20,
                "optional": True
            }
        },
        "description": "Retrieves the player ranking details within the specified FACEIT game region.",
        "output_schema": {
            "ranking": {
                "type": "object",
                "label": "Ranking payload",
                "path": "ranking"
            }
        }
    },
    "faceit.retrieve_hub_details": {
        "title": "Retrieve FACEIT hub details",
        "service": "faceit",
        "event": "retrieve_hub_details",
        "action_kind": "getter",
        "payload_schema": {
            "hub_id": {
                "type": "string",
                "label": "Hub ID"
            },
            "expanded": {
                "type": "string[]",
                "label": "Expand entities (organizer, game)",
                "optional": True
            }
        },
        "description": "Fetches information about a FACEIT hub.",
        "output_schema": {
            "hub": {
                "type": "object",
                "label": "Hub payload",
                "path": "hub"
            }
        }
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
    "spotify.play_playlist": {
        "title": "Play a Spotify playlist",
        "service": "spotify",
        "event": "play_playlist",
        "payload_schema": {
            "playlist_id": {
                "type": "string",
                "label": "Playlist ID"
            }
        },
        "description": "Plays the specified playlist on the user's active Spotify device."
    },
    "spotify.play_track": {
        "title": "Play a Spotify track",
        "service": "spotify",
        "event": "play_track",
        "payload_schema": {
            "track_id": {
                "type": "string",
                "label": "Track ID"
            }
        },
        "description": "Plays the specified track on the user's active Spotify device."
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
