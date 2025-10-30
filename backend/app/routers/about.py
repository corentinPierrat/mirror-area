import time
from typing import Any, Dict

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.routers.catalog import ACTIONS_CATALOG, REACTIONS_CATALOG

about_router = APIRouter()


def ensure_service(services: Dict[str, Dict[str, Any]], service_name: str) -> Dict[str, Any]:
    if service_name not in services:
        services[service_name] = {
            "name": service_name,
            "actions": [],
            "reactions": []
        }
    return services[service_name]


@about_router.get("/about.json")
async def about(request: Request):
    client_ip = request.client.host

    services_map: Dict[str, Dict[str, Any]] = {}

    for meta in ACTIONS_CATALOG.values():
        service_entry = ensure_service(services_map, meta["service"])
        action_name = meta.get("event") or meta.get("name")
        if not action_name:
            continue
        if not any(action["name"] == action_name for action in service_entry["actions"]):
            service_entry["actions"].append({
                "name": action_name,
                "description": meta.get("description", "")
            })

    for meta in REACTIONS_CATALOG.values():
        service_entry = ensure_service(services_map, meta["service"])
        reaction_name = meta.get("event") or meta.get("name")
        if not reaction_name:
            continue
        if not any(reaction["name"] == reaction_name for reaction in service_entry["reactions"]):
            service_entry["reactions"].append({
                "name": reaction_name,
                "description": meta.get("description", "")
            })

    services = sorted(services_map.values(), key=lambda svc: svc["name"])
    for service in services:
        service["actions"] = sorted(service["actions"], key=lambda action: action["name"])
        service["reactions"] = sorted(service["reactions"], key=lambda reaction: reaction["name"])

    return JSONResponse({
        "client": {
            "host": client_ip
        },
        "server": {
            "current_time": int(time.time()),
            "services": services
        }
    })
