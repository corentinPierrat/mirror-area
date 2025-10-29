import html
from typing import Dict, Any, Callable, Awaitable
from sqlalchemy.orm import Session
import httpx
from app.config import settings
from app.services.token_storage import refresh_oauth_token
from app.routers.oauth import oauth
from app.services.timer_utils import parse_interval_minutes

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
    lines = []
    for guild in guilds:
        name = guild.get("name") or "Unknown guild"
        if guild.get("owner"):
            name = f"{name} (owner)"
        lines.append(name)

    return {"text": "\n".join(lines)}


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
        raw_snippet = data.get("snippet")
        snippet = html.unescape(raw_snippet) if raw_snippet else ""
        results.append({
            "id": message_id,
            "threadId": data.get("threadId"),
            "subject": headers.get("Subject"),
            "date": headers.get("Date"),
            "from": headers.get("From"),
            "to": headers.get("To"),
            "snippet": snippet,
        })
    if not results:
        return {"text": "Aucun email trouvé."}
    lines = []
    for msg in results:
        subject = msg.get("subject") or "(Sans objet)"
        date = msg.get("date") or "Date inconnue"
        snippet = msg.get("snippet") or ""
        if snippet:
            lines.append(f"- {subject} ({date}) — {snippet}")
        else:
            lines.append(f"- {subject} ({date})")
    return {"data": "\n".join(lines)}


async def faceit_player_stats_action(db: Session, user_id: int, params: dict) -> dict[str, Any]:
    api_key = settings.FACEIT_API_KEY
    if not api_key:
        raise ValueError("FACEIT_API_KEY not configured")

    player_id = params.get("player_id") or params.get("playerId")
    game_id = params.get("game_id") or params.get("gameId")
    if not player_id:
        raise ValueError("Missing player_id")
    if not game_id:
        raise ValueError("Missing game_id")

    query_params: dict[str, Any] = {}

    def add_int_param(name: str, *, minimum: int | None = None, maximum: int | None = None):
        raw_value = params.get(name)
        if raw_value in (None, "", []):
            return
        try:
            int_value = int(raw_value)
        except (TypeError, ValueError):
            raise ValueError(f"Invalid value for {name}")
        if minimum is not None:
            int_value = max(minimum, int_value)
        if maximum is not None:
            int_value = min(maximum, int_value)
        query_params[name] = int_value

    add_int_param("limit", minimum=1, maximum=100)
    add_int_param("from")
    add_int_param("to")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://open.faceit.com/data/v4/players/{player_id}/games/{game_id}/stats",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Accept": "application/json",
            },
            params=query_params,
            timeout=10.0,
        )
    if response.status_code != 200:
        try:
            detail = response.json()
        except Exception:
            detail = response.text
        raise ValueError(f"Failed to fetch stats: {detail}")

    data = response.json()
    return {
        "player_id": player_id,
        "game_id": game_id,
        "query": query_params,
        "stats": data,
    }

async def faceit_get_player_id_action(db: Session, user_id: int, params: dict) -> dict[str, Any]:
    api_key = settings.FACEIT_API_KEY
    if not api_key:
        raise ValueError("FACEIT_API_KEY not configured")

    nickname = params.get("nickname") or params.get("player_nickname") or params.get("playerNickname")
    if not nickname or not str(nickname).strip():
        raise ValueError("Missing nickname")
    nickname = str(nickname).strip()

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            "https://open.faceit.com/data/v4/players",
            params={"nickname": nickname},
            headers={
                "Authorization": f"Bearer {api_key}",
                "Accept": "application/json",
            },
        )
    if response.status_code != 200:
        try:
            detail = response.json()
        except Exception:
            detail = response.text
        raise ValueError(f"Failed to fetch player: {detail}")

    data = response.json()
    player_id = data.get("player_id")
    if not player_id:
        raise ValueError(f"Player '{nickname}' not found")

    return {
        "player_id": player_id,
        "nickname": data.get("nickname") or nickname,
        "country": data.get("country"),
        "game_id": data.get("game_id") or data.get("games", {}).get("cs2", {}).get("game_id"),
    }


async def faceit_player_ranking_action(db: Session, user_id: int, params: dict) -> dict[str, Any]:
    api_key = settings.FACEIT_API_KEY
    if not api_key:
        raise ValueError("FACEIT_API_KEY not configured")

    player_id = params.get("player_id") or params.get("playerId")
    game_id = params.get("game_id") or params.get("gameId")
    region = params.get("region")
    if not player_id:
        raise ValueError("Missing player_id")
    if not game_id:
        raise ValueError("Missing game_id")
    if not region:
        raise ValueError("Missing region")

    query_params: dict[str, Any] = {}
    country = params.get("country")
    if country:
        query_params["country"] = country

    limit_raw = params.get("limit")
    if limit_raw not in (None, "", []):
        try:
            limit_value = int(limit_raw)
        except (TypeError, ValueError):
            raise ValueError("Invalid value for limit")
        limit_value = max(1, min(100, limit_value))
        query_params["limit"] = limit_value

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://open.faceit.com/data/v4/rankings/games/{game_id}/regions/{region}/players/{player_id}",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Accept": "application/json",
            },
            params=query_params,
            timeout=10.0,
        )
    if response.status_code != 200:
        try:
            detail = response.json()
        except Exception:
            detail = response.text
        raise ValueError(f"Failed to fetch ranking: {detail}")

    data = response.json()
    return {
        "player_id": player_id,
        "game_id": game_id,
        "region": region,
        "query": query_params,
        "ranking": data,
    }


async def timer_interval_action(db: Session, user_id: int, params: dict) -> dict[str, Any]:
    payload = params or {}
    interval_minutes = parse_interval_minutes(payload)
    if interval_minutes is None:
        raise ValueError(
            "Paramètre d'intervalle manquant. Fournissez par exemple 'interval_minutes', 'minutes' ou 'every' (en minutes)."
        )

    interval_minutes = max(1, interval_minutes)
    return {
        "status": "timer_configured",
        "interval_minutes": interval_minutes,
        "interval_seconds": interval_minutes * 60,
    }


ACTION_DISPATCH: Dict[tuple[str, str], Callable[[Session, int, dict], Awaitable[Any]]] = {
    ("discord", "list_guilds"): discord_list_guilds_action,
    ("google", "recent_emails_from_sender"): google_recent_emails_action,
    ("faceit", "get_player_id"): faceit_get_player_id_action,
    ("faceit", "retrieve_player_stats"): faceit_player_stats_action,
    ("faceit", "retrieve_player_ranking"): faceit_player_ranking_action,
    ("timer", "interval"): timer_interval_action,
}


async def execute_action(service: str, event: str, db: Session, user_id: int, params: dict) -> Any:
    handler = ACTION_DISPATCH.get((service, event))
    if not handler:
        raise NotImplementedError(f"No action for {service}:{event}")
    return await handler(db, user_id, params)
