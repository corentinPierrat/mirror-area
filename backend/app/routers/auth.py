import random
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.services.auth import get_user_by_email, hash_password, create_jwt_token, verify_password, send_verification_email, get_current_user
from app.database import get_db
from app.models.models import User
from app.schemas.auth import UserCreate, Token, VerificationResponse, UserInfo, UserLogin, ResendVerificationRequest, ChangePasswordRequest
from app.config import settings


auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/register")
def register_user(form_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, form_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    code = str(random.randint(100000, 999999))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    new_user = User(
        username=form_data.username,
        email=form_data.email,
        password_hash=hash_password(form_data.password),
        role="user",
        is_verified=False,
        verification_token=code,
        verification_token_expires_at=expires_at
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    send_verification_email(form_data.email, code)

    return {"msg": "User registered, verification code sent by email"}

@auth_router.post("/login", response_model=Token)
def login_user(form_data: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, form_data.email)

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")

    access_token = create_jwt_token(data={"sub": user.email})

    return {"access_token": access_token, "token_type": "bearer"}

@auth_router.post("/verify")
def verify_email(verification: VerificationResponse, db: Session = Depends(get_db)):
    user = get_user_by_email(db, verification.email)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    if not user.verification_token:
        raise HTTPException(status_code=400, detail="No verification code found")
    if user.verification_token_expires_at and user.verification_token_expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Verification code expired. Please request a new one."
        )
    if user.verification_token != verification.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires_at = None
    db.commit()

    return {"msg": "Email verified successfully"}

@auth_router.post("/resend-verification")
def resend_verification(request: ResendVerificationRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, request.email)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    code = str(random.randint(100000, 999999))
    user.verification_token = code
    user.verification_token_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    send_verification_email(user.email, code)

    return {"msg": "Verification code resent"}

@auth_router.get("/me", response_model=UserInfo)
def get_my_info(current_user: User = Depends(get_current_user)):
    return current_user

@auth_router.delete("/me")
def delete_my_account(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db.delete(current_user)
    db.commit()
    return {"detail": "Account deleted"}

MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
}

@auth_router.post("/me/profile-image", response_model=UserInfo)
async def upload_profile_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    extension = ALLOWED_IMAGE_TYPES.get(file.content_type or "")
    if not extension:
        raise HTTPException(status_code=400, detail="Unsupported image format. Use JPEG, PNG, or WEBP.")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_PROFILE_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image too large (max 5 MB).")

    profile_dir = Path(settings.MEDIA_ROOT) / "profile_images"
    profile_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4().hex}{extension}"
    file_path = profile_dir / filename
    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)

    old_url = current_user.profile_image_url
    if old_url:
        media_prefix = settings.MEDIA_URL.rstrip("/")
        if old_url.startswith(media_prefix):
            relative_old = old_url[len(media_prefix):].lstrip("/")
            old_path = Path(settings.MEDIA_ROOT) / relative_old
            if old_path.exists():
                try:
                    old_path.unlink()
                except OSError:
                    pass

    public_url = f"{settings.MEDIA_URL.rstrip('/')}/profile_images/{filename}"
    current_user.profile_image_url = public_url
    db.commit()
    db.refresh(current_user)

    return current_user

@auth_router.patch("/change-password")
def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(request.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    current_user.password_hash = hash_password(request.new_password)
    db.commit()
    return {"msg": "Password changed successfully"}
