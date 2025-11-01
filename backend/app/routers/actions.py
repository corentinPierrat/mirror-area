from fastapi import APIRouter, Request, Header, Depends, Response
from fastapi.responses import JSONResponse
from app.services.workflows import trigger_workflows
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
import hmac
import hashlib
import json
from app.services.twitch import parse_twitch_event

actions_router = APIRouter(prefix="/actions", tags=["actions"])

@actions_router.post("/discord")
async def discord_action(request: Request, db: Session = Depends(get_db), bot_token: str = Header(None)):
    if bot_token != settings.BOT_SECRET:
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
    print(twitch_eventsub_message_type)
    body = await request.body()
    print(f"Body: {body.decode('utf-8')}")
    if twitch_eventsub_message_signature:
        message = twitch_eventsub_message_id + twitch_eventsub_message_timestamp + body.decode('utf-8')
        expected_signature = 'sha256=' + hmac.new(
            settings.TWITCH_WEBHOOK_SECRET.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, twitch_eventsub_message_signature):
            return JSONResponse(status_code=403, content={"detail": "Invalid signature"})
    print("Signature verified")
    data = json.loads(body)
    print(f"Parsed data: {data}")
    if twitch_eventsub_message_type == "webhook_callback_verification":
        return Response(content=data["challenge"], media_type="text/plain")

    if twitch_eventsub_message_type == "notification":
        event_type = data.get("subscription", {}).get("type")
        event_data = data.get("event", {})

        payload = parse_twitch_event(event_type, event_data)
        print(f"Parsed payload: {payload}")
        if payload:
            results = await trigger_workflows("twitch", payload["event"], payload, db)
            print(f"Workflow results: {results}")
            return JSONResponse({"status": "processed", "results": results})

    return JSONResponse({"status": "ok"})
