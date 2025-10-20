from typing import Dict, Any, Callable, Awaitable
from sqlalchemy.orm import Session
import httpx
from app.services.token_storage import refresh_oauth_token
from app.routers.oauth import oauth

async def discord_list_guilds_action(db: Session, user_id: int, params: dict) -> dict[str, Any]:
    token = await refresh_oauth_token(db, user_id, "discord")
    if not token:
        raise ValueError("Not connected to Discord")
    access_token = token.get("access_token")
    if not access_token:
        raise ValueError("Discord token missing access_token")
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://discord.com/api/users/@me/guilds",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10.0,
        )
    if response.status_code != 200:
        raise ValueError(f"Failed to fetch guilds: {response.text}")
    guilds = response.json()
    simplified = [
        {
            "id": guild.get("id"),
            "name": guild.get("name"),
            "icon": guild.get("icon"),
            "owner": guild.get("owner"),
            "permissions": guild.get("permissions"),
        }
        for guild in guilds
    ]
    return {"guilds": simplified, "total": len(simplified)}


async def google_recent_emails_action(db: Session, user_id: int, params: dict) -> dict[str, Any]:
    sender = params.get("sender") or params.get("email") or params.get("from")
    if not sender:
        raise ValueError("Missing sender email (expected param 'sender')")
    limit = params.get("limit") or params.get("count") or 20
    try:
        limit = max(1, min(20, int(limit)))
    except (TypeError, ValueError):
        limit = 20
    token = await refresh_oauth_token(db, user_id, "google")
    if not token:
        raise ValueError("Not connected to Google")
    client = oauth.create_client("google")
    list_response = await client.get(
        "gmail/v1/users/me/messages",
        params={
            "q": f"from:{sender}",
            "maxResults": limit,
            "labelIds": "INBOX",
        },
        token=token
    )
    if list_response.status_code != 200:
        try:
            detail = list_response.json()
        except Exception:
            detail = list_response.text
        raise ValueError(f"Failed to fetch emails: {detail}")
    messages_meta = list_response.json().get("messages", [])
    results: list[dict[str, Any]] = []
    for meta in messages_meta:
        message_id = meta.get("id")
        if not message_id:
            continue
        message_response = await client.get(
            f"gmail/v1/users/me/messages/{message_id}",
            params={
                "format": "metadata",
                "metadataHeaders": ["Subject", "Date", "From", "To"]
            },
            token=token
        )
        if message_response.status_code != 200:
            continue
        data = message_response.json()
        headers = {h["name"]: h["value"] for h in data.get("payload", {}).get("headers", [])}
        snippet = data.get("snippet")
        results.append({
            "id": message_id,
            "threadId": data.get("threadId"),
            "subject": headers.get("Subject"),
            "date": headers.get("Date"),
            "from": headers.get("From"),
            "to": headers.get("To"),
            "snippet": snippet,
        })
    return {"count": len(results), "messages": results}


ACTION_DISPATCH: Dict[tuple[str, str], Callable[[Session, int, dict], Awaitable[Any]]] = {
    ("discord", "list_guilds"): discord_list_guilds_action,
    ("google", "recent_emails_from_sender"): google_recent_emails_action,
}


async def execute_action(service: str, event: str, db: Session, user_id: int, params: dict) -> Any:
    handler = ACTION_DISPATCH.get((service, event))
    if not handler:
        raise NotImplementedError(f"No action for {service}:{event}")
    return await handler(db, user_id, params)
