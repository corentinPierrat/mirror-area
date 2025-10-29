import requests
from sqlalchemy.orm import Session
from app.config import settings
from app.services.token_storage import refresh_oauth_token
from fastapi import HTTPException

async def get_app_access_token() -> str:
    response = requests.post(
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

    response = requests.get(f"https://api.twitch.tv/helix/users?login={username_streamer}", headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Erreur Twitch API: {response.text}")

    data = response.json()
    if not data.get("data"):
        raise HTTPException(status_code=404, detail=f"Streamer '{username_streamer}' introuvable")

    user = data["data"][0]
    return user["id"]

async def create_twitch_webhook(event_type: str, broadcaster_id: str, db: Session, user_id: int) -> str:
    if event_type == "stream.online":
        app_token = await get_app_access_token()
    else:
        app_token = refresh_oauth_token(db, user_id, "twitch")

    headers = {
        "Authorization": f"Bearer {app_token}",
        "Client-Id": settings.TWITCH_CLIENT_ID,
        "Content-Type": "application/json"
    }

    subscription_data = {
        "type": event_type,
        "version": "2",
        "condition": {
            "broadcaster_user_id": broadcaster_id
        },
        "transport": {
            "method": "webhook",
            "callback": "https://trigger.ink/actions/twitch",
            "secret": settings.TWITCH_WEBHOOK_SECRET
        }
    }

    response = requests.post(
        "https://api.twitch.tv/helix/eventsub/subscriptions",
        json=subscription_data,
        headers=headers
    )

    if response.status_code == 202:
        webhook_data = response.json()["data"][0]
        print(f"[logs] Twitch webhook created successfully: event_type={event_type} webhook_id={webhook_data.get('id')}")
        return webhook_data["id"]
    else:
        print(f"[logs] Failed to create Twitch webhook: status={response.status_code} body={response.text}")
        raise Exception(f"Failed to create webhook: {response.text}")

async def delete_twitch_webhook(db: Session, user_id: int, webhook_id: str):
    token = await get_app_access_token()
    if not token:
        raise HTTPException(status_code=401, detail="User not connected to Twitch")

    headers = {
        "Authorization": f"Bearer {token}",
        "Client-Id": settings.TWITCH_CLIENT_ID
    }

    response = requests.delete(
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