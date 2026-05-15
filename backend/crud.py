"""
crud.py
-------
Database operations (Create, Read, Update, Delete) for the Feedback model.
All functions are synchronous and accept a SQLAlchemy Session.
"""

from __future__ import annotations

from typing import Optional

from sqlalchemy import func, or_, desc
from sqlalchemy.orm import Session

from models import Feedback
from schemas import FeedbackCreate, FeedbackUpdate


# ─── CREATE ──────────────────────────────────────────────────
def create_feedback(db: Session, payload: FeedbackCreate) -> Feedback:
    """Insert a new feedback record and return the persisted object."""
    db_obj = Feedback(**payload.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


# ─── READ (single) ───────────────────────────────────────────
def get_feedback_by_id(db: Session, feedback_id: int) -> Optional[Feedback]:
    """Fetch a single feedback record by primary key."""
    return (
        db.query(Feedback)
        .filter(Feedback.feedback_id == feedback_id)
        .first()
    )


# ─── READ (list with filters) ────────────────────────────────
def get_feedback_list(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    keyword: Optional[str] = None,
    rating: Optional[int] = None,
    program_name: Optional[str] = None,
) -> list[Feedback]:
    """
    Fetch paginated feedback records with optional filters:
    - keyword  : partial match against participant_name, program_name, comments
    - rating   : exact match
    - program_name: partial match against program_name
    """
    query = db.query(Feedback)

    if keyword:
        pattern = f"%{keyword}%"
        query = query.filter(
            or_(
                Feedback.participant_name.ilike(pattern),
                Feedback.program_name.ilike(pattern),
                Feedback.comments.ilike(pattern),
            )
        )

    if rating is not None:
        query = query.filter(Feedback.rating == rating)

    if program_name:
        query = query.filter(Feedback.program_name.ilike(f"%{program_name}%"))

    return (
        query.order_by(desc(Feedback.submitted_at))
        .offset(skip)
        .limit(limit)
        .all()
    )


def count_feedback(
    db: Session,
    keyword: Optional[str] = None,
    rating: Optional[int] = None,
    program_name: Optional[str] = None,
) -> int:
    """Return the total number of records matching the given filters."""
    query = db.query(func.count(Feedback.feedback_id))

    if keyword:
        pattern = f"%{keyword}%"
        query = query.filter(
            or_(
                Feedback.participant_name.ilike(pattern),
                Feedback.program_name.ilike(pattern),
                Feedback.comments.ilike(pattern),
            )
        )

    if rating is not None:
        query = query.filter(Feedback.rating == rating)

    if program_name:
        query = query.filter(Feedback.program_name.ilike(f"%{program_name}%"))

    return query.scalar() or 0


# ─── UPDATE ──────────────────────────────────────────────────
def update_feedback(
    db: Session,
    feedback_id: int,
    payload: FeedbackUpdate,
) -> Optional[Feedback]:
    """
    Update only the fields provided in the payload (partial update).
    Returns None if the record does not exist.
    """
    db_obj = get_feedback_by_id(db, feedback_id)
    if db_obj is None:
        return None

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)

    db.commit()
    db.refresh(db_obj)
    return db_obj


# ─── DELETE ──────────────────────────────────────────────────
def delete_feedback(db: Session, feedback_id: int) -> bool:
    """
    Delete a feedback record.
    Returns True on success, False if the record was not found.
    """
    db_obj = get_feedback_by_id(db, feedback_id)
    if db_obj is None:
        return False

    db.delete(db_obj)
    db.commit()
    return True


# ─── DASHBOARD STATS ─────────────────────────────────────────
def get_dashboard_stats(db: Session) -> dict:
    """
    Aggregate statistics for the dashboard:
    - total_feedback
    - average_rating  (rounded to 2 decimal places)
    - rating_distribution  (count per rating 1–5)
    - recent_feedback  (latest 5 entries)
    """
    total = db.query(func.count(Feedback.feedback_id)).scalar() or 0
    avg   = db.query(func.avg(Feedback.rating)).scalar()
    avg_rating = round(float(avg), 2) if avg is not None else 0.0

    distribution: dict[str, int] = {}
    for i in range(1, 6):
        cnt = (
            db.query(func.count(Feedback.feedback_id))
            .filter(Feedback.rating == i)
            .scalar()
            or 0
        )
        distribution[str(i)] = cnt

    recent = (
        db.query(Feedback)
        .order_by(desc(Feedback.submitted_at))
        .limit(5)
        .all()
    )

    return {
        "total_feedback":      total,
        "average_rating":      avg_rating,
        "rating_distribution": distribution,
        "recent_feedback":     recent,
    }
