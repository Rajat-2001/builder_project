from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.user import UserRole


# ─────────────────────────────────────────
# INVITE SCHEMAS
# ─────────────────────────────────────────

class InviteCreate(BaseModel):
    """
    What the admin sends to generate an invite link.
    Only needs a role — everything else (token, expiry) is auto-generated.
    """
    role: UserRole


class InviteValidateResponse(BaseModel):
    """
    What the backend returns when frontend checks a token.
    If valid, returns the role so the signup form can pre-fill it.
    """
    valid: bool
    role: Optional[UserRole] = None
    message: Optional[str] = None


# ─────────────────────────────────────────
# AUTH SCHEMAS
# ─────────────────────────────────────────

class RegisterRequest(BaseModel):
    """
    What the worker sends when filling out the signup form.
    Token ties this registration to a specific invite.
    """
    token: UUID
    full_name: str
    phone: str
    password: str
    email: Optional[EmailStr] = None


class LoginRequest(BaseModel):
    """
    What any user sends to log in.
    Phone is the identifier (not email) — workers may not have emails.
    """
    phone: str
    password: str


class TokenResponse(BaseModel):
    """
    What the backend returns after a successful login.
    Frontend stores this JWT in localStorage.
    """
    access_token: str
    token_type: str = "bearer"


# ─────────────────────────────────────────
# USER SCHEMAS
# ─────────────────────────────────────────

class UserResponse(BaseModel):
    """
    Safe public representation of a user.
    Never includes hashed_password — this is what /auth/me returns.
    """
    id: UUID
    full_name: str
    phone: str
    email: Optional[EmailStr] = None
    role: UserRole
    created_at: datetime

    # Tells Pydantic to read data from SQLAlchemy model attributes
    # not just from plain dictionaries
    model_config = {"from_attributes": True}