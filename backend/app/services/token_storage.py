import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.models import UserService

def save_token_to_db(db: Session, user_id: int, provider: str, token: Dict[str, Any]) -> None:
    token_json = json.dumps(token)
    expires_at = None
    if 'expires_at' in token:
        expires_at = datetime.fromtimestamp(token['expires_at'], tz=timezone.utc)
    elif 'expires_in' in token:
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=token['expires_in'])
    service = db.query(UserService).filter(
        UserService.user_id == user_id,
        UserService.service_key == provider
    ).first()
    if service:
        service.token_data = token_json.encode()
        service.token_iv = b''
        service.token_tag = b''
        service.token_expires_at = expires_at
        service.updated_at = datetime.now(timezone.utc)
    else:
        service = UserService(
            user_id=user_id,
            service_key=provider,
            token_data=token_json.encode(),
            token_iv=b'',
            token_tag=b'',
            token_expires_at=expires_at
        )
        db.add(service)
    db.commit()

def get_token_from_db(db: Session, user_id: int, provider: str) -> Dict[str, Any] | None:
    service = db.query(UserService).filter(
        UserService.user_id == user_id,
        UserService.service_key == provider
    ).first()
    if not service:
        return None
    token_json = service.token_data.decode()
    return json.loads(token_json)

def get_access_token(token_dict: dict) -> str:
    return token_dict.get("access_token")

def get_refresh_token(token_dict: dict) -> str | None:
    return token_dict.get("refresh_token")

def is_token_expired(token_dict: dict) -> bool:
    expires_at = token_dict.get("expires_at")
    if not expires_at:
        return False
    return datetime.now(timezone.utc).timestamp() > expires_at

def get_token_scopes(token_dict: dict) -> list[str]:
    scope = token_dict.get("scope", "")
    return scope.split() if scope else []

async def refresh_oauth_token(db: Session, user_id: int, provider: str) -> Dict[str, Any] | None:
    from app.routers.oauth import oauth
    token = get_token_from_db(db, user_id, provider)
    if not token:
        return None
    if not is_token_expired(token):
        return token
    refresh_token = token.get("refresh_token")
    if not refresh_token:
        return None
    try:
        client = oauth.create_client(provider)
        new_token = await client.fetch_access_token(
            grant_type='refresh_token',
            refresh_token=refresh_token
        )
        save_token_to_db(db, user_id, provider, new_token)
        return new_token
    except Exception as e:
        print(f"Erreur refresh token: {e}")
        return None