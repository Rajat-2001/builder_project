from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, timezone, date

from app.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.work_session import WorkSession, WorkSessionUnit, UnitTaskCompletion
from app.models.unit import Unit, UnitTask

router = APIRouter(prefix="/sessions", tags=["Work Sessions"])


# ─────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────

class ClockInBody(BaseModel):
    project_id: UUID

class ClockOutBody(BaseModel):
    unit_ids: list[UUID] = []

class TaskTickBody(BaseModel):
    unit_task_id: UUID
    note: Optional[str] = None

class WorkReportSubmit(BaseModel):
    unit_ids: list[UUID]
    task_completions: list[TaskTickBody] = []


# ─────────────────────────────────────────
# CLOCK IN
# ─────────────────────────────────────────

@router.post("/clock-in")
def clock_in(
    body: ClockInBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("worker", "team_lead", "supervisor")),
):
    # Check not already clocked in
    active = db.query(WorkSession).filter(
        and_(
            WorkSession.user_id == current_user.id,
            WorkSession.is_active == True,
        )
    ).first()
    if active:
        raise HTTPException(
            status_code=400,
            detail="Already clocked in. Clock out first before starting a new session."
        )

    session = WorkSession(
        user_id=current_user.id,
        project_id=body.project_id,
        clock_in=datetime.now(timezone.utc),
        session_date=date.today(),
        is_active=True,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {
        "message": "Clocked in successfully",
        "session_id": session.id,
        "project_id": session.project_id,
        "clock_in": session.clock_in,
    }


# ─────────────────────────────────────────
# CLOCK OUT
# ─────────────────────────────────────────

@router.post("/clock-out")
def clock_out(
    body: ClockOutBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("worker", "team_lead", "supervisor")),
):
    session = db.query(WorkSession).filter(
        and_(
            WorkSession.user_id == current_user.id,
            WorkSession.is_active == True,
        )
    ).first()
    if not session:
        raise HTTPException(status_code=400, detail="No active session found.")

    now = datetime.now(timezone.utc)
    delta = now - session.clock_in
    total_hours = round(delta.total_seconds() / 3600, 2)

    session.clock_out = now
    session.total_hours = total_hours
    session.is_active = False

    # Save which units were worked on
    for unit_id in body.unit_ids:
        wsu = WorkSessionUnit(
            session_id=session.id,
            unit_id=unit_id,
        )
        db.add(wsu)

    db.commit()
    db.refresh(session)
    return {
        "message": "Clocked out successfully",
        "session_id": session.id,
        "project_id": session.project_id,
        "clock_in": session.clock_in,
        "clock_out": session.clock_out,
        "total_hours": total_hours,
    }


# ─────────────────────────────────────────
# CURRENT SESSION STATUS
# ─────────────────────────────────────────

@router.get("/status")
def session_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(WorkSession).filter(
        and_(
            WorkSession.user_id == current_user.id,
            WorkSession.is_active == True,
        )
    ).first()
    if not session:
        return {"clocked_in": False}
    return {
        "clocked_in": True,
        "session_id": session.id,
        "project_id": session.project_id,
        "clock_in": session.clock_in,
    }


# ─────────────────────────────────────────
# SUBMIT WORK REPORT (during or end of shift)
# ─────────────────────────────────────────

@router.post("/submit-report")
def submit_report(
    body: WorkReportSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("worker", "team_lead", "supervisor")),
):
    session = db.query(WorkSession).filter(
        and_(
            WorkSession.user_id == current_user.id,
            WorkSession.is_active == True,
        )
    ).first()
    if not session:
        raise HTTPException(status_code=400, detail="No active session. Clock in first.")

    # Save units worked on
    existing_unit_ids = {
        wsu.unit_id for wsu in
        db.query(WorkSessionUnit).filter(WorkSessionUnit.session_id == session.id).all()
    }
    for unit_id in body.unit_ids:
        if unit_id not in existing_unit_ids:
            db.add(WorkSessionUnit(session_id=session.id, unit_id=unit_id))

    # Save task completions
    existing_task_ids = {
        tc.unit_task_id for tc in
        db.query(UnitTaskCompletion).filter(UnitTaskCompletion.session_id == session.id).all()
    }
    for tick in body.task_completions:
        if tick.unit_task_id not in existing_task_ids:
            db.add(UnitTaskCompletion(
                session_id=session.id,
                unit_task_id=tick.unit_task_id,
                worker_id=current_user.id,
                note=tick.note,
                completed_at=datetime.now(timezone.utc),
            ))

    db.commit()
    return {"message": "Work report submitted successfully"}


# ─────────────────────────────────────────
# MY SESSION HISTORY
# ─────────────────────────────────────────

@router.get("/my-history")
def my_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = db.query(WorkSession).filter(
        WorkSession.user_id == current_user.id
    ).order_by(WorkSession.session_date.desc()).all()

    result = []
    for s in sessions:
        units = db.query(WorkSessionUnit).filter(
            WorkSessionUnit.session_id == s.id
        ).all()
        unit_names = []
        for wsu in units:
            unit = db.query(Unit).filter(Unit.id == wsu.unit_id).first()
            if unit:
                unit_names.append(unit.name)
        result.append({
            "session_id": s.id,
            "project_id": s.project_id,
            "session_date": s.session_date,
            "clock_in": s.clock_in,
            "clock_out": s.clock_out,
            "total_hours": s.total_hours,
            "units_worked": unit_names,
        })
    return result


# ─────────────────────────────────────────
# MY HOURS SUMMARY PER PROJECT
# ─────────────────────────────────────────

@router.get("/my-summary")
def my_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = db.query(
        WorkSession.project_id,
        func.sum(WorkSession.total_hours).label("total_hours"),
        func.count(WorkSession.id).label("session_count"),
    ).filter(
        and_(
            WorkSession.user_id == current_user.id,
            WorkSession.total_hours.isnot(None),
        )
    ).group_by(WorkSession.project_id).all()

    return [
        {
            "project_id": r.project_id,
            "total_hours": round(r.total_hours or 0, 2),
            "session_count": r.session_count,
        }
        for r in rows
    ]


# ─────────────────────────────────────────
# TEAM LEAD — see submitted reports for their project
# ─────────────────────────────────────────

@router.get("/team-reports/{project_id}")
def team_reports(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "architect", "supervisor", "team_lead")),
):
    sessions = db.query(WorkSession).filter(
            WorkSession.project_id == project_id,
            WorkSession.user_id != current_user.id,
        ).order_by(WorkSession.session_date.desc()).all()

    result = []
    for s in sessions:
        worker = db.query(User).filter(User.id == s.user_id).first()
        units = db.query(WorkSessionUnit).filter(
            WorkSessionUnit.session_id == s.id
        ).all()
        unit_names = []
        for wsu in units:
            unit = db.query(Unit).filter(Unit.id == wsu.unit_id).first()
            if unit:
                unit_names.append({"id": str(unit.id), "name": unit.name})

        completions = db.query(UnitTaskCompletion).filter(
            UnitTaskCompletion.session_id == s.id
        ).all()
        tasks_done = []
        for tc in completions:
            task = db.query(UnitTask).filter(UnitTask.id == tc.unit_task_id).first()
            if task:
                tasks_done.append({
                    "task": task.name,
                    "category": task.category,
                    "note": tc.note,
                    "completed_at": tc.completed_at,
                })

        result.append({
            "session_id": s.id,
            "worker": worker.full_name if worker else "Unknown",
            "worker_role": worker.role if worker else "unknown",
            "worker_id": s.user_id,
            "session_date": s.session_date,
            "clock_in": s.clock_in,
            "clock_out": s.clock_out,
            "total_hours": s.total_hours,
            "units_worked": unit_names,
            "tasks_completed": tasks_done,
        })
    return result