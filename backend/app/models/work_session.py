import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, Date, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, date
from app.database import Base


class WorkSession(Base):
    __tablename__ = "work_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    clock_in = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    clock_out = Column(DateTime(timezone=True), nullable=True)
    total_hours = Column(Float, nullable=True)
    session_date = Column(Date, nullable=False, default=date.today)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    session_units = relationship("WorkSessionUnit", back_populates="session", cascade="all, delete-orphan")
    task_completions = relationship("UnitTaskCompletion", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<WorkSession user={self.user_id} project={self.project_id} active={self.is_active}>"


class WorkSessionUnit(Base):
    __tablename__ = "work_session_units"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("work_sessions.id", ondelete="CASCADE"), nullable=False)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id", ondelete="CASCADE"), nullable=False)

    session = relationship("WorkSession", back_populates="session_units")


class UnitTaskCompletion(Base):
    __tablename__ = "unit_task_completions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("work_sessions.id", ondelete="CASCADE"), nullable=False)
    unit_task_id = Column(UUID(as_uuid=True), ForeignKey("unit_tasks.id", ondelete="CASCADE"), nullable=False)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    note = Column(Text, nullable=True)
    completed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    session = relationship("WorkSession", back_populates="task_completions")
    task = relationship("UnitTask", back_populates="completions")

    def __repr__(self):
        return f"<UnitTaskCompletion worker={self.worker_id} task={self.unit_task_id}>"