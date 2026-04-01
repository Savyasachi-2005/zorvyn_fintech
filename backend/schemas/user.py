from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from models.user import UserRole


class UserRegister(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserRoleUpdate(BaseModel):
    role: UserRole


class UserStatusUpdate(BaseModel):
    is_active: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
