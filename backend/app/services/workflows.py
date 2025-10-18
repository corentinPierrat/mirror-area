from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Workflow, WorkflowStep
from app.services.reactions import execute_reaction

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

                step.params["message"] = data.get("message", "")
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