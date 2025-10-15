from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Workflow, WorkflowStep, User
from app.schemas.workflows import WorkflowCreate, WorkflowStepCreate, WorkflowOut
from app.services.auth import get_current_user
from app.services.twitch import create_twitch_webhook, get_twitch_user_id, delete_twitch_webhook

workflows_router = APIRouter(prefix="/workflows", tags=["workflows"])

@workflows_router.post("/", response_model=WorkflowOut)
async def create_workflow(
    workflow: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print(f"🚀 [CREATE_WORKFLOW] Starting workflow creation for user {current_user.id}")
    print(f"📝 [CREATE_WORKFLOW] Workflow data: name='{workflow.name}', steps={len(workflow.steps)}")
    
    try:
        # Créer le workflow principal
        print(f"💾 [CREATE_WORKFLOW] Creating main workflow in database...")
        db_workflow = Workflow(
            user_id=current_user.id,
            name=workflow.name,
            description=workflow.description,
            visibility=workflow.visibility
        )
        db.add(db_workflow)
        db.commit()
        db.refresh(db_workflow)
        print(f"✅ [CREATE_WORKFLOW] Workflow created with ID: {db_workflow.id}")

        # Traiter chaque step
        for idx, step in enumerate(workflow.steps):
            print(f"\n🔄 [STEP_{idx}] Processing step {idx}: {step.type} {step.service}.{step.event}")
            print(f"🔄 [STEP_{idx}] Step params: {step.params}")
            
            try:
                # Créer le step en base
                print(f"💾 [STEP_{idx}] Creating WorkflowStep in database...")
                db_step = WorkflowStep(
                    workflow_id=db_workflow.id,
                    step_order=idx,
                    type=step.type,
                    service=step.service,
                    event=step.event,
                    params=step.params
                )
                db.add(db_step)
                print(f"✅ [STEP_{idx}] WorkflowStep added to session")

                # Si c'est une action Twitch, créer le webhook
                if step.type == "action" and step.service == "twitch":
                    print(f"🟢 [TWITCH_{idx}] Detected Twitch action, creating webhook...")
                    
                    if not step.params:
                        raise ValueError("Step params is None")
                    
                    username = step.params.get("username_streamer")
                    if not username:
                        raise ValueError("Missing 'username_streamer' in params")
                    
                    print(f"🟢 [TWITCH_{idx}] Username: {username}")
                    print(f"🟢 [TWITCH_{idx}] Event: {step.event}")
                    print(f"🟢 [TWITCH_{idx}] Getting Twitch user ID...")
                    
                    broadcaster_id = await get_twitch_user_id(username)
                    print(f"✅ [TWITCH_{idx}] Broadcaster ID: {broadcaster_id}")
                    
                    print(f"🟢 [TWITCH_{idx}] Creating webhook with Twitch API...")
                    webhook_id = await create_twitch_webhook(
                        step.event, broadcaster_id)
                    print(f"✅ [TWITCH_{idx}] Webhook created: {webhook_id}")
                    
                    print(f"🟢 [TWITCH_{idx}] Adding webhook_id to params...")
                    db_step.params["webhook_id"] = webhook_id
                    print(f"✅ [TWITCH_{idx}] Webhook ID added to step params")
                
                print(f"✅ [STEP_{idx}] Step processing completed")
                
            except Exception as step_error:
                print(f"❌ [STEP_{idx}] ERROR in step processing: {step_error}")
                print(f"❌ [STEP_{idx}] Step error type: {type(step_error).__name__}")
                import traceback
                print(f"❌ [STEP_{idx}] Full traceback:")
                traceback.print_exc()
                
                # Rollback
                print(f"🔄 [ROLLBACK] Deleting workflow {db_workflow.id} due to step error...")
                db.delete(db_workflow)
                db.commit()
                print(f"✅ [ROLLBACK] Workflow deleted")
                
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to create step {idx} ({step.service}.{step.event}): {step_error}"
                )

        # Commit final
        print(f"\n💾 [FINAL_COMMIT] Committing all steps to database...")
        db.commit()
        print(f"✅ [FINAL_COMMIT] All steps committed successfully")
        
        print(f"🎉 [CREATE_WORKFLOW] Workflow creation completed! ID: {db_workflow.id}")
        return db_workflow

    except HTTPException:
        # Re-raise HTTPException (déjà gérée)
        raise
    except Exception as e:
        print(f"❌ [CREATE_WORKFLOW] FATAL ERROR: {e}")
        print(f"❌ [CREATE_WORKFLOW] Error type: {type(e).__name__}")
        import traceback
        print(f"❌ [CREATE_WORKFLOW] Full traceback:")
        traceback.print_exc()
        
        # Essayer de rollback si le workflow existe
        try:
            if 'db_workflow' in locals():
                print(f"🔄 [FATAL_ROLLBACK] Attempting to delete workflow...")
                db.delete(db_workflow)
                db.commit()
                print(f"✅ [FATAL_ROLLBACK] Workflow deleted")
        except Exception as rollback_error:
            print(f"❌ [FATAL_ROLLBACK] Rollback failed: {rollback_error}")
        
        raise HTTPException(status_code=500, detail=f"Workflow creation failed: {e}")

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