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
    sender = params.get("sender")
    if not sender or not str(sender).strip():
        raise ValueError("Missing sender email (expected param 'sender')")
    sender = str(sender).strip()

    limit_raw = params.get("limit")
    if limit_raw in (None, "", "None"):
        limit_raw = 20
    try:
        limit = max(1, min(20, int(limit_raw)))
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

    player_id = params.get("player_id")
    game_id = params.get("game_id")
    if not player_id or not str(player_id).strip():
        raise ValueError("Missing player_id")
    if not game_id or not str(game_id).strip():
        raise ValueError("Missing game_id")
    player_id = str(player_id).strip()
    game_id = str(game_id).strip()

    query_params: dict[str, Any] = {"limit": 1}

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
    matches = data.get("items") if isinstance(data, dict) else None
    last_match = None
    if isinstance(matches, list) and matches:
        last_match = matches[0]
    elif isinstance(data, dict):
        last_match = data.get("last_match") or data
    else:
        last_match = data

    stats_map: dict[str, Any] = {}
    if isinstance(last_match, dict):
        raw_stats = last_match.get("stats")
        if isinstance(raw_stats, dict):
            stats_map = {str(k): str(v) if v is not None else "" for k, v in raw_stats.items()}
        else:
            stats_map = {str(k): str(v) if v is not None else "" for k, v in last_match.items() if not isinstance(v, (dict, list))}

    allowed_keys = {
        "Deaths",
        "Headshots %",
        "Triple Kills",
        "Assists",
        "Game",
        "Penta Kills",
        "MVPs",
        "Final Score",
        "Quadro Kills",
        "Result",
        "Double Kills",
        "Rounds",
        "Nickname",
        "Score",
        "K/D Ratio",
        "Kills",
    }

    filtered_stats: dict[str, str] = {}
    for key in allowed_keys:
        value = stats_map.get(key)
        if value in (None, "", "None"):
            if isinstance(last_match, dict):
                alt_value = last_match.get(key)
                if alt_value not in (None, "", "None"):
                    value = str(alt_value)
        if value not in (None, "", "None"):
            filtered_stats[key] = str(value)

    formatted_stats: dict[str, str] = {}
    for key, value in filtered_stats.items():
        if value in (None, "", "None"):
            continue
        formatted_stats[key] = f"{key}: {value}"

    summary_text_parts: list[str] = []
    for value in formatted_stats.values():
        summary_text_parts.append(value)
    summary_text = "\n".join(summary_text_parts) if summary_text_parts else None

    payload: dict[str, Any] = {
        "player_id": player_id,
        "game_id": game_id,
    }
    payload.update(formatted_stats)
    if summary_text:
        payload["summary"] = summary_text

    return payload

async def faceit_get_player_id_action(db: Session, user_id: int, params: dict) -> dict[str, Any]:
    api_key = settings.FACEIT_API_KEY
    if not api_key:
        raise ValueError("FACEIT_API_KEY not configured")

    nickname = params.get("nickname")
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

    resolved_nickname = data.get("nickname") or nickname
    resolved_country = data.get("country") or "Unknown"
    summary_line = f"{player_id}: {resolved_nickname} ({resolved_country})"

    return {
        "player_id": player_id,
        "nickname": resolved_nickname,
        "country": resolved_country,
        "game_id": data.get("game_id") or data.get("games", {}).get("cs2", {}).get("game_id"),
        "text": summary_line,
    }


async def faceit_player_ranking_action(db: Session, user_id: int, params: dict) -> dict[str, Any]:
    api_key = settings.FACEIT_API_KEY
    if not api_key:
        raise ValueError("FACEIT_API_KEY not configured")

    nickname = params.get("nickname")
    if not nickname or not str(nickname).strip():
        raise ValueError("Missing nickname")
    nickname = str(nickname).strip()

    raw_game_id = params.get("game_id")
    if raw_game_id in (None, "", "None"):
        game_id = "cs2"
    else:
        game_id = str(raw_game_id).strip() or "cs2"

    def _normalize_country(value: Any) -> str | None:
        if value in (None, "", "None"):
            return None
        return str(value).strip().upper()

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        player_response = await client.get(
            "https://open.faceit.com/data/v4/players",
            params={"nickname": nickname},
            headers=headers,
        )
        if player_response.status_code != 200:
            try:
                detail = player_response.json()
            except Exception:
                detail = player_response.text
            raise ValueError(f"Failed to fetch player by nickname: {detail}")

        player_data = player_response.json()
        if not isinstance(player_data, dict):
            raise ValueError("Unexpected player payload from FACEIT")

        player_id = player_data.get("player_id")
        if not player_id:
            raise ValueError(f"Player '{nickname}' not found on FACEIT")

        resolved_nickname = player_data.get("nickname") or nickname

        games_info = player_data.get("games") or {}
        game_entry = None
        for candidate in {game_id, game_id.lower(), game_id.upper()}:
            if isinstance(games_info, dict) and candidate in games_info:
                game_entry = games_info[candidate]
                game_id = candidate
                break
        if not isinstance(game_entry, dict):
            game_entry = {}

        region = game_entry.get("region") or player_data.get("region")
        if not region:
            raise ValueError("Impossible de déterminer la région du joueur pour ce jeu")
        region = str(region).strip()

        country_code = _normalize_country(player_data.get("country"))

        ranking_response = await client.get(
            f"https://open.faceit.com/data/v4/rankings/games/{game_id}/regions/{region}/players/{player_id}",
            headers=headers,
            timeout=10.0,
        )
        if ranking_response.status_code != 200:
            try:
                detail = ranking_response.json()
            except Exception:
                detail = ranking_response.text
            raise ValueError(f"Failed to fetch ranking: {detail}")

        ranking_data = ranking_response.json()

    if not isinstance(ranking_data, dict):
        raise ValueError("Unexpected FACEIT ranking payload")

    def pick_value(source: Any, *keys: str) -> Any:
        if not isinstance(source, dict):
            return None
        for key in keys:
            if key in source:
                value = source[key]
                if value not in (None, "", "None"):
                    return value
        return None

    items = ranking_data.get("items")
    matching_item = None
    if isinstance(items, list):
        for item in items:
            if not isinstance(item, dict):
                continue
            candidate_id = pick_value(item, "player_id", "playerId", "id")
            if candidate_id and str(candidate_id).lower() == str(player_id).lower():
                matching_item = item
                break
        if matching_item is None and items:
            first_item = items[0]
            matching_item = first_item if isinstance(first_item, dict) else None

    position = pick_value(ranking_data, "position", "ranking", "rank", "placement")
    if position is None and matching_item:
        position = pick_value(matching_item, "position", "ranking", "rank", "placement")
    if position in (None, "", "None"):
        raise ValueError("Impossible de déterminer la position du joueur dans le classement")

    position_str = str(position).strip()
    if not position_str:
        raise ValueError("Position du joueur vide dans la réponse FACEIT")
    try:
        position_clean = str(int(position_str))
    except (TypeError, ValueError):
        position_clean = position_str

    if matching_item and not country_code:
        country_code = _normalize_country(
            pick_value(matching_item, "country", "country_code", "player_country")
        )
    if not country_code:
        country_code = _normalize_country(
            pick_value(ranking_data, "country", "country_code")
        )

    suffix = f" ({country_code})" if country_code else ""
    summary = f"Le joueur {resolved_nickname} est {position_clean} sur {game_id}{suffix}"

    return {"summary": summary}


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
