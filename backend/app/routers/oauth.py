from typing import Dict, Any
import httpx
from fastapi import APIRouter, Request, Body, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from authlib.integrations.starlette_client import OAuth
import os
from app.config import settings

oauth_router = APIRouter(prefix="/oauth", tags=["oauth"])

oauth = OAuth()

oauth.register(
    name="spotify",
    client_id=settings.SPOTIFY_CLIENT_ID,
    client_secret=settings.SPOTIFY_CLIENT_SECRET,
    access_token_url="https://accounts.spotify.com/api/token",
    authorize_url="https://accounts.spotify.com/authorize",
    api_base_url="https://api.spotify.com/v1/",
    client_kwargs={
        "scope": 'user-read-private user-read-email user-modify-playback-state user-read-playback-state',
    },
)

oauth.register(
    name="twitter",
    client_id=settings.TWITTER_CLIENT_ID,
    client_secret=settings.TWITTER_CLIENT_SECRET,
    access_token_url="https://api.twitter.com/2/oauth2/token",
    access_token_params=None,
    authorize_url="https://twitter.com/i/oauth2/authorize",
    api_base_url="https://api.twitter.com/2/",
    client_kwargs={
        "scope": "tweet.read users.read offline.access tweet.write",
        "code_challenge_method": "S256",
    },
)

oauth.register(
    name="discord",
    client_id=settings.DISCORD_CLIENT_ID,
    client_secret=settings.DISCORD_CLIENT_SECRET,
    access_token_url="https://discord.com/api/oauth2/token",
    authorize_url="https://discord.com/api/oauth2/authorize",
    api_base_url="https://discord.com/api/",
    client_kwargs={
        "scope": "identify email guilds",
    },
)

def update_ms_token(name, token, request):
    save_token(request.session, name, token)

oauth.register(
    name="microsoft",
    client_id=settings.MS_CLIENT_ID,
    client_secret=settings.MS_CLIENT_SECRET,
    authorize_url="https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    access_token_url="https://login.microsoftonline.com/common/oauth2/v2.0/token",
    api_base_url="https://graph.microsoft.com/v1.0/",
    client_kwargs={
        "scope": "openid profile email offline_access User.Read Mail.Read Mail.Send",
        "code_challenge_method": "S256",
    },
    update_token=update_ms_token,
)

def get_token_store(session) -> Dict[str, Any]:
    if "oauth_tokens" not in session:
        session["oauth_tokens"] = {}
    return session["oauth_tokens"]

def save_token(session, provider: str, token: Dict[str, Any]) -> None:
    tokens = get_token_store(session)
    tokens[provider] = token
    session["oauth_tokens"] = tokens

def get_token(session, provider: str) -> Dict[str, Any] | None:
    return get_token_store(session).get(provider)

@oauth_router.get("/{provider}/login")
async def oauth_login(provider: str, request: Request):
    if provider not in oauth._clients:
        return JSONResponse({"error": "Provider inconnu"}, status_code=400)
    if provider == "microsoft":
        redirect_uri = f"http://localhost:8080/oauth/{provider}/callback"
    else:
        redirect_uri = f"http://127.0.0.1:8080/oauth/{provider}/callback"
    return await oauth.create_client(provider).authorize_redirect(request, redirect_uri)

@oauth_router.get("/{provider}/callback")
async def oauth_callback(provider: str, request: Request):
    if provider not in oauth._clients:
        return JSONResponse({"error": "Provider inconnu"}, status_code=400)
    client = oauth.create_client(provider)
    token = await client.authorize_access_token(request, grant_type="authorization_code")
    save_token(request.session, provider, token)
    return RedirectResponse("http://127.0.0.1:5173")
