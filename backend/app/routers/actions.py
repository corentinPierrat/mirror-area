from fastapi import APIRouter, Request, Header, Depends, Response, HTTPException
from fastapi.responses import JSONResponse
from app.services.workflows import trigger_workflows
from app.services.token_storage import get_token_from_db
from app.services.auth import get_current_user
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.models import User
import hmac
import hashlib
import json
import httpx
from app.services.twitch import parse_twitch_event

actions_router = APIRouter(prefix="/actions", tags=["actions"])

@actions_router.post("/discord")
async def discord_action(request: Request, db: Session = Depends(get_db), bot_token: str = Header(None)):
    if bot_token != settings.TOKEN_BOT:
        return JSONResponse(status_code=403, content={"detail": "Forbidden"})

    data = await request.json()
    event_type = data.get("event")

    results = await trigger_workflows("discord", event_type, data, db)
    return JSONResponse(status_code=200, content={"detail": "Workflows triggered", "results": results})

@actions_router.post("/twitch")
async def twitch_webhook(
    request: Request,
    db: Session = Depends(get_db),
    twitch_eventsub_message_type: str = Header(None, alias="Twitch-Eventsub-Message-Type"),
    twitch_eventsub_message_signature: str = Header(None, alias="Twitch-Eventsub-Message-Signature"),
    twitch_eventsub_message_id: str = Header(None, alias="Twitch-Eventsub-Message-Id"),
    twitch_eventsub_message_timestamp: str = Header(None, alias="Twitch-Eventsub-Message-Timestamp")
):
    body = await request.body()

    if twitch_eventsub_message_signature:
        message = twitch_eventsub_message_id + twitch_eventsub_message_timestamp + body.decode('utf-8')
        expected_signature = 'sha256=' + hmac.new(
            settings.TWITCH_WEBHOOK_SECRET.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, twitch_eventsub_message_signature):
            return JSONResponse(status_code=403, content={"detail": "Invalid signature"})

    data = json.loads(body)

    if twitch_eventsub_message_type == "webhook_callback_verification":
        return Response(content=data["challenge"], media_type="text/plain")

    if twitch_eventsub_message_type == "notification":
        event_type = data.get("subscription", {}).get("type")
        event_data = data.get("event", {})

        payload = parse_twitch_event(event_type, event_data)

        if payload:
            results = await trigger_workflows("twitch", payload["eventx"], payload, db)
            return JSONResponse({"status": "processed", "results": results})

    return JSONResponse({"status": "ok"})

async def execute_faceit_action(db: Session, user_id: int, params: dict):
    game = params.get("game", "cs2")
    token_data = get_token_from_db(db, user_id, "faceit")
    if not token_data:
        raise ValueError("FACEIT account not connected")
    access_token = token_data.get("access_token")
    if not access_token:
        raise ValueError("Invalid FACEIT token")
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {access_token}"}
        print(f"[FACEIT] Fetching profile for connected user")
        profile_response = await client.get(
            "https://open.faceit.com/data/v4/players/me",
            headers=headers
        )
        print(f"[FACEIT] Profile response status: {profile_response.status_code}")
        if profile_response.status_code != 200:
            error_detail = profile_response.text
            print(f"[FACEIT] Error response: {error_detail}")
            raise ValueError(f"Failed to fetch FACEIT profile: {error_detail}")
        profile_data = profile_response.json()
        print(f"[FACEIT] Profile data received: {profile_data.get('nickname')}")
        player_id = profile_data.get("player_id")
        nickname = profile_data.get("nickname")
        if not player_id:
            raise ValueError("No player_id found in FACEIT response")
        print(f"[FACEIT] Fetching stats for player_id: {player_id}, game: {game}")
        stats_response = await client.get(
            f"https://open.faceit.com/data/v4/players/{player_id}/stats/{game}",
            headers=headers
        )
        print(f"[FACEIT] Stats response status: {stats_response.status_code}")
        game_details = profile_data.get("games", {}).get(game, {})
        if stats_response.status_code != 200:
            print(f"[FACEIT] No stats found for game {game}")
            payload = {
                "event": "stats",
                "player_id": player_id,
                "nickname": nickname,
                "game": game,
                "error": "No stats found for this game"
            }
        else:
            stats_data = stats_response.json()
            print(f"[FACEIT] Stats retrieved successfully")
            payload = {
                "event": "stats",
                "player_id": player_id,
                "nickname": nickname,
                "avatar": profile_data.get("avatar"),
                "country": profile_data.get("country"),
                "game": game,
                "skill_level": game_details.get("skill_level"),
                "faceit_elo": game_details.get("faceit_elo"),
                "region": game_details.get("region"),
                "lifetime_stats": stats_data.get("lifetime", {}),
            }
        print(f"[FACEIT] Payload created successfully: {payload.get('nickname')} - Skill Level: {payload.get('skill_level')} - ELO: {payload.get('faceit_elo')}")
        return payload