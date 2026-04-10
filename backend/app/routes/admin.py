from uuid import UUID
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.models.user import User, UserRole
from app.models.invite import Invite
from app.models.project import Project, ProjectProgress, ProjectStatus
from app.core.security import require_role, hash_password

router = APIRouter(prefix="/admin", tags=["Admin"])


# ─────────────────────────────────────────
# SCHEMAS (defined here to keep it simple)
# ─────────────────────────────────────────

class InviteCreate(BaseModel):
    role: UserRole

class UserCreateDirect(BaseModel):
    """Admin creates a user directly — no invite flow needed"""
    full_name: str
    phone: str
    password: str
    role: UserRole
    email: Optional[EmailStr] = None

class DeactivateUser(BaseModel):
    is_active: bool   # True = activate, False = deactivate

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    customer_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    overall_progress: Optional[float] = None
    assigned_to: Optional[UUID] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class SectionCreate(BaseModel):
    section_name: str
    percentage: float = 0.0
    notes: Optional[str] = None

class SectionUpdate(BaseModel):
    percentage: Optional[float] = None
    notes: Optional[str] = None


# ─────────────────────────────────────────
# USER MANAGEMENT
# ─────────────────────────────────────────

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """
    Returns all users in the system.
    Admin sees everyone — name, phone, role, status, join date.
    """
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id":         str(u.id),
            "full_name":  u.full_name,
            "phone":      u.phone,
            "email":      u.email,
            "role":       u.role,
            "is_active":  u.is_active,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_user_direct(
    data: UserCreateDirect,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """
    Admin creates a user directly — no invite link needed.
    Admin sets the credentials, then shares them with the user.
    This is the Phase 2 flow replacing the invite-only system.
    """
    # Check phone uniqueness
    if db.query(User).filter(User.phone == data.phone).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this phone number already exists."
        )

    # Check email uniqueness
    if data.email:
        if db.query(User).filter(User.email == data.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists."
            )

    new_user = User(
        full_name       = data.full_name,
        phone           = data.phone,
        email           = data.email,
        hashed_password = hash_password(data.password),
        role            = data.role,
        is_active       = True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message":  "User created successfully.",
        "user_id":  str(new_user.id),
        "phone":    new_user.phone,
        "role":     new_user.role,
    }


@router.patch("/users/{user_id}/deactivate")
def toggle_user_active(
    user_id: UUID,
    data: DeactivateUser,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """
    Activate or deactivate a user account.
    Deactivated users cannot log in.
    Admin cannot deactivate themselves.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Prevent admin from locking themselves out
    if str(user.id) == str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account."
        )

    user.is_active = data.is_active
    db.commit()

    action = "activated" if data.is_active else "deactivated"
    return {"message": f"User {user.full_name} has been {action}."}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Permanently delete a user and all their records."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if str(user.id) == str(current_user.id):
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account."
        )

    db.delete(user)
    db.commit()
    return {"message": f"User {user.full_name} permanently deleted."}


# ─────────────────────────────────────────
# INVITE MANAGEMENT
# ─────────────────────────────────────────

@router.post("/invites", status_code=status.HTTP_201_CREATED)
def create_invite(
    data: InviteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Generate an invite link for a given role."""
    invite = Invite(role=data.role)
    db.add(invite)
    db.commit()
    db.refresh(invite)

    return {
        "invite_link": f"yoursite.com/join?token={invite.token}",
        "token":       str(invite.token),
        "role":        invite.role,
        "expires_at":  invite.expires_at,
    }


@router.get("/invites")
def get_all_invites(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Returns all invites — used, unused, expired."""
    invites = db.query(Invite).order_by(Invite.created_at.desc()).all()
    now = datetime.now(timezone.utc)
    return [
        {
            "id":         str(i.id),
            "token":      str(i.token),
            "role":       i.role,
            "used":       i.used,
            "expired":    i.expires_at < now,
            "expires_at": i.expires_at,
            "created_at": i.created_at,
        }
        for i in invites
    ]


# ─────────────────────────────────────────
# PROJECT MANAGEMENT
# ─────────────────────────────────────────

@router.get("/projects")
def get_all_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Returns all projects with their progress sections."""
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    return [
        {
            "id":               str(p.id),
            "name":             p.name,
            "description":      p.description,
            "status":           p.status,
            "overall_progress": p.overall_progress,
            "start_date":       p.start_date,
            "end_date":         p.end_date,
            "customer_id":      str(p.customer_id) if p.customer_id else None,
            "assigned_to":      str(p.assigned_to) if p.assigned_to else None,
            "sections": [
                {
                    "id":           str(s.id),
                    "section_name": s.section_name,
                    "percentage":   s.percentage,
                    "notes":        s.notes,
                    "updated_at":   s.updated_at,
                }
                for s in p.progress_sections
            ],
            "created_at": p.created_at,
        }
        for p in projects
    ]


@router.post("/projects", status_code=status.HTTP_201_CREATED)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Create a new project and optionally assign to a customer."""
    project = Project(
        name         = data.name,
        description  = data.description,
        customer_id  = data.customer_id,
        assigned_to  = data.assigned_to,
        start_date   = data.start_date,
        end_date     = data.end_date,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return {"message": "Project created.", "project_id": str(project.id)}


@router.patch("/projects/{project_id}")
def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "team_lead"))
):
    """Update project details or overall progress."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    # Only update fields that were actually sent
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(project, field, value)

    db.commit()
    return {"message": "Project updated."}


@router.post("/projects/{project_id}/sections", status_code=status.HTTP_201_CREATED)
def add_section(
    project_id: UUID,
    data: SectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "team_lead"))
):
    """Add a progress section to a project (e.g. Kitchen, Bathroom)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    section = ProjectProgress(
        project_id   = project_id,
        section_name = data.section_name,
        percentage   = data.percentage,
        notes        = data.notes,
    )
    db.add(section)
    db.commit()
    return {"message": f"Section '{data.section_name}' added."}


@router.patch("/projects/{project_id}/sections/{section_id}")
def update_section(
    project_id: UUID,
    section_id: UUID,
    data: SectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "team_lead"))
):
    """Update the percentage or notes of a section."""
    section = db.query(ProjectProgress).filter(
        ProjectProgress.id == section_id,
        ProjectProgress.project_id == project_id
    ).first()

    if not section:
        raise HTTPException(status_code=404, detail="Section not found.")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(section, field, value)

    db.commit()
    return {"message": f"Section '{section.section_name}' updated to {section.percentage}%."}


# ─────────────────────────────────────────
# GET /admin/hours
# Returns total hours this month for every user
# ─────────────────────────────────────────

@router.get("/hours")
def get_all_hours(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """
    Returns a dict of user_id → total hours this month.
    Admin dashboard merges this with the users list.
    Only counts completed shifts (is_active = False).
    """
    from app.models.attendance import Attendance

    month = datetime.now(timezone.utc).strftime("%Y-%m")

    records = db.query(Attendance).filter(
        Attendance.is_active  == False,
        Attendance.shift_date.like(f"{month}%")
    ).all()

    # Sum hours per user
    hours_map = {}
    for r in records:
        uid = str(r.user_id)
        hours_map[uid] = round(hours_map.get(uid, 0) + (r.total_hours or 0), 2)

    return hours_map