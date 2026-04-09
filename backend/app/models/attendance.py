import uuid
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )

    # Who clocked in — links to the users table
    # ondelete CASCADE means if user is deleted, their attendance is too
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True       # indexed for fast lookup by user
    )

    # Clock in time — set automatically when row is created
    clock_in = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Clock out time — NULL means they're currently clocked in
    # This is how we know if someone is actively on shift right now
    clock_out = Column(
        DateTime(timezone=True),
        nullable=True      # NULL = still clocked in
    )

    # Total hours for this shift — calculated on clock out
    # Stored as float e.g. 8.5 = 8 hours 30 minutes
    total_hours = Column(
        Float,
        nullable=True      # NULL until clocked out
    )

    # Date of the shift — stored separately for easy filtering
    # "show me all attendance for April 9th" is a simple date query
    shift_date = Column(
        String,            # stored as "YYYY-MM-DD" string
        nullable=False,
        index=True
    )

    # Is this an active shift right now?
    # True = clocked in, False = clocked out
    # Redundant with clock_out being NULL but makes queries cleaner
    is_active = Column(
        Boolean,
        default=True,
        nullable=False
    )

    # Relationship — lets you do attendance.user to get the User object
    user = relationship("User", backref="attendance_records")

    def __repr__(self):
        return f"<Attendance user={self.user_id} date={self.shift_date} active={self.is_active}>"