from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Workflow, WorkflowStep, User
from app.schemas.workflows import WorkflowCreate, WorkflowStepCreate, WorkflowOut
from app.services.auth import get_current_user
from app.services.twitch import delete_twitch_webhook
from app.services.reactions import execute_reaction
from app.services.actions import execute_action
from app.services.workflows import create_steps_for_workflow, delete_steps_for_workflow

workflows_router = APIRouter(prefix="/workflows", tags=["workflows"])

@workflows_router.post("/", response_model=WorkflowOut)
async def create_workflow(
    workflow: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        db_workflow = Workflow(
            user_id=current_user.id,
            name=workflow.name,
            description=workflow.description,
            visibility=workflow.visibility,
            active=workflow.active
        )
        db.add(db_workflow)
        db.commit()
        db.refresh(db_workflow)

        await create_steps_for_workflow(db, db_workflow.id, workflow.steps, current_user.id)

        db.commit()
        return db_workflow
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create workflow: {e}")

@workflows_router.get("/", response_model=list[WorkflowOut])
def list_workflows(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Workflow).filter_by(user_id=current_user.id).all()

@workflows_router.delete("/{workflow_id}", status_code=204)
async def delete_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workflow = db.query(Workflow).filter_by(id=workflow_id, user_id=current_user.id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    for step in workflow.steps:
        if step.type == "action" and step.service == "twitch":
            webhook_id = step.params.get("webhook_id") if step.params else None
            if webhook_id:
                try:
                    await delete_twitch_webhook(db, current_user.id, webhook_id)
                except Exception as e:
                    print(f"Failed to delete Twitch webhook {webhook_id}: {e}")

    db.delete(workflow)
    db.commit()
    return

@workflows_router.post("/test-step")
async def test_workflow_step(
    step: WorkflowStepCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    params = step.params or {}

    if step.type == "action":
        try:
            result = await execute_action(step.service, step.event, db, current_user.id, params)
            return {"success": True, "result": result}
        except NotImplementedError as exc:
            return {"success": False, "message": str(exc)}
        except Exception as exc:
            return {"success": False, "message": str(exc)}

    if step.type == "reaction":
        try:
            result = await execute_reaction(step.service, step.event, db, current_user.id, params)
        except NotImplementedError as exc:
            return {"success": False, "message": str(exc)}
        except Exception as exc:
            return {"success": False, "message": str(exc)}

        if isinstance(result, dict):
            error_payload = result.get("error") or result.get("detail")
            if error_payload:
                return {"success": False, "message": str(error_payload)}

            success_message = result.get("status") or result.get("detail") or result.get("message")
            if success_message:
                return {"success": True, "message": str(success_message)}

        return {"success": True, "message": "Reaction executed successfully."}

    return {"success": False, "message": f"Step type not supported for tests: {step.type}"}


@workflows_router.put("/{workflow_id}", response_model=WorkflowOut)
async def update_workflow(
    workflow_id: int,
    workflow_update: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_workflow = db.query(Workflow).filter_by(id=workflow_id, user_id=current_user.id).first()
    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    try:
        db_workflow.name = workflow_update.name
        db_workflow.description = workflow_update.description
        db_workflow.visibility = workflow_update.visibility
        db_workflow.active = workflow_update.active

        await delete_steps_for_workflow(db, db_workflow, current_user.id)
        await create_steps_for_workflow(db, db_workflow.id, workflow_update.steps, current_user.id)
        db.commit()
        db.refresh(db_workflow)

        return db_workflow

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"Failed to update workflow: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update workflow: {e}")

@workflows_router.patch("/{workflow_id}/toggle", response_model=WorkflowOut)
async def toggle_workflow_status(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle the active status of a workflow"""
    workflow = db.query(Workflow).filter_by(id=workflow_id, user_id=current_user.id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    workflow.active = not workflow.active
    db.commit()
    db.refresh(workflow)

    return workflow
