from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class WorkflowStepCreate(BaseModel):
    client_id: Optional[str] = None
    type: str
    service: str
    event: str
    params: Optional[dict] = None
    links: Optional[Dict[str, Dict[str, Any]]] = None

class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    visibility: str = "private"
    active: bool = True
    steps: List[WorkflowStepCreate]

class WorkflowOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    visibility: str
    active: bool
    steps: List[WorkflowStepCreate]

    class Config:
        from_attributes = True
