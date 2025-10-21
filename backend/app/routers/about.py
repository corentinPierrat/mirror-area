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
                },
                {
                    "name": "member_remove",
                    "description": "Un membre quitte le serveur Discord"
                },
                {
                    "name": "member_update",
                    "description": "Un membre met à jour son pseudo ou ses rôles sur le serveur Discord"
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
            "actions": [
                {
                    "name": "stream_online",
                    "description": "Un streamer passe en direct sur Twitch"
                },
                {
                    "name": "new_follow",
                    "description": "Un utilisateur suit un streamer sur Twitch"
                },
                {
                    "name": "new_subscribe",
                    "description": "Un utilisateur s'abonne à un streamer sur Twitch"
                }
            ],
            "reactions": []
        },
        {
            "name": "spotify",
            "actions": [],
            "reactions": [
                {
                    "name": "play_playlist",
                    "description": "Joue une playlist spécifique sur Spotify."
                },
                {
                    "name": "play_track",
                    "description": "Joue une piste spécifique sur Spotify."
                }
            ]
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