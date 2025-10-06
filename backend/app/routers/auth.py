from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import random
from datetime import datetime, timedelta, timezone

from app.services.auth import get_user_by_email, hash_password, create_jwt_token, verify_password, send_verification_email, get_current_user
from app.database import get_db
from app.models.models import User
from app.schemas.auth import UserCreate, Token, VerificationResponse, UserInfo, UserLogin, ResendVerificationRequest, ChangePasswordRequest


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
    return {"detail": "Compte supprimé"}

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