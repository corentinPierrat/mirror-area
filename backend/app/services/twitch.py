import httpx
from sqlalchemy.orm import Session
from app.config import settings
from app.services.token_storage import refresh_oauth_token
from fastapi import HTTPException

async def get_app_access_token() -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://id.twitch.tv/oauth2/token",
            params={
                "client_id": settings.TWITCH_CLIENT_ID,
                "client_secret": settings.TWITCH_CLIENT_SECRET,
                "grant_type": "client_credentials"
            }
        )
    if response.status_code != 200:
        raise Exception(f"Failed to get app access token: {response.text}")
    data = response.json()
    return data["access_token"]

async def get_twitch_user_id(username_streamer: str) -> str:
    token = await get_app_access_token()
    if not token:
        raise HTTPException(status_code=401, detail="User not connected to Twitch")

    headers = {
        "Authorization": f"Bearer {token}",
        "Client-Id": settings.TWITCH_CLIENT_ID
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.twitch.tv/helix/users?login={username_streamer}",
            headers=headers
        )
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Erreur Twitch API: {response.text}")

    data = response.json()
    if not data.get("data"):
        raise HTTPException(status_code=404, detail=f"Streamer '{username_streamer}' introuvable")

    user = data["data"][0]
    return user["id"]

async def create_twitch_webhook(event_type: str, broadcaster_id: str, db: Session, user_id: int) -> str:
    if event_type:
        token = await get_app_access_token()
    else:
        token = await refresh_oauth_token(db, user_id, "twitch")
        if not token:
            raise HTTPException(status_code=401, detail="User not connected to Twitch")

    headers = {
        "Authorization": f"Bearer {token}",
        "Client-Id": settings.TWITCH_CLIENT_ID,
        "Content-Type": "application/json"
    }

    subscription_data = {
        "type": event_type,
        "version": "2" if event_type == "channel.follow" else "1",
        "condition": {
            "broadcaster_user_id": broadcaster_id
        },
        "transport": {
            "method": "webhook",
            "callback": "https://trigger.ink/actions/twitch",
            "secret": settings.TWITCH_WEBHOOK_SECRET
        }
    }

    if event_type == "channel.follow":
        subscription_data["condition"]["moderator_user_id"] = broadcaster_id

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.twitch.tv/helix/eventsub/subscriptions",
            headers=headers,
            json=subscription_data
        )

    if response.status_code == 202:
        data = response.json().get("data", [])
        if not data:
            raise HTTPException(status_code=500, detail="Empty response from Twitch.")
        return data[0]["id"]
    else:
        error_detail = response.json() if response.text else response.text
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Failed to create webhook: {error_detail}"
        )

async def delete_twitch_webhook(db: Session, user_id: int, webhook_id: str, event_type: str):
    if event_type == "stream.online":
        token = await get_app_access_token()
    else:
        token = await refresh_oauth_token(db, user_id, "twitch")
        if not token:
            raise HTTPException(status_code=401, detail="User not connected to Twitch")

    headers = {
        "Authorization": f"Bearer {token}",
        "Client-Id": settings.TWITCH_CLIENT_ID
    }

    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"https://api.twitch.tv/helix/eventsub/subscriptions?id={webhook_id}",
            headers=headers
        )

    if response.status_code != 204:
        raise HTTPException(status_code=500, detail=f"Failed to delete webhook: {response.text}")

def parse_twitch_event(event_type: str, event_data: dict):
    payload = None

    if event_type == "stream.online":
        payload = {
            "event": "stream.online",
            "broadcaster_user_id": event_data.get("broadcaster_user_id"),
            "broadcaster_user_name": event_data.get("broadcaster_user_name"),
            "message": f"{event_data.get('broadcaster_user_name')} is now live!"
        }
    elif event_type == "channel.follow":
        payload = {
            "event": "new.follow",
            "broadcaster_user_id": event_data.get("broadcaster_user_id"),
            "follower_name": event_data.get("user_name"),
            "message": f"{event_data.get('user_name')} just followed {event_data.get('broadcaster_user_name')}!"
        }
    elif event_type == "channel.subscribe":
        payload = {
            "event": "new.subscriber",
            "broadcaster_user_id": event_data.get("broadcaster_user_id"),
            "subscriber_name": event_data.get("user_name"),
            "tier": event_data.get("tier", "1000"),
            "message": f"{event_data.get('user_name')} just subscribed to {event_data.get('broadcaster_user_name')}!"
        }
    return payload

async def get_existing_twitch_webhook_id(event_type: str, broadcaster_id: str) -> str | None:
    headers = {
        "Authorization": f"Bearer {await get_app_access_token()}",
        "Client-Id": settings.TWITCH_CLIENT_ID
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.twitch.tv/helix/eventsub/subscriptions",
            headers=headers
        )
    if resp.status_code != 200:
        return None
    for sub in resp.json().get("data", []):
        cond = sub.get("condition", {})
        if (
            sub.get("type") == event_type
            and cond.get("broadcaster_user_id") == broadcaster_id
            and sub.get("transport", {}).get("callback") == "https://trigger.ink/actions/twitch"
            and sub.get("status") == "enabled"
        ):
            return sub["id"]
    return None