from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.services.auth import get_user_by_email, hash_password, create_jwt_token, verify_password
from app.database import get_db
from app.models.models import User
from app.schemas.auth import UserCreate, Token

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/register", response_model=Token)
def register_user(form_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, form_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    password_hash = hash_password(form_data.password)
    print(f"Password hash: {password_hash}")
    new_user = User(email=form_data.email, password_hash=password_hash, role="user")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_jwt_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@auth_router.post("/login", response_model=Token)
def login_user(form_data: UserCreate, db: Session = Depends(get_db)):
    user = get_user_by_email(db, form_data.email)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_jwt_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}