from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Workflow, WorkflowStep
from app.services.reactions import execute_reaction
from app.services.twitch import get_twitch_user_id, create_twitch_webhook, delete_twitch_webhook
from fastapi import HTTPException

async def trigger_workflows(service: str, event_type: str, data: dict, db: Session):
    """Fonction générique pour déclencher les workflows"""

    filter_conditions = [
        WorkflowStep.event == event_type,
        WorkflowStep.service == service,
        WorkflowStep.type == "action"
    ]

    if service == "discord" and "guild_id" in data:
        filter_conditions.append(
            func.JSON_EXTRACT(WorkflowStep.params, '$.guild_id') == data["guild_id"]
        )
    elif service == "twitch" and "broadcaster_user_id" in data:
        filter_conditions.append(
            func.JSON_EXTRACT(WorkflowStep.params, '$.broadcaster_user_id') == data["broadcaster_user_id"]
        )
    elif service == "faceit" and "player_id" in data:
        filter_conditions.append(
            func.JSON_EXTRACT(WorkflowStep.params, '$.player_id') == data["player_id"]
        )

    workflows = db.query(Workflow).join(WorkflowStep).filter(*filter_conditions).all()

    results = []
    for workflow in workflows:
        for step in workflow.steps:
            if step.type == "reaction":
                if step.params is None:
                    step.params = {}

                incoming_message = data.get("message")
                if incoming_message:
                    step.params["message"] = incoming_message
                if service == "faceit":
                    step.params["faceit_data"] = {
                        "nickname": data.get("nickname"),
                        "skill_level": data.get("skill_level"),
                        "faceit_elo": data.get("faceit_elo"),
                        "game": data.get("game"),
                        "lifetime_stats": data.get("lifetime_stats", {})
                    }
                try:
                    result = await execute_reaction(step.service, step.event, db, workflow.user_id, step.params)
                    results.append({"success": True, "result": result})
                except NotImplementedError as e:
                    results.append({"success": False, "error": f"Not implemented: {e}"})
                except Exception as e:
                    results.append({"success": False, "error": str(e)})

    return results


async def create_steps_for_workflow(db: Session, workflow_id: int, steps: list, user_id: int):
    """
    Crée tous les steps d’un workflow, avec gestion des webhooks Twitch.
    """
    created_steps = []
    for idx, step in enumerate(steps):
        try:
            db_step = WorkflowStep(
                workflow_id=workflow_id,
                step_order=idx,
                type=step.type,
                service=step.service,
                event=step.event,
                params=step.params
            )
            db.add(db_step)

            if step.type == "action" and step.service == "twitch":
                if not step.params:
                    raise ValueError("Step params is None")

                username = step.params.get("username_streamer")
                if not username:
                    raise ValueError("Missing 'username_streamer' in params")

                broadcaster_id = await get_twitch_user_id(username)
                webhook_id = await create_twitch_webhook(step.event, broadcaster_id)
                db_step.params["webhook_id"] = webhook_id

            created_steps.append(db_step)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create step {idx} ({step.service}.{step.event}): {e}"
            )

    db.commit()
    return created_steps

async def delete_steps_for_workflow(db: Session, workflow, user_id: int):
    """
    Supprime tous les steps d’un workflow, et nettoie les webhooks Twitch.
    """
    for step in workflow.steps:
        if step.type == "action" and step.service == "twitch":
            webhook_id = step.params.get("webhook_id") if step.params else None
            if webhook_id:
                try:
                    await delete_twitch_webhook(db, user_id, webhook_id)
                except Exception as e:
                    print(f"Failed to delete Twitch webhook {webhook_id}: {e}")
        db.delete(step)
    db.commit()
