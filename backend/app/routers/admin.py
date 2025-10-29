from fastapi import HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
from app.models.models import User
from app.database import get_db
from app.services.auth import get_current_admin_user, hash_password
from app.schemas.admin import UserCreate, UserUpdate

admin_router = APIRouter(prefix="/admin", tags=["admin"])

@admin_router.get("/users")
async def get_users(db: Session = Depends(get_db), admin_user: User = Depends(get_current_admin_user)):
    return db.query(User).all()

@admin_router.post("/users")
async def create_user(user: UserCreate, db: Session = Depends(get_db), admin_user: User = Depends(get_current_admin_user)):
    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password),
        role=user.role,
        is_verified=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@admin_router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db), admin_user: User = Depends(get_current_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"detail": "User deleted"}

@admin_router.put("/users/{user_id}")
async def update_user(user_id: int, updated_user: UserUpdate, db: Session = Depends(get_db), admin_user: User = Depends(get_current_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.username = updated_user.username
    user.email = updated_user.email
    user.role = updated_user.role
    user.password_hash = hash_password(updated_user.password)
    db.commit()
    db.refresh(user)
    return user