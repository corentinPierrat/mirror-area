import httpx
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key="!secret!")

origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth = OAuth()
oauth.register(
    name="spotify",
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
    access_token_url="https://accounts.spotify.com/api/token",
    authorize_url="https://accounts.spotify.com/authorize",
    api_base_url="https://api.spotify.com/v1/",
    client_kwargs={
        "scope": 'user-read-private user-read-email user-modify-playback-state user-read-playback-state',
    },
)


@app.get("/login")
async def login(request: Request):
    redirect_uri = "http://127.0.0.1:8000/callback"
    return await oauth.spotify.authorize_redirect(request, redirect_uri)

@app.get("/callback")
async def callback(request: Request):
    token = await oauth.spotify.authorize_access_token(request)
    request.session["token"] = token
    return RedirectResponse("http://127.0.0.1:5173")

@app.get("/me")
async def me(request: Request):
    token = request.session.get("token")
    if not token:
        return JSONResponse({"error": "Not logged in"}, status_code=401)
    user = await oauth.spotify.get("me", token=token)
    return JSONResponse(user.json())

@app.get("/devices")
async def get_devices(request: Request):
    token = request.session.get("token")
    if not token:
        return JSONResponse({"error": "Not logged in"}, status_code=401)
    resp = await oauth.spotify.get("me/player/devices", token=token)
    return JSONResponse(resp.json())

@app.get("/get_weather")
async def get_weather():
    url = "https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current_weather=true"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()
    return JSONResponse(data["current_weather"])

@app.get("/play_weather_playlist")
async def play_weather_playlist(request: Request):
    token = request.session.get("token")
    if not token:
        return JSONResponse({"error": "Not logged in"}, status_code=401)

    url = "https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current_weather=true"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        weather = response.json()["current_weather"]

    temp = weather["temperature"]
    code = weather["weathercode"]

    if code in [51, 53, 55, 61, 63, 65, 80, 81, 82]:
        playlist_uri = "spotify:playlist:37i9dQZF1DXbvABJXBIyiY"
        mood = "Pluie"
    elif code in [71, 73, 75]:
        playlist_uri = "spotify:playlist:37i9dQZF1DX0Yxoavh5qJV"
        mood = "Neige"
    elif code in [95, 96, 99]:
        playlist_uri = "spotify:playlist:37i9dQZF1DWXKbJeFbii64"
        mood = "Orage"
    elif temp < 15:
        playlist_uri = "spotify:playlist:2gjpC6VR6qUFjKHr4RWGML"
        mood = "Froid"
    else:
        playlist_uri = "spotify:playlist:37i9dQZF1DX1gRalH1mWrP"
        mood = "Soleil"

    resp = await oauth.spotify.put(
        "me/player/play",
        token=token,
        json={"context_uri": playlist_uri},
    )

    if resp.status_code == 204:
        return JSONResponse({"status": f"Playlist lancée ({mood})"})
    else:
        return JSONResponse({"error": resp.json()}, status_code=resp.status_code)
