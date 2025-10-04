from pydantic import BaseModel, EmailStr, constr
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: constr(min_length=8, max_length=72)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class VerificationResponse(BaseModel):
    email: EmailStr
    code: str

class UserInfo(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    is_verified: bool
    profile_image_url: Optional[str] = None

    class Config:
        from_attributes = True

class ResendVerificationRequest(BaseModel):
    email: EmailStr

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: constr(min_length=8, max_length=72)