import httpx
from typing import Dict, Any, List
from fastapi import APIRouter, Request, Body
from fastapi.responses import JSONResponse
from app.routers.oauth import oauth, get_token
from pydantic import BaseModel, EmailStr

reactions_router = APIRouter(prefix="/reactions", tags=["reactions"])

@reactions_router.get("/spotify/play_weather_playlist")
async def play_weather_playlist(request: Request):
    token = get_token(request.session, "spotify")
    if not token:
        return JSONResponse({"error": "Not logged in to Spotify"}, status_code=401)
    url = "https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current_weather=true"
    async with httpx.AsyncClient() as client:
        weather_resp = await client.get(url, timeout=10)
        weather = weather_resp.json()["current_weather"]
    temp = weather["temperature"]
    code = weather["weathercode"]
    if code in [51, 53, 55, 61, 63, 65, 80, 81, 82]:
        playlist_uri = "spotify:playlist:37i9dQZF1DXbvABJXBIyiY"
    elif code in [71, 73, 75]:
        playlist_uri = "spotify:playlist:37i9dQZF1DX0Yxoavh5qJV"
    elif code in [95, 96, 99]:
        playlist_uri = "spotify:playlist:37i9dQZF1DWXKbJeFbii64"
    elif temp < 15:
        playlist_uri = "spotify:playlist:2gjpC6VR6qUFjKHr4RWGML"
    else:
        playlist_uri = "spotify:playlist:37i9dQZF1DX1gRalH1mWrP"
    resp = await oauth.spotify.put(
        "me/player/play",
        token=token,
        json={"context_uri": playlist_uri}
    )
    if resp.status_code == 204:
        return JSONResponse({"status": "Playlist lancée", "weather": weather})
    else:
        return JSONResponse({"error": resp.json()}, status_code=resp.status_code)

@reactions_router.post("/twitter/tweet")
async def twitter_tweet(request: Request, payload: Dict[str, Any] = Body(..., example={"text": "Hello"})):
    token = get_token(request.session, "twitter")
    if not token:
        return JSONResponse({"error": "Not logged in to Twitter"}, status_code=401)
    text = (payload or {}).get("text")
    if not text or not text.strip():
        return JSONResponse({"error": "Missing text"}, status_code=400)
    resp = await oauth.twitter.post("tweets", token=token, json={"text": text})
    if resp.status_code in (200, 201):
        return JSONResponse(resp.json(), status_code=resp.status_code)
    else:
        return JSONResponse({"error": resp.json()}, status_code=resp.status_code)

class MailPayload(BaseModel):
    to: List[EmailStr]
    subject: str
    content: str
    content_type: str = "HTML"

@reactions_router.post("/microsoft/send_mail")
async def send_mail(request: Request, payload: MailPayload = Body(...)):
    token = get_token(request.session, "microsoft")
    if not token:
        return JSONResponse({"error": "Not logged in to Microsoft"}, status_code=401)
    client = oauth.create_client("microsoft")
    message = {
        "message": {
            "subject": payload.subject,
            "body": {
                "contentType": payload.content_type,
                "content": payload.content
            },
            "toRecipients": [
                {"emailAddress": {"address": addr}} for addr in payload.to
            ]
        },
        "saveToSentItems": True
    }
    resp = await client.post("me/sendMail", json=message, token=token)
    if resp.status_code in (202, 200):
        return JSONResponse({"status": "Mail envoyé"})
    return JSONResponse({"error": resp.text}, status_code=resp.status_code)
