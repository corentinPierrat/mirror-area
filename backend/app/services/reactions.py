from app.services.token_storage import get_token_from_db, refresh_oauth_token
from app.routers.oauth import oauth
from sqlalchemy.orm import Session
from typing import Dict, Any, Callable
import os
import requests
import base64
from email.mime.text import MIMEText

async def twitter_tweet_reaction(db: Session, user_id: int, params: dict):
    token = await refresh_oauth_token(db, user_id, "twitter")
    if not token:
        return {"error": "Not logged in to Twitter"}
    text = params.get("message")
    if not text or not text.strip():
        return {"error": "Missing text"}
    resp = await oauth.twitter.post("tweets", token=token, json={"text": text})
    if resp.status_code in (200, 201):
        return resp.json()
    else:
        return {"error": resp.json()}

async def microsoft_send_mail_reaction(db: Session, user_id: int, params: dict):
    token = get_token_from_db(db, user_id, "microsoft")
    if not token:
        return {"error": "Not logged in to Microsoft"}
    client = oauth.create_client("microsoft")
    message = {
        "message": {
            "subject": params["subject"],
            "body": {
                "contentType": params.get("content_type", "HTML"),
                "content": params["content"]
            },
            "toRecipients": [
                {"emailAddress": {"address": addr}} for addr in params["to"]
            ]
        },
        "saveToSentItems": True
    }
    resp = await client.post("me/sendMail", json=message, token=token)
    if resp.status_code in (202, 200):
        return {"status": "Mail envoyé"}
    return {"error": resp.text}

async def google_send_mail_reaction(db: Session, user_id: int, params: dict):
    token = get_token_from_db(db, user_id, "google")
    if not token:
        return {"error": "Not logged in to Google"}

    client = oauth.create_client("google")
    mime_message = MIMEText(params["content"], params.get("content_type", "html").lower())
    mime_message["to"] = params["to"]
    mime_message["subject"] = params["subject"]
    raw_message = base64.urlsafe_b64encode(mime_message.as_bytes()).decode()
    message_body = {"raw": raw_message}
    resp = await client.post("gmail/v1/users/me/messages/send", json=message_body, token=token)

    if resp.status_code in (200, 201, 202):
        return {"status": "Email envoyé avec succès"}
    else:
        try:
            return {"error": resp.json()}
        except Exception:
            return {"error": resp.text}

REACTION_DISPATCH: Dict[tuple[str, str], Callable[[Session, int, dict], Any]] = {
    ("twitter", "tweet"): twitter_tweet_reaction,
    ("microsoft", "send_mail"): microsoft_send_mail_reaction,
    ("google", "send_mail"): google_send_mail_reaction,
}

async def execute_reaction(service: str, event: str, db: Session, user_id: int, params: dict):
    func = REACTION_DISPATCH.get((service, event))
    if not func:
        raise NotImplementedError(f"No reaction for {service}:{event}")
    return await func(db, user_id, params)