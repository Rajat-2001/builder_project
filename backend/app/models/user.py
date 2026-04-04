import uuid
from sqlalchemy import Column, String, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
from app.database import Base

import enum

# Python enum that mirrors the 3 roles in your system
# Using an enum (not a plain string) means the DB enforces
# only these 3 values — nothing else can be inserted
class UserRole(str, enum.Enum):
    admin     = "admin"
    team_lead = "team_lead"
    worker    = "worker"


class User(Base):
    __tablename__ = "users"

    # UUID primary key — much harder to enumerate than integer IDs
    # default generates a new UUID in Python before inserting
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )

    full_name = Column(String, nullable=False)

    # Phone is the login identifier — must be unique across all users
    phone = Column(String, nullable=False, unique=True, index=True)

    # Email is optional but unique if provided
    email = Column(String, nullable=True, unique=True, index=True)

    # Never store plain passwords — only the bcrypt hash goes here
    hashed_password = Column(String, nullable=False)

    # Role is enforced by the enum — DB rejects anything outside the 3 values
    role = Column(
        Enum(UserRole),
        nullable=False,
        default=UserRole.worker
    )

    # Automatically set to current UTC time when the row is created
    # timezone=True stores it as timestamptz in PostgreSQL (best practice)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def __repr__(self):
        return f"<User {self.full_name} | {self.role} | {self.phone}>"