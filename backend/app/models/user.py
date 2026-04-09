import uuid
from sqlalchemy import Column, String, Enum, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    admin     = "admin"
    team_lead = "team_lead"
    worker    = "worker"
    architect = "architect"
    customer  = "customer"


class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )

    full_name = Column(String, nullable=False)

    # Phone is the login identifier
    phone = Column(String, nullable=False, unique=True, index=True)

    email = Column(String, nullable=True, unique=True, index=True)

    hashed_password = Column(String, nullable=False)

    role = Column(
        Enum(UserRole),
        nullable=False,
        default=UserRole.worker
    )

    # ── NEW in Phase 2 ──
    # False = deactivated, user cannot log in
    # Admin controls this via PATCH /admin/users/{id}/deactivate
    is_active = Column(
        Boolean,
        default=True,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def __repr__(self):
        return f"<User {self.full_name} | {self.role} | active={self.is_active}>"