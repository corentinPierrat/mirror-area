from app.services.token_storage import get_token_from_db, refresh_oauth_token
from app.routers.oauth import oauth
from sqlalchemy.orm import Session
from typing import Dict, Any, Callable
from datetime import datetime, timedelta, timezone
import httpx
import base64
from email.mime.text import MIMEText
from app.config import settings

async def twitter_tweet_reaction(db: Session, user_id: int, params: dict):
    token = await refresh_oauth_token(db, user_id, "twitter")
    if not token:
        return {"error": "Not logged in to Twitter"}
    text = params.get("message") or params.get("text")
    if not text or not text.strip():
        return {"error": "Missing text"}
    resp = await oauth.twitter.post("tweets", token=token, json={"text": text})
    if resp.status_code in (200, 201):
        return resp.json()
    else:
        return {"error": resp.json()}

async def google_send_mail_reaction(db: Session, user_id: int, params: dict):
    token = await refresh_oauth_token(db, user_id, "google")
    if not token:
        return {"error": "Not logged in to Google"}

    client = oauth.create_client("google")
    mime_message = MIMEText(params["content"], "plain", "utf-8")
    mime_message["to"] = params["to"]
    mime_message["subject"] = params["subject"]
    raw_message = base64.urlsafe_b64encode(mime_message.as_bytes()).decode()
    message_body = {"raw": raw_message}
    resp = await client.post("gmail/v1/users/me/messages/send", json=message_body, token=token)

    if resp.status_code in (200, 201, 202):
        return {"status": "Email envoyé avec succès"}
    else:
        try:
            return {"error": resp.json()}
        except Exception:
            return {"error": resp.text}

async def google_calendar_event_reaction(db: Session, user_id: int, params: dict):
    token = await refresh_oauth_token(db, user_id, "google")
    if not token:
        return {"error": "Not logged in to Google"}

    title = params.get("title")
    if not title or not title.strip():
        return {"error": "Missing title"}

    today = datetime.now(timezone.utc).date()
    tomorrow = today + timedelta(days=1)

    client = oauth.create_client("google")
    calendar_id = params.get("calendar_id", "primary")

    event_body = {
        "summary": title,
        "description": params.get("description"),
        "start": {"date": today.isoformat()},
        "end": {"date": tomorrow.isoformat()},
    }

    event_body = {k: v for k, v in event_body.items() if v is not None}

    response = await client.post(
        f"calendar/v3/calendars/{calendar_id}/events",
        json=event_body,
        token=token
    )

    if response.status_code in (200, 201):
        data = response.json()
        return {
            "status": "Event created successfully",
            "event_id": data.get("id"),
            "htmlLink": data.get("htmlLink")
        }
    try:
        return {"error": response.json()}
    except Exception:
        return {"error": response.text}

async def discord_send_message_reaction(db: Session, user_id: int, params: dict):
    channel_id = params.get("channel_id")
    message = params.get("message") or params.get("content")
    if not channel_id:
        return {"error": "Missing channel_id"}
    if not message or not message.strip():
        return {"error": "Missing message"}

    bot_token = settings.TOKEN_BOT_DISCORD
    if not bot_token:
        return {"error": "Discord bot token not configured"}

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://discord.com/api/channels/{channel_id}/messages",
            headers={
                "Authorization": f"Bot {bot_token}",
                "Content-Type": "application/json"
            },
            json={"content": message},
            timeout=10.0
        )

    if response.status_code in (200, 201):
        data = response.json()
        return {"status": "Message envoyé", "message_id": data.get("id")}
    try:
        return {"error": response.json()}
    except Exception:
        return {"error": response.text}

async def faceit_send_message_reaction(db: Session, user_id: int, params: dict):
    room_id = params.get("room_id")
    message_body = params.get("body") or params.get("message")
    if not room_id:
        return {"error": "Missing room_id"}
    if not message_body or not message_body.strip():
        return {"error": "Missing body"}
    token_data = get_token_from_db(db, user_id, "faceit")
    if not token_data:
        return {"error": "Not logged in to Faceit"}
    access_token = token_data.get("access_token")
    if not access_token:
        return {"error": "Faceit access token missing"}
    payload = {"body": message_body}
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://open.faceit.com/data/v4/chat/rooms/{room_id}/messages",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=10.0,
        )
    if response.status_code in (200, 201):
        data = response.json()
        return {
            "status": "Message sent",
            "message_id": data.get("id")
        }
    try:
        return {"error": response.json()}
    except Exception:
        return {"error": response.text}

async def spotify_play_playlist_reaction(db: Session, user_id: int, params: dict):
    token = await refresh_oauth_token(db, user_id, "spotify")
    if not token:
        return {"error": "Not logged in to Spotify"}
    playlist_id = params.get("playlist_id")
    if not playlist_id:
        return {"error": "Missing playlist_id"}
    playlist_uri = f"spotify:playlist:{playlist_id}"
    resp = await oauth.spotify.put(
        "me/player/play",
        token=token,
        json={"context_uri": playlist_uri}
    )
    if resp.status_code in (200, 204):
        return resp.json()
    else:
        return {"error": resp.json()}

async def spotify_play_track_reaction(db: Session, user_id: int, params: dict):
    token = await refresh_oauth_token(db, user_id, "spotify")
    if not token:
        return {"error": "Not logged in to Spotify"}
    track_id = params.get("track_id")
    if not track_id:
        return {"error": "Missing track_id"}
    track_uri = f"spotify:track:{track_id}"
    resp = await oauth.spotify.put(
        "me/player/play",
        token=token,
        json={"uris": [track_uri]}
    )
    if resp.status_code in (200, 204):
        return resp.json()
    else:
        return {"error": resp.json()}

REACTION_DISPATCH: Dict[tuple[str, str], Callable[[Session, int, dict], Any]] = {
    ("twitter", "tweet"): twitter_tweet_reaction,
    ("google", "send_mail"): google_send_mail_reaction,
    ("google", "create_calendar_event"): google_calendar_event_reaction,
    ("discord", "send_channel_message"): discord_send_message_reaction,
    ("faceit", "send_room_message"): faceit_send_message_reaction,
    ("spotify", "play_playlist"): spotify_play_playlist_reaction,
}

async def execute_reaction(service: str, event: str, db: Session, user_id: int, params: dict):
    func = REACTION_DISPATCH.get((service, event))
    if not func:
        raise NotImplementedError(f"No reaction for {service}:{event}")
    return await func(db, user_id, params)
