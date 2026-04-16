import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Unit(Base):
    __tablename__ = "units"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    unit_type = Column(String, nullable=False, default="general")
    status = Column(String, nullable=False, default="not_started")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    tasks = relationship("UnitTask", back_populates="unit", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Unit {self.name} | {self.status}>"


class UnitTask(Base):
    __tablename__ = "unit_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False, default="general")
    is_default = Column(Boolean, default=True)
    added_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    unit = relationship("Unit", back_populates="tasks")
    completions = relationship("UnitTaskCompletion", back_populates="task", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<UnitTask {self.name} | unit={self.unit_id}>"