from fastapi import APIRouter, Request, Header, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.config import settings
from app.models.models import Workflow, WorkflowStep
from app.services.reactions import execute_reaction

actions_router = APIRouter(prefix="/actions", tags=["actions"])

@actions_router.post("/discord")
async def discord_action(request: Request, db: Session = Depends(get_db), bot_token: str = Header(None)):
    if bot_token != settings.TOKEN_BOT:
        return JSONResponse(status_code=403, content={"detail": "Forbidden"})

    data = await request.json()
    event_type = data.get("event")
    guild_id = data.get("guild_id")

    workflows = db.query(Workflow).join(WorkflowStep).filter(
        WorkflowStep.event == event_type,
        WorkflowStep.service == "discord",
        func.JSON_EXTRACT(WorkflowStep.params, '$.guild_id') == guild_id
    ).all()
    for workflow in workflows:
        for step in workflow.steps:
            print(f"Processing step: {step.type} {step.service}:{step.event} with params {step.params}")
            if step.type == "reaction":
                if step.params is None:
                    step.params = {}
                step.params["message"] = data.get("message", "")
                try:
                    result = await execute_reaction(step.service, step.event, db, workflow.user_id, step.params)
                    print(f"Executed reaction {step.service}:{step.event} for user {workflow.user_id}, result: {result}")
                except NotImplementedError as e:
                    print(f"Reaction not implemented: {e}")
                except Exception as e:
                    print(f"Error executing reaction: {e}")
    return JSONResponse(status_code=200, content={"detail": "Workflows triggered"})