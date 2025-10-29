from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.models.models import Workflow, User
from app.database import get_db

feed_router = APIRouter(prefix="/feed", tags=["feed"])

@feed_router.get("/workflows")
async def get_public_workflows(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    search: str = Query(None, description="Recherche par nom ou description"),
):
    query = db.query(Workflow).filter(
        Workflow.visibility == "public"
    )
    if search:
        query = query.filter(
            Workflow.name.ilike(f"%{search}%") |
            Workflow.description.ilike(f"%{search}%")
        )
    workflows = (
        query.order_by(Workflow.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": w.id,
            "name": w.name,
            "description": w.description,
            "author": w.user.username if w.user else None,
            "created_at": w.created_at,
            "steps_count": len(w.steps),
        }
        for w in workflows
    ]