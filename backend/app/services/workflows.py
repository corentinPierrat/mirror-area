from copy import deepcopy
from typing import Any, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Workflow, WorkflowStep
from app.services.reactions import execute_reaction
from app.services.actions import execute_action
from app.services.twitch import get_twitch_user_id, create_twitch_webhook, delete_twitch_webhook
from fastapi import HTTPException

def value_from_path(payload: Any, path: str):
    if payload is None:
        return None
    if path in (None, "", "."):
        return payload

    current = payload
    for part in path.split("."):
        if isinstance(current, list):
            try:
                idx = int(part)
            except (TypeError, ValueError):
                return None
            if idx < 0 or idx >= len(current):
                return None
            current = current[idx]
        elif isinstance(current, dict):
            current = current.get(part)
        else:
            return None

        if current is None:
            return None
    return current


def resolve_param_value(value: Any, context: Dict[Any, Any]):
    if isinstance(value, dict) and "__link" in value:
        link_data = value.get("__link") or {}
        source_step = link_data.get("source_step")
        path = link_data.get("path")
        fallback = link_data.get("fallback")

        payload = context.get(source_step)
        resolved = value_from_path(payload, path) if payload is not None else None
        if resolved in (None, "", [], {}):
            return fallback
        return resolved
    return value


def prepare_step_params(raw_params: dict | None, context: Dict[Any, Any], trigger_data: dict, include_message_fallback: bool = False):
    params: Dict[str, Any] = {}
    for key, value in (raw_params or {}).items():
        params[key] = resolve_param_value(value, context)

    if include_message_fallback:
        incoming_message = trigger_data.get("message")
        if incoming_message and params.get("message") in (None, "", {}, []):
            params["message"] = incoming_message

    return params


async def trigger_workflows(service: str, event_type: str, data: dict, db: Session):
    filter_conditions = [
        WorkflowStep.event == event_type,
        WorkflowStep.service == service,
        WorkflowStep.type == "action",
        Workflow.active == True
    ]
    print(f"\n=== [DEBUG] Triggering workflows for service: {service}, event: {event_type}, data: {data}")

    if service == "discord" and "guild_id" in data:
        print(f"[DEBUG] Ajout filtre guild_id: {data['guild_id']}")
        filter_conditions.append(
            func.JSON_EXTRACT(WorkflowStep.params, '$.guild_id') == data["guild_id"]
        )
    elif service == "twitch" and "username_streamer" in data:
        print(f"[DEBUG] Ajout filtre username: {data['username_streamer']}")
        filter_conditions.append(
            func.JSON_EXTRACT(WorkflowStep.params, '$.username_streamer') == data["username_streamer"]
        )
    elif service == "faceit" and "player_id" in data:
        print(f"[DEBUG] Ajout filtre player_id: {data['player_id']}")
        filter_conditions.append(
            func.JSON_EXTRACT(WorkflowStep.params, '$.player_id') == data["player_id"]
        )
    elif service == "timer":
        step_id = data.get("step_id")
        workflow_id = data.get("workflow_id")
        print(f"[DEBUG] Ajout filtres timer: step_id={step_id}, workflow_id={workflow_id}")
        if step_id:
            filter_conditions.append(WorkflowStep.id == step_id)
        if workflow_id:
            filter_conditions.append(WorkflowStep.workflow_id == workflow_id)

    for cond in filter_conditions:
        print(f"[DEBUG] Filter condition: {cond}")

    query = db.query(Workflow).join(WorkflowStep).filter(*filter_conditions)
    print("[DEBUG] SQL:", str(query.statement.compile(compile_kwargs={'literal_binds': True})))

    # DEBUG Twitch: Affiche tous les steps candidats et leur params
    if service == "twitch" and "broadcaster_user_id" in data:
        print("[DEBUG] Tous les steps Twitch avec event =", event_type)
        steps = db.query(WorkflowStep).filter(
            WorkflowStep.event == event_type,
            WorkflowStep.service == service,
            WorkflowStep.type == "action"
        ).all()
        for s in steps:
            print(f"[DEBUG] Step id={s.id} workflow_id={s.workflow_id} params={s.params}")
            # Affiche la valeur extraite pour la comparaison
            try:
                import json
                params = s.params if isinstance(s.params, dict) else json.loads(s.params)
                val = params.get("broadcaster_user_id")
                print(f"[DEBUG] Step {s.id} broadcaster_user_id in params: {val} (type: {type(val)})")
            except Exception as e:
                print(f"[DEBUG] Erreur lecture params step {s.id}: {e}")
        print(f"[DEBUG] Comparé à broadcaster_user_id attendu: {data['broadcaster_user_id']} (type: {type(data['broadcaster_user_id'])})")
    workflows = query.all()
    print(f"[DEBUG] Workflows trouvés: {len(workflows)}")
    results = []
    for workflow in workflows:
        print(f"[DEBUG] Workflow id={workflow.id} user_id={workflow.user_id} name={workflow.name}")
        ordered_steps = sorted(workflow.steps, key=lambda s: s.step_order)
        context: Dict[Any, Any] = {"trigger": data}
        for step in ordered_steps:
            print(f"[DEBUG] Step order={step.step_order} type={step.type} service={step.service} event={step.event}")
            if step.type == "action" and step.service == service and step.event == event_type:
                context[step.step_order] = data

        for step in ordered_steps:
            if step.type == "action":
                if step.service == service and step.event == event_type:
                    continue

                print(f"[DEBUG] Execution action: {step.service}.{step.event} (step_order={step.step_order})")
                resolved_params = prepare_step_params(step.params, context, data, include_message_fallback=False)
                print(f"[DEBUG] Params résolus: {resolved_params}")
                try:
                    action_output = await execute_action(step.service, step.event, db, workflow.user_id, resolved_params)
                    context[step.step_order] = action_output
                    print(f"[DEBUG] Action output: {action_output}")
                    results.append({
                        "success": True,
                        "step": f"{step.service}.{step.event}",
                        "result": action_output
                    })
                except NotImplementedError as exc:
                    print(f"[DEBUG] NotImplementedError: {exc}")
                    context[step.step_order] = None
                    results.append({
                        "success": False,
                        "step": f"{step.service}.{step.event}",
                        "error": f"Not implemented: {exc}"
                    })
                except Exception as exc:
                    print(f"[DEBUG] Exception: {exc}")
                    context[step.step_order] = None
                    results.append({
                        "success": False,
                        "step": f"{step.service}.{step.event}",
                        "error": str(exc)
                    })

        for step in ordered_steps:
            if step.type != "reaction":
                continue

            print(f"[DEBUG] Execution reaction: {step.service}.{step.event} (step_order={step.step_order})")
            resolved_params = prepare_step_params(step.params, context, data, include_message_fallback=True)
            print(f"[DEBUG] Params résolus (reaction): {resolved_params}")
            try:
                result = await execute_reaction(step.service, step.event, db, workflow.user_id, resolved_params)
                print(f"[DEBUG] Reaction output: {result}")
                results.append({
                    "success": True,
                    "step": f"{step.service}.{step.event}",
                    "result": result
                })
            except NotImplementedError as exc:
                print(f"[DEBUG] NotImplementedError (reaction): {exc}")
                results.append({
                    "success": False,
                    "step": f"{step.service}.{step.event}",
                    "error": f"Not implemented: {exc}"
                })
            except Exception as exc:
                print(f"[DEBUG] Exception (reaction): {exc}")
                results.append({
                    "success": False,
                    "step": f"{step.service}.{step.event}",
                    "error": str(exc)
                })

    print(f"[DEBUG] Résultats finaux: {results}\n")
    return results


async def create_steps_for_workflow(db: Session, workflow_id: int, steps: list, user_id: int):
    created_steps = []
    id_to_index: Dict[str, int] = {}

    for idx, step in enumerate(steps):
        client_id = getattr(step, "client_id", None)
        if client_id:
            id_to_index[client_id] = idx

    for idx, step in enumerate(steps):
        try:
            params_payload = deepcopy(step.params) if step.params else {}
            links_payload = getattr(step, "links", None) or {}

            for param_name, link_info in links_payload.items():
                if not isinstance(link_info, dict):
                    continue

                source_client_id = link_info.get("source")
                path = link_info.get("path") or link_info.get("field")
                if not source_client_id or not path:
                    continue

                source_index = id_to_index.get(source_client_id)
                if source_index is None:
                    continue

                fallback = link_info.get("fallback")
                existing_value = params_payload.get(param_name)
                if fallback is None and existing_value not in (None, "", [], {}):
                    fallback = existing_value

                link_payload: Dict[str, Any] = {
                    "source_step": source_index,
                    "path": path
                }
                if fallback not in (None, "", [], {}):
                    link_payload["fallback"] = fallback

                params_payload[param_name] = {"__link": link_payload}

            db_step = WorkflowStep(
                workflow_id=workflow_id,
                step_order=idx,
                type=step.type,
                service=step.service,
                event=step.event,
                params=params_payload
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
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create step {idx} ({step.service}.{step.event}): {exc}"
            )

    db.commit()
    return created_steps


async def delete_steps_for_workflow(db: Session, workflow, user_id: int):
    for step in workflow.steps:
        if step.type == "action" and step.service == "twitch":
            webhook_id = step.params.get("webhook_id") if step.params else None
            if webhook_id:
                try:
                    await delete_twitch_webhook(db, user_id, webhook_id)
                except Exception as exc:
                    print(f"Failed to delete Twitch webhook {webhook_id}: {exc}")
        db.delete(step)
    db.commit()
