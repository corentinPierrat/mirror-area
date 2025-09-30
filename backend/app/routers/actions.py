from fastapi import APIRouter, Request, Body
from fastapi.responses import JSONResponse
from app.routers.oauth import oauth, get_token

actions_router = APIRouter(prefix="/actions", tags=["actions"])

@actions_router.get("/discord/servers")
async def discord_servers(request: Request):
    token = get_token(request.session, "discord")
    if not token:
        return JSONResponse({"error": "Not logged in to Discord"}, status_code=401)

    client = oauth.create_client("discord")
    resp = await client.get("users/@me/guilds", token=token)

    if resp.status_code != 200:
        return JSONResponse({"error": resp.text}, status_code=resp.status_code)

    guilds = resp.json()
    simplified = [
        {
            "id": g["id"],
            "name": g["name"],
            "icon": f"https://cdn.discordapp.com/icons/{g['id']}/{g['icon']}.png" if g.get("icon") else None,
            "owner": g.get("owner", False),
            "permissions": g.get("permissions"),
        }
        for g in guilds
    ]
    return JSONResponse({"guilds": simplified})
