from app.database import SessionLocal
from app.models.models import Workflow, WorkflowStep

db = SessionLocal()

# Replace with the target user ID
user_id = 6

# Parameters for the Discord action (update guild_id as needed)
discord_action_params = {
    "guild_id": "851867116343918603"
}


# Create the workflow
workflow = Workflow(
    user_id=user_id,
    name="Discord join -> Tweet",
)
db.add(workflow)
db.commit()
db.refresh(workflow)

# Step 1: Discord action
action_step = WorkflowStep(
    workflow_id=workflow.id,
    type="action",
    service="discord",
    event="member_join",
    params=discord_action_params,
    step_order=1
)
db.add(action_step)

# Step 2: Twitter reaction
reaction_step = WorkflowStep(
    workflow_id=workflow.id,
    type="reaction",
    service="twitter",
    event="tweet",
    params={},
    step_order=2
)
db.add(reaction_step)

db.commit()
print(f"Workflow created with id={workflow.id}")

db.close()
