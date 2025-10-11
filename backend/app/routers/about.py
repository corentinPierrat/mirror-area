from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import time

about_router = APIRouter()

@about_router.get("/about.json")
async def about(request: Request):
    client_ip = request.client.host

    services = [
        {
            "name": "discord",
            "actions": [
                {
                    "name": "member_join",
                    "description": "Un membre rejoint le serveur Discord"
                }
            ]
        },
        {
            "name": "twitter",
            "actions": [],
            "reactions": [
                {
                    "name": "tweet",
                    "description": "Publie un tweet avec le texte fourni."
                }
            ]
        },
        {
            "name": "google",
            "actions": [],
            "reactions": [
                {
                    "name": "send_mail",
                    "description": "Envoie un courriel via l'API Gmail."
                }
            ]
        },
        {
            "name": "faceit",
            "actions": [],
            "reactions": []
        },
        {
            "name": "twitch",
            "actions": [],
            "reactions": []
        },
        {
            "name": "spotify",
            "actions": [],
            "reactions": []
        }
    ]

    return JSONResponse({
        "client": {
            "host": client_ip
        },
        "server": {
            "current_time": int(time.time()),
            "services": services
        }
    })