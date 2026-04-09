from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.attendance import Attendance
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/attendance", tags=["Attendance"])


# ─────────────────────────────────────────
# POST /attendance/clock-in
# Worker or Team Lead clocks in
# ─────────────────────────────────────────

@router.post("/clock-in", status_code=status.HTTP_201_CREATED)
def clock_in(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("worker", "team_lead"))
):
    """
    Creates a new attendance record for today.
    Prevents double clock-in — if user is already clocked in,
    returns an error instead of creating a duplicate record.
    """
    # Check if already clocked in (active shift exists)
    active = db.query(Attendance).filter(
        Attendance.user_id  == current_user.id,
        Attendance.is_active == True
    ).first()

    if active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already clocked in. Please clock out first."
        )

    now        = datetime.now(timezone.utc)
    shift_date = now.strftime("%Y-%m-%d")

    record = Attendance(
        user_id    = current_user.id,
        clock_in   = now,
        shift_date = shift_date,
        is_active  = True,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "message":    "Clocked in successfully.",
        "clock_in":   record.clock_in,
        "shift_date": record.shift_date,
        "record_id":  str(record.id),
    }


# ─────────────────────────────────────────
# POST /attendance/clock-out
# Worker or Team Lead clocks out
# ─────────────────────────────────────────

@router.post("/clock-out")
def clock_out(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("worker", "team_lead"))
):
    """
    Finds the active shift and closes it.
    Calculates total hours worked for the shift.
    Prevents clock-out if not clocked in.
    """
    # Find the active shift
    record = db.query(Attendance).filter(
        Attendance.user_id  == current_user.id,
        Attendance.is_active == True
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not clocked in."
        )

    now = datetime.now(timezone.utc)

    # Calculate total hours as a float
    # e.g. 8 hours 30 minutes = 8.5
    duration    = now - record.clock_in
    total_hours = round(duration.total_seconds() / 3600, 2)

    # Update the record
    record.clock_out   = now
    record.total_hours = total_hours
    record.is_active   = False

    db.commit()

    return {
        "message":     "Clocked out successfully.",
        "clock_in":    record.clock_in,
        "clock_out":   record.clock_out,
        "total_hours": total_hours,
        "shift_date":  record.shift_date,
    }


# ─────────────────────────────────────────
# GET /attendance/status
# Is the current user clocked in right now?
# ─────────────────────────────────────────

@router.get("/status")
def get_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("worker", "team_lead"))
):
    """
    Frontend calls this on dashboard load to know
    whether to show the Clock In or Clock Out button.
    """
    active = db.query(Attendance).filter(
        Attendance.user_id  == current_user.id,
        Attendance.is_active == True
    ).first()

    if active:
        # Calculate how long they've been clocked in so far
        now          = datetime.now(timezone.utc)
        duration     = now - active.clock_in
        hours_so_far = round(duration.total_seconds() / 3600, 2)

        return {
            "is_clocked_in": True,
            "clock_in":      active.clock_in,
            "shift_date":    active.shift_date,
            "hours_so_far":  hours_so_far,
            "record_id":     str(active.id),
        }

    return {"is_clocked_in": False}


# ─────────────────────────────────────────
# GET /attendance/history
# Current user's own attendance history
# ─────────────────────────────────────────

@router.get("/history")
def get_my_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("worker", "team_lead"))
):
    """
    Returns the logged-in user's full attendance history,
    newest first. Shows all past shifts with hours worked.
    """
    records = db.query(Attendance).filter(
        Attendance.user_id == current_user.id
    ).order_by(Attendance.clock_in.desc()).all()

    return [
        {
            "id":          str(r.id),
            "shift_date":  r.shift_date,
            "clock_in":    r.clock_in,
            "clock_out":   r.clock_out,
            "total_hours": r.total_hours,
            "is_active":   r.is_active,
        }
        for r in records
    ]


# ─────────────────────────────────────────
# GET /attendance/team
# Team lead sees their whole team's attendance
# ─────────────────────────────────────────

@router.get("/team")
def get_team_attendance(
    date: str = None,   # optional filter e.g. "2026-04-09"
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "team_lead"))
):
    """
    Returns attendance for all workers (and team leads).
    Admin sees everyone. Team lead sees workers only.
    Optional date filter — defaults to today if not provided.
    """
    # Default to today if no date given
    if not date:
        date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Base query — filter by date
    query = db.query(Attendance).filter(
        Attendance.shift_date == date
    )

    # If team lead — only show workers, not other team leads or admins
    if current_user.role == UserRole.team_lead:
        worker_ids = db.query(User.id).filter(
            User.role == UserRole.worker
        ).all()
        worker_ids = [w.id for w in worker_ids]
        query = query.filter(Attendance.user_id.in_(worker_ids))

    records = query.order_by(Attendance.clock_in.desc()).all()

    result = []
    for r in records:
        user = db.query(User).filter(User.id == r.user_id).first()
        result.append({
            "record_id":   str(r.id),
            "user_id":     str(r.user_id),
            "full_name":   user.full_name if user else "Unknown",
            "phone":       user.phone if user else "",
            "role":        user.role if user else "",
            "shift_date":  r.shift_date,
            "clock_in":    r.clock_in,
            "clock_out":   r.clock_out,
            "total_hours": r.total_hours,
            "is_active":   r.is_active,
        })

    return {
        "date":    date,
        "count":   len(result),
        "records": result,
    }


# ─────────────────────────────────────────
# GET /attendance/summary
# Current user's weekly/monthly summary
# ─────────────────────────────────────────

@router.get("/summary")
def get_my_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("worker", "team_lead"))
):
    """
    Returns total hours worked this week and this month.
    Shown as stats on the worker/team lead dashboard.
    """
    from sqlalchemy import func, extract
    now   = datetime.now(timezone.utc)
    month = now.strftime("%Y-%m")

    # All completed shifts this month
    monthly_records = db.query(Attendance).filter(
        Attendance.user_id    == current_user.id,
        Attendance.is_active  == False,
        Attendance.shift_date.like(f"{month}%")
    ).all()

    total_this_month = round(sum(r.total_hours or 0 for r in monthly_records), 2)
    days_this_month  = len(set(r.shift_date for r in monthly_records))

    # This week — simple: last 7 days
    from datetime import timedelta
    week_start = (now - timedelta(days=7)).strftime("%Y-%m-%d")
    weekly_records = [r for r in monthly_records if r.shift_date >= week_start]
    total_this_week = round(sum(r.total_hours or 0 for r in weekly_records), 2)

    return {
        "total_hours_this_week":  total_this_week,
        "total_hours_this_month": total_this_month,
        "days_present_this_month": days_this_month,
        "month": month,
    }