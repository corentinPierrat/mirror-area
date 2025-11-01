import discord
import requests
from app.config import settings

BACKEND_URL = "https://trigger.ink/actions/discord"

intents = discord.Intents.default()
intents.members = True
intents.message_content = True

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f"✅ Connected as {client.user}")

@client.event
async def on_member_join(member):
    payload = {
        "event": "member_join",
        "guild_id": str(member.guild.id),
        "user": {
            "id": str(member.id),
            "username": member.name,
            "display_name": member.display_name,
            "nickname": member.nick
        },
        "message": f"Welcome, {member.display_name}!"
    }
    headers = {"bot-token": settings.BOT_SECRET}
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
        "user": {
            "id": str(member.id),
            "username": member.name,
            "display_name": member.display_name,
            "nickname": member.nick
        },
        "message": f"Goodbye, {member.display_name}!"
    }
    headers = {"bot-token": settings.BOT_SECRET}
    try:
        response = requests.post(BACKEND_URL, json=payload, headers=headers, timeout=5)
        print(f"Sent event to backend: {response.status_code} {response.text}")
    except Exception as e:
        print(f"Error sending event to backend: {e}")

@client.event
async def on_member_update(before, after):
    change_records = []
    summary_parts = []

    if before.nick != after.nick:
        old_nick = before.nick or before.name
        new_nick = after.nick or after.name
        change_records.append({
            "type": "nickname",
            "old_value": old_nick,
            "new_value": new_nick
        })
        summary_parts.append(f"nickname: {old_nick} -> {new_nick}")

    if before.roles != after.roles:
        added_roles = sorted({role.name for role in set(after.roles) - set(before.roles)})
        removed_roles = sorted({role.name for role in set(before.roles) - set(after.roles)})

        if added_roles or removed_roles:
            change_records.append({
                "type": "roles",
                "added": added_roles,
                "removed": removed_roles
            })

            if added_roles:
                summary_parts.append(f"added roles: {added_roles}")
            if removed_roles:
                summary_parts.append(f"removed roles: {removed_roles}")

    if before.activity != after.activity:
        before_activity = before.activity.name if before.activity else "None"
        after_activity = after.activity.name if after.activity else "None"
        change_records.append({
            "type": "activity",
            "old_value": before_activity,
            "new_value": after_activity
        })
        summary_parts.append(f"activity: {before_activity} -> {after_activity}")

    if before.avatar != after.avatar:
        change_records.append({
            "type": "avatar",
            "changed": True
        })
        summary_parts.append("avatar changed")

    if before.name != after.name:
        change_records.append({
            "type": "username",
            "old_value": before.name,
            "new_value": after.name
        })
        summary_parts.append(f"username: {before.name} -> {after.name}")

    if before.timed_out_until != after.timed_out_until:
        change_records.append({
            "type": "timeout",
            "until": after.timed_out_until.isoformat() if after.timed_out_until else None
        })
        if after.timed_out_until:
            summary_parts.append(f"timed out until: {after.timed_out_until}")
        else:
            summary_parts.append("timeout removed")

    print("Detected member update:", change_records)
    if change_records:
        payload = {
            "event": "member_update",
            "guild_id": str(after.guild.id),
            "user": {
                "id": str(after.id),
                "username": after.name,
                "display_name": after.display_name
            },
            "changes": change_records
        }

        nickname_change = next((change for change in change_records if change["type"] == "nickname"), None)
        if nickname_change:
            payload["old_nick"] = nickname_change["old_value"]
            payload["new_nick"] = nickname_change["new_value"]

        if summary_parts:
            payload["message"] = ", ".join(summary_parts)

        headers = {"bot-token": settings.BOT_SECRET}
        try:
            response = requests.post(BACKEND_URL, json=payload, headers=headers, timeout=5)
            print(f"Sent member update to backend: {response.status_code} {response.text}")
        except Exception as e:
            print(f"Error sending member update to backend: {e}")

@client.event
async def on_message(message):
    if message.author.bot:
        return

    if client.user and client.user in message.mentions:
        payload = {
            "event": "bot_mention",
            "guild_id": str(message.guild.id) if message.guild else None,
            "channel_id": str(message.channel.id),
            "message_id": str(message.id),
            "author": {
                "id": str(message.author.id),
                "username": message.author.name,
                "display_name": message.author.display_name
            },
            "content": message.content,
            "created_at": message.created_at.isoformat()
        }
        headers = {"bot-token": settings.BOT_SECRET}
        try:
            response = requests.post(BACKEND_URL, json=payload, headers=headers, timeout=5)
            print(f"Sent bot mention to backend: {response.status_code} {response.text}")
        except Exception as e:
            print(f"Error sending bot mention to backend: {e}")

client.run(settings.TOKEN_BOT_DISCORD)
