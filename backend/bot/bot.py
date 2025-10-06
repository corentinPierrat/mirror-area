import discord
import requests

TOKEN = "MTQyNDQxMjQ0NDM4NTc0MjkzOQ.Gqe9lw.5LTCquR1T-iFm8IO1RlLMla6VFqiTbn6OS9WVw"
BACKEND_URL = "http://localhost:8080/actions/discord"
BOT_SECRET = "super-secret-bot-token"

intents = discord.Intents.default()
intents.members = True

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f"✅ Connecté en tant que {client.user}")

@client.event
async def on_member_join(member):
    payload = {
        "event": "member_join",
        "guild_id": str(member.guild.id),
        "user_id": str(member.id),
        "message": f"Test, {member.name} !"
    }
    headers = {"bot-token": BOT_SECRET}
    try:
        response = requests.post(BACKEND_URL, json=payload, headers=headers, timeout=5)
        print(f"Sent event to backend: {response.status_code} {response.text}")
    except Exception as e:
        print(f"Error sending event to backend: {e}")

client.run(TOKEN)