import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.models import UserService

def save_token_to_db(db: Session, user_id: int, provider: str, token: Dict[str, Any]) -> None:
    token_payload = dict(token or {})
    expires_at_dt = None
    if 'expires_at' in token_payload:
        expires_at_dt = datetime.fromtimestamp(token_payload['expires_at'], tz=timezone.utc)
    elif 'expires_in' in token_payload:
        expires_at_dt = datetime.now(timezone.utc) + timedelta(seconds=token_payload['expires_in'])
        token_payload['expires_at'] = int(expires_at_dt.timestamp())
    service = db.query(UserService).filter(
        UserService.user_id == user_id,
        UserService.service_key == provider
    ).first()

    existing_token: Dict[str, Any] | None = None
    if service and service.token_data:
        try:
            existing_token = json.loads(service.token_data.decode())
        except Exception:
            existing_token = None

    if not token_payload.get("refresh_token") and existing_token:
        refresh_token = existing_token.get("refresh_token")
        if refresh_token:
            token_payload["refresh_token"] = refresh_token

    if expires_at_dt is None and service and service.token_expires_at:
        expires_at_dt = service.token_expires_at
        if not token_payload.get("expires_at") and expires_at_dt:
            token_payload["expires_at"] = int(expires_at_dt.timestamp())

    token_json = json.dumps(token_payload)

    if service:
        service.token_data = token_json.encode()
        service.token_iv = b''
        service.token_tag = b''
        service.token_expires_at = expires_at_dt
        service.updated_at = datetime.now(timezone.utc)
    else:
        service = UserService(
            user_id=user_id,
            service_key=provider,
            token_data=token_json.encode(),
            token_iv=b'',
            token_tag=b'',
            token_expires_at=expires_at_dt
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
    service = db.query(UserService).filter(
        UserService.user_id == user_id,
        UserService.service_key == provider
    ).first()
    if not service or not service.token_data:
        return None
    try:
        token: Dict[str, Any] = json.loads(service.token_data.decode())
    except Exception:
        return None
    if "expires_at" not in token and service.token_expires_at:
        token["expires_at"] = int(service.token_expires_at.timestamp())
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
        if not new_token.get("refresh_token"):
            new_token["refresh_token"] = refresh_token
        if "expires_at" not in new_token and "expires_in" in new_token:
            new_token["expires_at"] = int((datetime.now(timezone.utc) + timedelta(seconds=new_token["expires_in"])).timestamp())
        save_token_to_db(db, user_id, provider, new_token)
        return new_token
    except Exception as e:
        print(f"Erreur refresh token: {e}")
        return None
