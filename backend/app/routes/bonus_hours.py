from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.models.bonus_hours import BonusHours
from app.models.work_session import WorkSession

router = APIRouter(prefix="/bonus", tags=["Bonus Hours"])


# ─────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────

class BonusHoursCreate(BaseModel):
    user_id: UUID
    project_id: Optional[UUID] = None
    hours: float
    reason: Optional[str] = None


# ─────────────────────────────────────────
# ADD BONUS HOURS — admin only
# ─────────────────────────────────────────

@router.post("/add")
def add_bonus_hours(
    body: BonusHoursCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    user = db.query(User).filter(User.id == body.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if body.hours <= 0:
        raise HTTPException(status_code=400, detail="Hours must be greater than 0")

    bonus = BonusHours(
        user_id=body.user_id,
        project_id=body.project_id,
        hours=body.hours,
        reason=body.reason,
        added_by=current_user.id,
    )
    db.add(bonus)
    db.commit()
    db.refresh(bonus)
    return {
        "message": f"Bonus of {body.hours}h added to {user.full_name}",
        "bonus_id": bonus.id,
        "user": user.full_name,
        "hours": bonus.hours,
        "reason": bonus.reason,
    }


# ─────────────────────────────────────────
# GET BONUS HOURS FOR A USER — admin only
# ─────────────────────────────────────────

@router.get("/user/{user_id}")
def get_user_bonus(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    bonuses = db.query(BonusHours).filter(
        BonusHours.user_id == user_id
    ).order_by(BonusHours.created_at.desc()).all()

    total = sum(b.hours for b in bonuses)
    return {
        "user_id": user_id,
        "total_bonus_hours": round(total, 2),
        "entries": [
            {
                "id": b.id,
                "hours": b.hours,
                "reason": b.reason,
                "project_id": b.project_id,
                "created_at": b.created_at,
            }
            for b in bonuses
        ]
    }


# ─────────────────────────────────────────
# GET MY BONUS HOURS — any logged in user
# ─────────────────────────────────────────

@router.get("/mine")
def get_my_bonus(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bonuses = db.query(BonusHours).filter(
        BonusHours.user_id == current_user.id
    ).order_by(BonusHours.created_at.desc()).all()

    total = sum(b.hours for b in bonuses)
    return {
        "total_bonus_hours": round(total, 2),
        "entries": [
            {
                "id": b.id,
                "hours": b.hours,
                "reason": b.reason,
                "project_id": b.project_id,
                "created_at": b.created_at,
            }
            for b in bonuses
        ]
    }


# ─────────────────────────────────────────
# FULL HOURS SUMMARY PER USER — admin only
# includes real hours + bonus hours combined
# ─────────────────────────────────────────

@router.get("/summary/all")
def full_hours_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    users = db.query(User).filter(
        User.role.in_(["worker", "team_lead", "supervisor", "architect"])
    ).all()

    result = []
    for user in users:
        real_hours = db.query(
            func.sum(WorkSession.total_hours)
        ).filter(
            and_(
                WorkSession.user_id == user.id,
                WorkSession.total_hours.isnot(None),
            )
        ).scalar() or 0

        bonus = db.query(
            func.sum(BonusHours.hours)
        ).filter(
            BonusHours.user_id == user.id
        ).scalar() or 0

        result.append({
            "user_id": user.id,
            "full_name": user.full_name,
            "role": user.role,
            "real_hours": round(real_hours, 2),
            "bonus_hours": round(bonus, 2),
            "total_hours": round(real_hours + bonus, 2),
        })

    return result


# ─────────────────────────────────────────
# DELETE BONUS ENTRY — admin only
# ─────────────────────────────────────────

@router.delete("/{bonus_id}")
def delete_bonus(
    bonus_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    bonus = db.query(BonusHours).filter(BonusHours.id == bonus_id).first()
    if not bonus:
        raise HTTPException(status_code=404, detail="Bonus entry not found")
    db.delete(bonus)
    db.commit()
    return {"message": "Bonus entry deleted"}