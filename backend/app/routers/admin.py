from fastapi import HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
from app.models.models import User, Workflow, UserService
from app.database import get_db
from app.services.auth import get_current_admin_user, hash_password
from app.schemas.admin import UserCreate, UserUpdate
from app.schemas.auth import UserInfo
from sqlalchemy import func, text

admin_router = APIRouter(prefix="/admin", tags=["admin"])

@admin_router.get("/users", response_model=list[UserInfo])
async def get_users(db: Session = Depends(get_db), admin_user: User = Depends(get_current_admin_user)):
    return db.query(User).all()

@admin_router.post("/users", response_model=UserInfo)
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

@admin_router.patch("/users/{user_id}", response_model=UserInfo)
async def patch_user(user_id: int, updated_user: UserUpdate, db: Session = Depends(get_db), admin_user: User = Depends(get_current_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if updated_user.username:
        user.username = updated_user.username
    if updated_user.email:
        user.email = updated_user.email
    if updated_user.role:
        user.role = updated_user.role
    if updated_user.password:
        user.password_hash = hash_password(updated_user.password)
    db.commit()
    db.refresh(user)
    return user

@admin_router.get("/stats")
async def get_stats(db: Session = Depends(get_db), admin_user: User = Depends(get_current_admin_user)):
    user_count = db.query(User).count()
    workflow_count = db.query(Workflow).filter(Workflow.is_active == True).count()
    services_count = db.query(UserService).count()
    signups_last_7d = db.query(User).filter(
        User.created_at >= func.now() - text("INTERVAL '7 days'")
    ).count()
    return {
        "total_users": user_count,
        "active_workflows": workflow_count,
        "services_connected": services_count,
        "recent_signups": signups_last_7d
    }