import uuid
from sqlalchemy import Column, String, Enum, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone, timedelta
from app.database import Base
from app.models.user import UserRole


class Invite(Base):
    __tablename__ = "invites"

    # UUID primary key — same reasoning as User model
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )

    # This is the actual token that goes into the invite link
    # yoursite.com/join?token=<this value>
    # Indexed so validation lookups are fast
    token = Column(
        UUID(as_uuid=True),
        default=uuid.uuid4,
        nullable=False,
        unique=True,
        index=True
    )

    # The role that will be assigned to whoever uses this invite
    # Admin pre-decides: "this link is for a team_lead" or "this link is for a worker"
    role = Column(
        Enum(UserRole),
        nullable=False,
        default=UserRole.worker
    )

    # Set to 48 hours from creation time automatically
    # After this, the token is dead even if unused
    expires_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc) + timedelta(hours=48),
        nullable=False
    )

    # Flips to True the moment someone registers with this token
    # Single-use enforced here — a used token can never be used again
    used = Column(
        Boolean,
        default=False,
        nullable=False
    )

    # When the admin generated this invite
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def __repr__(self):
        return f"<Invite token={self.token} role={self.role} used={self.used}>"