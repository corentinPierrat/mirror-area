from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Workflow, WorkflowStep, User
from app.schemas.workflows import WorkflowCreate, WorkflowStepCreate, WorkflowOut
from app.services.auth import get_current_user

workflows_router = APIRouter(prefix="/workflows", tags=["workflows"])

@workflows_router.post("/", response_model=WorkflowOut)
def create_workflow(
    workflow: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_workflow = Workflow(
        user_id=current_user.id,
        name=workflow.name,
        description=workflow.description,
        visibility=workflow.visibility
    )
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)

    for idx, step in enumerate(workflow.steps):
        db_step = WorkflowStep(
            workflow_id=db_workflow.id,
            step_order=idx,
            type=step.type,
            service=step.service,
            event=step.event,
            params=step.params
        )
        db.add(db_step)
    db.commit()
    return db_workflow

@workflows_router.get("/", response_model=list[WorkflowOut])
def list_workflows(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Workflow).filter_by(user_id=current_user.id).all()

@workflows_router.delete("/{workflow_id}", status_code=204)
def delete_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workflow = db.query(Workflow).filter_by(id=workflow_id, user_id=current_user.id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    db.delete(workflow)
    db.commit()
    return