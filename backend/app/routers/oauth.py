from typing import Dict, Any
from fastapi import APIRouter, Request, Depends, Query
from fastapi.responses import RedirectResponse, JSONResponse
from authlib.integrations.starlette_client import OAuth
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.models import UserService
from app.services.token_storage import save_token_to_db, get_token_from_db
from app.services.auth import get_current_user, hash_password, create_jwt_token, random_password
from jose import JWTError, jwt
from app.models.models import User

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
    name="faceit",
    client_id=settings.FACEIT_CLIENT_ID,
    client_secret=settings.FACEIT_CLIENT_SECRET,
    authorize_url="https://accounts.faceit.com/resources/oauth/authorize",
    access_token_url="https://api.faceit.com/auth/v1/oauth/token",
    api_base_url="https://open.faceit.com/data/v4/",
    client_kwargs={
        "scope": "email profile membership",
        "code_challenge_method": "S256",
    },
)

oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    api_base_url="https://www.googleapis.com/",
    client_kwargs={
        "scope": (
            "openid email profile "
            "https://www.googleapis.com/auth/gmail.readonly "
            "https://www.googleapis.com/auth/gmail.send "
            "https://www.googleapis.com/auth/calendar.events"
        ),
        "access_type": "offline",
        "prompt": "consent",
    },
)

oauth.register(
    name="twitch",
    client_id=settings.TWITCH_CLIENT_ID,
    client_secret=settings.TWITCH_CLIENT_SECRET,
    access_token_url="https://id.twitch.tv/oauth2/token",
    authorize_url="https://id.twitch.tv/oauth2/authorize",
    api_base_url="https://api.twitch.tv/helix/",
    client_kwargs={
        "scope": "user:read:email channel:read:subscriptions moderator:read:followers user:read:follows",
        "token_endpoint_auth_method": "client_secret_post"
    }
)

@oauth_router.get("/{provider}/login")
async def oauth_login(
    provider: str,
    request: Request,
    token: str = Query(None),
    redirect_uri_param: str | None = Query(None, alias="redirect_uri"),
    db: Session = Depends(get_db)
):
    if provider not in oauth._clients:
        return JSONResponse({"error": "Provider inconnu"}, status_code=400)

    context = "auth"
    user = None
    if token:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            email: str = payload.get("sub")
            if not email:
                return JSONResponse({"error": "Token invalide"}, status_code=401)
            user = db.query(User).filter(User.email == email).first()
            if not user:
                return JSONResponse({"error": "Utilisateur introuvable"}, status_code=404)
            request.session['oauth_user_id'] = user.id
            context = "link"
        except JWTError:
            return JSONResponse({"error": "Token invalide"}, status_code=401)
    redirect_front = ""
    if context == "link":
        redirect_front = "http://localhost:8081/Services"
    else:
        redirect_front = "http://localhost:8081/dashboard"

    request.session['oauth_context'] = context
    request.session['oauth_redirect_uri'] = redirect_uri_param or redirect_front
    redirect_uri = f"https://trigger.ink/oauth/{provider}/callback"
    return await oauth.create_client(provider).authorize_redirect(request, redirect_uri, redirect_popup="true")

@oauth_router.get("/{provider}/callback")
async def oauth_callback(provider: str, request: Request, db: Session = Depends(get_db)):
    if provider not in oauth._clients:
        return JSONResponse({"error": "Provider inconnu"}, status_code=400)

    try:
        client = oauth.create_client(provider)
        token = await client.authorize_access_token(request)

        context = request.session.get('oauth_context', 'auth')
        stored_redirect = request.session.pop('oauth_redirect_uri', None)
        print(f"OAuth context: {context}, stored redirect: {stored_redirect}")

        if context == "link":
            user_id = request.session.get('oauth_user_id')
            if not user_id:
                return JSONResponse({"error": "Utilisateur introuvable pour le lien"}, status_code=400)

            save_token_to_db(db, user_id, provider, token)

            request.session.pop('oauth_context', None)
            request.session.pop('oauth_user_id', None)

            final_redirect = stored_redirect or "http://localhost:8081/Services"
            return RedirectResponse(final_redirect)


        user_info = token.get('userinfo')
        if not user_info:
            user_info = await client.userinfo(token=token)

        email = user_info.get('email')
        name = user_info.get('name') or user_info.get('username') or "Utilisateur"

        if not email:
            return JSONResponse({"error": "Impossible de récupérer l'email depuis le provider"}, status_code=400)

        user = db.query(User).filter(User.email == email).first()

        if not user:
            user = User(
                username=name,
                email=email,
                password_hash=hash_password(random_password()),
                role="user",
                is_verified=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        save_token_to_db(db, user.id, provider, token)

        access_token = create_jwt_token({"sub": user.email})

        request.session.pop('oauth_context', None)
        request.session.pop('oauth_user_id', None)
        final_redirect = stored_redirect or "http://localhost:8081/dashboard"
        print(f"Final redirect: {final_redirect}")
        redirect_url = f"{final_redirect}?token={access_token}"
        return RedirectResponse(redirect_url)

    except Exception as e:
        print(f"Erreur OAuth callback: {e}")
        return JSONResponse({
            "success": False,
            "error": "oauth_failed",
            "details": str(e)
        }, status_code=500)

@oauth_router.get("/{provider}/status")
async def oauth_status(provider: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if provider == "timer":
        return JSONResponse({"logged_in": True})
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

SERVICES_INFO = {
    "spotify": {
        "name": "Spotify",
        "logo_url": "https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png"
    },
    "twitter": {
        "name": "Twitter",
        "logo_url": "https://abs.twimg.com/icons/apple-touch-icon-192x192.png"
    },
    "discord": {
        "name": "Discord",
        "logo_url": "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png"
    },
    "faceit": {
        "name": "Faceit",
        "logo_url": "https://cdn.faceit.com/static/layout/images/faceit-logo.svg"
    },
    "google": {
        "name": "Google",
        "logo_url": "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
    },
    "twitch": {
        "name": "Twitch",
        "logo_url": "https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png"
    },
    "timer": {
        "name": "Timer",
        "logo_url": "https://cdn-icons-png.flaticon.com/512/2088/2088617.png"
    }
}

@oauth_router.get("/services")
async def get_services(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    services = []
    for provider, info in SERVICES_INFO.items():
        if provider == "timer":
            connected = True
        else:
            token = get_token_from_db(db, current_user.id, provider)
            connected = bool(token)
        services.append({
            "provider": provider,
            "name": info["name"],
            "logo_url": info["logo_url"],
            "connected": connected
        })
    return JSONResponse({"services": services})
