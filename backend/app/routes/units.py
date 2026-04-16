from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, timezone

from app.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.unit import Unit, UnitTask

router = APIRouter(prefix="/units", tags=["Units"])

# ─────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────

class UnitCreate(BaseModel):
    name: str
    unit_type: str = "general"
    notes: Optional[str] = None

class UnitStatusUpdate(BaseModel):
    status: str  # not_started | in_progress | done | issue

class UnitTaskCreate(BaseModel):
    name: str
    category: str = "general"

class UnitOut(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    unit_type: str
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UnitTaskOut(BaseModel):
    id: UUID
    unit_id: UUID
    name: str
    category: str
    is_default: bool
    added_by: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────
# DEFAULT TASKS — seeded on unit creation
# ─────────────────────────────────────────

DEFAULT_TASKS = [
    ("Concrete work",       "structural"),
    ("Masonry",             "structural"),
    ("Scaffolding",         "structural"),
    ("Plumbing",            "utilities"),
    ("Electrical",          "utilities"),
    ("Heating",             "utilities"),
    ("Solar",               "utilities"),
    ("Ventilation",         "utilities"),
    ("Plastering",          "finishing"),
    ("Screed/flooring",     "finishing"),
    ("Tiling",              "finishing"),
    ("Carpentry",           "finishing"),
    ("Window installation", "finishing"),
    ("Joinery",             "finishing"),
    ("Drylining",           "finishing"),
    ("Painting",            "finishing"),
    ("Smart Home / KNX",    "special"),
    ("Exterior works",      "special"),
    ("Lightning protection","special"),
    ("Fencing",             "special"),
    ("Final cleaning",      "special"),
    ("Inspection / docs",   "special"),
]


def seed_default_tasks(unit_id: UUID, db: Session):
    for name, category in DEFAULT_TASKS:
        task = UnitTask(
            unit_id=unit_id,
            name=name,
            category=category,
            is_default=True,
            added_by=None,
        )
        db.add(task)
    db.commit()


# ─────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────

# Get all units for a project
@router.get("/project/{project_id}")
def get_units(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    units = db.query(Unit).filter(Unit.project_id == project_id).all()
    return units


# Get single unit with its tasks
@router.get("/{unit_id}")
def get_unit(
    unit_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    tasks = db.query(UnitTask).filter(UnitTask.unit_id == unit_id).all()
    return {"unit": unit, "tasks": tasks}


# Create a unit (admin or architect)
@router.post("/project/{project_id}")
def create_unit(
    project_id: UUID,
    body: UnitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "architect")),
):
    unit = Unit(
        project_id=project_id,
        name=body.name,
        unit_type=body.unit_type,
        notes=body.notes,
        status="not_started",
    )
    db.add(unit)
    db.flush()
    seed_default_tasks(unit.id, db)
    db.refresh(unit)
    return unit


# Bulk create units for a project (admin or architect)
@router.post("/project/{project_id}/bulk")
def bulk_create_units(
    project_id: UUID,
    units: list[UnitCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "architect")),
):
    created = []
    for u in units:
        unit = Unit(
            project_id=project_id,
            name=u.name,
            unit_type=u.unit_type,
            notes=u.notes,
            status="not_started",
        )
        db.add(unit)
        db.flush()
        seed_default_tasks(unit.id, db)
        created.append(unit.name)
    db.commit()
    return {"created": len(created), "units": created}


# Update unit status (team_lead, supervisor, architect, admin)
@router.patch("/{unit_id}/status")
def update_unit_status(
    unit_id: UUID,
    body: UnitStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "architect", "supervisor", "team_lead")),
):
    valid = {"not_started", "in_progress", "done", "issue"}
    if body.status not in valid:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid}")

    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    unit.status = body.status
    unit.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(unit)
    return unit


# Add custom task to a unit (team_lead, supervisor, architect, admin)
@router.post("/{unit_id}/tasks")
def add_unit_task(
    unit_id: UUID,
    body: UnitTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "architect", "supervisor", "team_lead")),
):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    task = UnitTask(
        unit_id=unit_id,
        name=body.name,
        category=body.category,
        is_default=False,
        added_by=current_user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


# Delete a custom task (team_lead and above only, cannot delete defaults)
@router.delete("/tasks/{task_id}")
def delete_unit_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "architect", "supervisor", "team_lead")),
):
    task = db.query(UnitTask).filter(UnitTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.is_default:
        raise HTTPException(status_code=403, detail="Cannot delete default tasks")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}