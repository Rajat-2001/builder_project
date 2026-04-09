import uuid
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
import enum


class ProjectStatus(str, enum.Enum):
    planning    = "planning"
    in_progress = "in_progress"
    on_hold     = "on_hold"
    completed   = "completed"


class Project(Base):
    __tablename__ = "projects"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )

    # Project name e.g. "Smith Residence", "Tower Block A"
    name = Column(String, nullable=False)

    # Optional description
    description = Column(Text, nullable=True)

    # Overall project status
    status = Column(
        Enum(ProjectStatus),
        nullable=False,
        default=ProjectStatus.planning
    )

    # Overall completion percentage — 0 to 100
    # Admin or Team Lead updates this manually
    overall_progress = Column(
        Float,
        default=0.0,
        nullable=False
    )

    # The customer this project belongs to
    # Links to users table — customer must be a registered user
    customer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,    # project can exist without a customer assigned yet
        index=True
    )

    # Who is managing this project (admin or team lead)
    assigned_to = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Project timeline
    start_date = Column(String, nullable=True)    # "YYYY-MM-DD"
    end_date   = Column(String, nullable=True)    # estimated completion

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    customer          = relationship("User", foreign_keys=[customer_id], backref="projects_as_customer")
    assigned_user     = relationship("User", foreign_keys=[assigned_to], backref="projects_assigned")
    progress_sections = relationship("ProjectProgress", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project {self.name} | {self.status} | {self.overall_progress}%>"


class ProjectProgress(Base):
    """
    Tracks completion of individual sections within a project.
    e.g. Kitchen: 40%, Bathroom: 30%, Living Room: 60%
    Each row = one section of one project.
    These are what power the pie charts on the customer dashboard.
    """
    __tablename__ = "project_progress"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )

    # Which project this section belongs to
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Section name e.g. "Kitchen", "Master Bathroom", "Foundation"
    section_name = Column(String, nullable=False)

    # Completion percentage — 0 to 100
    percentage = Column(
        Float,
        default=0.0,
        nullable=False
    )

    # Optional notes about this section
    notes = Column(Text, nullable=True)

    # When this section was last updated
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationship back to project
    project = relationship("Project", back_populates="progress_sections")

    def __repr__(self):
        return f"<ProjectProgress {self.section_name} | {self.percentage}%>"