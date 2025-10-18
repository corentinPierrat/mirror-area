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

@actions_router.post("/faceit")
async def faceit_action(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Action Faceit pour récupérer les statistiques du joueur.
    """
    data = await request.json()
    event_type = data.get("event")
    game = data.get("game", "csgo")
    token_data = get_token_from_db(db, current_user.id, "faceit")
    if not token_data:
        return JSONResponse(
            status_code=401,
            content={"detail": "Faceit account not connected"}
        )

    access_token = token_data.get("access_token")
    if not access_token:
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid Faceit token"}
        )

    try:
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {access_token}"}

            profile_response = await client.get(
                "https://open.faceit.com/data/v4/players/me",
                headers=headers
            )

            if profile_response.status_code != 200:
                return JSONResponse(
                    status_code=profile_response.status_code,
                    content={"detail": "Failed to fetch Faceit profile"}
                )

            profile_data = profile_response.json()
            player_id = profile_data.get("player_id")
            nickname = profile_data.get("nickname")

            stats_response = await client.get(
                f"https://open.faceit.com/data/v4/players/{player_id}/stats/{game}",
                headers=headers
            )

            if stats_response.status_code != 200:
                payload = {
                    "event": event_type,
                    "player_id": player_id,
                    "nickname": nickname,
                    "game": game,
                    "error": "No stats found"
                }
            else:
                stats_data = stats_response.json()
                game_details = profile_data.get("games", {}).get(game, {})

                payload = {
                    "event": event_type,
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
            results = await trigger_workflows("faceit", event_type, payload, db)
            return JSONResponse(
                status_code=200,
                content={"detail": "Workflows triggered", "results": results, "data": payload}
            )

    except httpx.HTTPError as e:
        return JSONResponse(
            status_code=500,
            content={"detail": f"Error with Faceit API: {str(e)}"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": f"Unexpected error: {str(e)}"}
        )