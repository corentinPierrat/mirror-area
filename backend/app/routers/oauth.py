from typing import Dict, Any
from fastapi import APIRouter, Request, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from authlib.integrations.starlette_client import OAuth
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.models import UserService
from app.services.token_storage import save_token_to_db, get_token_from_db
from app.services.auth import get_current_user

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
)

oauth.register(
    name="faceit",
    client_id=settings.FACEIT_CLIENT_ID,
    client_secret=settings.FACEIT_CLIENT_SECRET,
    authorize_url="https://accounts.faceit.com/resources/oauth/authorize",
    access_token_url="https://api.faceit.com/auth/v1/oauth/token",
    api_base_url="https://open.faceit.com/data/v4/",
    client_kwargs={
        "scope": "openid email profile membership",
        "code_challenge_method": "S256",
    },
)

@oauth_router.get("/{provider}/login")
async def oauth_login(provider: str, request: Request, current_user = Depends(get_current_user)):
    if provider not in oauth._clients:
        return JSONResponse({"error": "Provider inconnu"}, status_code=400)
    request.session['oauth_user_id'] = current_user.id
    if provider == "microsoft":
        redirect_uri = f"http://localhost:8080/oauth/{provider}/callback"
    elif provider == "faceit":
        redirect_uri = f"https://b107b2467506.ngrok-free.app/oauth/{provider}/callback"
    else:
        redirect_uri = f"http://127.0.0.1:8080/oauth/{provider}/callback"
    return await oauth.create_client(provider).authorize_redirect(request, redirect_uri)

@oauth_router.get("/{provider}/callback")
async def oauth_callback(provider: str, request: Request, db: Session = Depends(get_db)):
    if provider not in oauth._clients:
        return JSONResponse({"error": "Provider inconnu"}, status_code=400)
    try:
        client = oauth.create_client(provider)
        token = await client.authorize_access_token(request, grant_type="authorization_code")
        user_id = request.session.get('oauth_user_id')
        if user_id:
            save_token_to_db(db, user_id, provider, token)
        return RedirectResponse("http://127.0.0.1:5173")
    except Exception as e:
        print(f"Erreur OAuth callback: {e}")
        return JSONResponse({
            "success": False,
            "error": "oauth_failed",
            "details": str(e)
        }, status_code=500)

@oauth_router.get("/{provider}/status")
async def oauth_status(provider: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    token = get_token_from_db(db, current_user.id, provider)
    if not token:
        return JSONResponse({"logged_in": False})
    return JSONResponse({"logged_in": True, "has_token": True})

@oauth_router.delete("/{provider}/disconnect")
async def oauth_disconnect(provider: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = db.query(UserService).filter(
        UserService.user_id == current_user.id,
        UserService.service_key == provider
    ).first()
    if service:
        db.delete(service)
        db.commit()
        return {"msg": f"Service {provider} déconnecté avec succès"}
    return JSONResponse({"error": "Service non trouvé"}, status_code=404)

@oauth_router.get("/{provider}/token")
async def get_oauth_token(provider: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    token = get_token_from_db(db, current_user.id, provider)
    if not token:
        return JSONResponse({"error": "Token non trouvé"}, status_code=404)
    return JSONResponse({"token": token})