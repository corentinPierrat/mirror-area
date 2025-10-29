from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.models.models import Workflow, WorkflowStep, User
from app.database import get_db

feed_router = APIRouter(prefix="/feed", tags=["feed"])

@feed_router.get("/workflows")
async def get_public_workflows(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    service: str = Query(None, description="Filtrer par service (ex: discord, twitch, etc.)"),
):
    query = db.query(Workflow).filter(
        Workflow.visibility == "public"
    )
    if service:
        query = query.join(Workflow.steps).filter(WorkflowStep.service == service)
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
            "steps": [
                {
                    "step_order": s.step_order,
                    "type": s.type,
                    "service": s.service,
                    "event": s.event,
                    "params": s.params,
                }
                for s in sorted(w.steps, key=lambda s: s.step_order)
            ],
        }
        for w in workflows
    ]