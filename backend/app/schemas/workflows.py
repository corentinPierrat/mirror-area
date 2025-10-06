from pydantic import BaseModel
from typing import List, Optional, Any

class WorkflowStepCreate(BaseModel):
    type: str
    service: str
    event: str
    params: Optional[dict] = None

class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    visibility: str = "private"
    steps: List[WorkflowStepCreate]

class WorkflowOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    visibility: str
    steps: List[WorkflowStepCreate]

    class Config:
        from_attributes = True