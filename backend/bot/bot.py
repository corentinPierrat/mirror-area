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
        "message": f"Welcome, {member.name}!"
    }
    headers = {"bot-token": BOT_SECRET}
    try:
        response = requests.post(BACKEND_URL, json=payload, headers=headers, timeout=5)
        print(f"Sent event to backend: {response.status_code} {response.text}")
    except Exception as e:
        print(f"Error sending event to backend: {e}")

@client.event
async def on_member_remove(member):
    payload = {
        "event": "member_remove",
        "guild_id": str(member.guild.id),
        "user_id": str(member.id),
        "message": f"Goodbye, {member.name}!"
    }
    headers = {"bot-token": BOT_SECRET}
    try:
        response = requests.post(BACKEND_URL, json=payload, headers=headers, timeout=5)
        print(f"Sent event to backend: {response.status_code} {response.text}")
    except Exception as e:
        print(f"Error sending event to backend: {e}")

@client.event
async def on_member_update(before, after):
    changes = []

    if before.nick != after.nick:
        changes.append(f"nickname: {before.nick or 'None'} → {after.nick or 'None'}")

    if before.roles != after.roles:
        added_roles = set(after.roles) - set(before.roles)
        removed_roles = set(before.roles) - set(after.roles)

        if added_roles:
            changes.append(f"added roles: {[r.name for r in added_roles]}")
        if removed_roles:
            changes.append(f"removed roles: {[r.name for r in removed_roles]}")

    if before.activity != after.activity:
        before_activity = before.activity.name if before.activity else "None"
        after_activity = after.activity.name if after.activity else "None"
        changes.append(f"activity: {before_activity} → {after_activity}")

    if before.avatar != after.avatar:
        changes.append("avatar changed")

    if before.name != after.name:
        changes.append(f"username: {before.name} → {after.name}")

    if before.discriminator != after.discriminator:
        changes.append(f"discriminator: #{before.discriminator} → #{after.discriminator}")

    if before.timed_out_until != after.timed_out_until:
        if after.timed_out_until:
            changes.append(f"timed out until: {after.timed_out_until}")
        else:
            changes.append("timeout removed")
    print("Detected member update:", changes)
    if changes:
        payload = {
            "event": "member_update",
            "guild_id": str(after.guild.id),
            "user_id": str(after.id),
            "changes": changes,
            "message": f"{after.display_name} updated: {', '.join(changes)}"
        }
        headers = {"bot-token": BOT_SECRET}
        try:
            response = requests.post(BACKEND_URL, json=payload, headers=headers, timeout=5)
            print(f"Sent member update to backend: {response.status_code} {response.text}")
        except Exception as e:
            print(f"Error sending member update to backend: {e}")

client.run(TOKEN)