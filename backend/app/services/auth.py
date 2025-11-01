from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
import smtplib
import secrets
import string

from app.config import settings
from app.models.models import User
from app.config import settings
from app.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def random_password(length: int = 32) -> str:
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_jwt_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def send_verification_email(to_email: str, code: str):
    msg = EmailMessage()
    msg["Subject"] = "Your Triggers verification code"
    msg["From"] = "Triggers <3triggers12@gmail.com>"
    msg["Reply-To"] = "3triggers12@gmail.com"
    msg["To"] = to_email

    msg["X-Priority"] = "3"
    msg["X-Mailer"] = "Triggers Verification System"

    msg.set_content(
        f"""
        Hello,

        Here is the verification code to activate your Triggers account.

        Your verification code: {code}

        This code expires in 10 minutes.

        If you didn't request this, simply ignore this message.

        Regards,
        The Triggers team

        ---
        This email is an automated message; please do not reply directly.
        """
    )

    msg.add_alternative(f"""
        <html>
            <head>
                <meta charset="UTF-8">
            </head>
            <body style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:0 auto;">
                <div style="background-color:#f8f9fa; padding:20px; border-radius:5px;">
                    <h1 style="color:#2F855A;">Triggers</h1>
                    <p>Hello,</p>
                    <p>Here is the verification code to activate your Triggers account.</p>

                    <div style="background-color:white; padding:20px; border-radius:5px; text-align:center; margin:20px 0;">
                        <p style="margin:0; color:#666;">Your verification code:</p>
                        <h2 style="color:#2F855A; font-size:32px; letter-spacing:5px; margin:10px 0;">{code}</h2>
                        <p style="margin:0; color:#999; font-size:12px;">This code expires in 10 minutes</p>
                    </div>

                    <p style="color:#666; font-size:14px;">
                        If you didn't request this, simply ignore this message.
                    </p>

                    <hr style="border:none; border-top:1px solid #ddd; margin:20px 0;">

                    <p style="color:#999; font-size:12px;">
                        Regards,<br>
                        The Triggers team<br>
                        <br>
                        <em>This email is an automated message; please do not reply directly.</em>
                    </p>
                </div>
            </body>
        </html>
    """, subtype="html")

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(settings.USER_SMTP_EMAIL, settings.USER_SMTP_PASSWORD)
        smtp.send_message(msg)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db), admin: bool = False) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if admin and not user.role == "admin":
        raise HTTPException(status_code=403, detail="User is not an admin")

    return user

def get_current_admin_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    return get_current_user(token, db, admin=True)
