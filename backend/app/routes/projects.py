from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.project import Project, ProjectProgress
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/projects", tags=["Projects"])


# ─────────────────────────────────────────
# GET /projects/my
# Customer sees their own project(s)
# ─────────────────────────────────────────

@router.get("/my")
def get_my_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("customer"))
):
    """
    Returns all projects assigned to the logged-in customer.
    Each project includes its progress sections for pie charts.
    This is the only endpoint a customer ever needs.
    """
    projects = db.query(Project).filter(
        Project.customer_id == current_user.id
    ).order_by(Project.created_at.desc()).all()

    if not projects:
        return {
            "message":  "No projects assigned yet. Contact your project manager.",
            "projects": []
        }

    result = []
    for p in projects:

        # Build sections list for pie chart
        sections = [
            {
                "section_name": s.section_name,
                "percentage":   s.percentage,
                "notes":        s.notes,
                "updated_at":   s.updated_at,
            }
            for s in p.progress_sections
        ]

        # Calculate remaining percentage for display
        # e.g. if kitchen is 40% done, remaining = 60%
        sections_with_remaining = [
            {
                **s,
                "remaining": round(100 - s["percentage"], 1)
            }
            for s in sections
        ]

        result.append({
            "id":               str(p.id),
            "name":             p.name,
            "description":      p.description,
            "status":           p.status,
            "overall_progress": p.overall_progress,
            "start_date":       p.start_date,
            "end_date":         p.end_date,
            "sections":         sections_with_remaining,
            "updated_at":       p.updated_at,
        })

    return {"projects": result}


# ─────────────────────────────────────────
# GET /projects/{project_id}
# Single project detail — customer or admin/team lead
# ─────────────────────────────────────────

@router.get("/{project_id}")
def get_project_detail(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns full detail of a single project.
    Customers can only see their own project.
    Admin and team leads can see any project.
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    # Customers can only access their own project
    if current_user.role == "customer":
        if str(project.customer_id) != str(current_user.id):
            raise HTTPException(
                status_code=403,
                detail="You don't have access to this project."
            )

    sections = [
        {
            "id":           str(s.id),
            "section_name": s.section_name,
            "percentage":   s.percentage,
            "remaining":    round(100 - s.percentage, 1),
            "notes":        s.notes,
            "updated_at":   s.updated_at,
        }
        for s in project.progress_sections
    ]

    # Get assigned user name if exists
    assigned_user = None
    if project.assigned_to:
        u = db.query(User).filter(User.id == project.assigned_to).first()
        assigned_user = u.full_name if u else None

    return {
        "id":               str(project.id),
        "name":             project.name,
        "description":      project.description,
        "status":           project.status,
        "overall_progress": project.overall_progress,
        "start_date":       project.start_date,
        "end_date":         project.end_date,
        "assigned_to":      assigned_user,
        "sections":         sections,
        "updated_at":       project.updated_at,
    }


# ─────────────────────────────────────────
# GET /projects
# Admin and team leads see all projects
# ─────────────────────────────────────────

@router.get("/")
def get_all_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "team_lead"))
):
    """
    Admin and team leads see all projects in the system.
    Used in their management dashboards.
    """
    projects = db.query(Project).order_by(Project.created_at.desc()).all()

    return [
        {
            "id":               str(p.id),
            "name":             p.name,
            "status":           p.status,
            "overall_progress": p.overall_progress,
            "customer_id":      str(p.customer_id) if p.customer_id else None,
            "start_date":       p.start_date,
            "end_date":         p.end_date,
            "section_count":    len(p.progress_sections),
            "updated_at":       p.updated_at,
        }
        for p in projects
    ]