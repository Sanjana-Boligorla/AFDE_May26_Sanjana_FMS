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
def _apply_filters(query, keyword, rating, category, program_name, trainer_name, would_recommend):
    """Apply all optional filters to a query — reused by list and count functions."""
    if keyword:
        pattern = f"%{keyword}%"
        query = query.filter(
            or_(
                Feedback.participant_name.ilike(pattern),
                Feedback.email.ilike(pattern),
                Feedback.department.ilike(pattern),
                Feedback.program_name.ilike(pattern),
                Feedback.trainer_name.ilike(pattern),
                Feedback.comments.ilike(pattern),
            )
        )
    if rating is not None:
        query = query.filter(Feedback.rating == rating)
    if category:
        query = query.filter(Feedback.category == category)
    if program_name:
        query = query.filter(Feedback.program_name.ilike(f"%{program_name}%"))
    if trainer_name:
        query = query.filter(Feedback.trainer_name.ilike(f"%{trainer_name}%"))
    if would_recommend is not None:
        query = query.filter(Feedback.would_recommend == would_recommend)
    return query


def get_feedback_list(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    keyword: Optional[str] = None,
    rating: Optional[int] = None,
    category: Optional[str] = None,
    program_name: Optional[str] = None,
    trainer_name: Optional[str] = None,
    would_recommend: Optional[bool] = None,
) -> list[Feedback]:
    query = db.query(Feedback)
    query = _apply_filters(query, keyword, rating, category, program_name, trainer_name, would_recommend)
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
    category: Optional[str] = None,
    program_name: Optional[str] = None,
    trainer_name: Optional[str] = None,
    would_recommend: Optional[bool] = None,
) -> int:
    query = db.query(func.count(Feedback.feedback_id))
    query = _apply_filters(query, keyword, rating, category, program_name, trainer_name, would_recommend)
    return query.scalar() or 0


# ─── UPDATE ──────────────────────────────────────────────────
def update_feedback(
    db: Session,
    feedback_id: int,
    payload: FeedbackUpdate,
) -> Optional[Feedback]:
    """Partially update a feedback record. Returns None if not found."""
    db_obj = get_feedback_by_id(db, feedback_id)
    if db_obj is None:
        return None

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(db_obj, field, value)

    db.commit()
    db.refresh(db_obj)
    return db_obj


# ─── DELETE ──────────────────────────────────────────────────
def delete_feedback(db: Session, feedback_id: int) -> bool:
    """Delete a feedback record. Returns True on success, False if not found."""
    db_obj = get_feedback_by_id(db, feedback_id)
    if db_obj is None:
        return False
    db.delete(db_obj)
    db.commit()
    return True


# ─── DASHBOARD STATS ─────────────────────────────────────────
def get_dashboard_stats(db: Session) -> dict:
    """
    Aggregated statistics for the dashboard:
    - total_feedback
    - average_rating
    - recommend_percentage
    - rating_distribution  (count per star 1–5)
    - category_distribution (count per category)
    - recent_feedback (latest 5 entries)
    """
    total     = db.query(func.count(Feedback.feedback_id)).scalar() or 0
    avg_raw   = db.query(func.avg(Feedback.rating)).scalar()
    avg_rating = round(float(avg_raw), 2) if avg_raw is not None else 0.0

    # Recommendation rate
    recommend_count = (
        db.query(func.count(Feedback.feedback_id))
        .filter(Feedback.would_recommend == True)   # noqa: E712
        .scalar()
        or 0
    )
    recommend_pct = round((recommend_count / total * 100), 1) if total > 0 else 0.0

    # Rating distribution
    rating_dist: dict[str, int] = {}
    for i in range(1, 6):
        cnt = (
            db.query(func.count(Feedback.feedback_id))
            .filter(Feedback.rating == i)
            .scalar()
            or 0
        )
        rating_dist[str(i)] = cnt

    # Category distribution
    category_rows = (
        db.query(Feedback.category, func.count(Feedback.feedback_id))
        .group_by(Feedback.category)
        .all()
    )
    category_dist: dict[str, int] = {row[0]: row[1] for row in category_rows}

    # Department distribution
    dept_rows = (
        db.query(Feedback.department, func.count(Feedback.feedback_id))
        .filter(Feedback.department.isnot(None))
        .group_by(Feedback.department)
        .order_by(desc(func.count(Feedback.feedback_id)))
        .all()
    )
    dept_dist: dict[str, int] = {row[0]: row[1] for row in dept_rows}

    # Top 5 programs by feedback count + avg rating
    program_rows = (
        db.query(
            Feedback.program_name,
            func.count(Feedback.feedback_id).label("count"),
            func.avg(Feedback.rating).label("avg_rating"),
        )
        .group_by(Feedback.program_name)
        .order_by(desc("count"))
        .limit(5)
        .all()
    )
    top_programs = [
        {"program_name": r[0], "count": r[1], "avg_rating": round(float(r[2]), 1)}
        for r in program_rows
    ]

    # Top 5 trainers by avg rating (min 1 feedback)
    trainer_rows = (
        db.query(
            Feedback.trainer_name,
            func.count(Feedback.feedback_id).label("count"),
            func.avg(Feedback.rating).label("avg_rating"),
        )
        .filter(Feedback.trainer_name.isnot(None))
        .group_by(Feedback.trainer_name)
        .order_by(desc("avg_rating"))
        .limit(5)
        .all()
    )
    top_trainers = [
        {"trainer_name": r[0], "count": r[1], "avg_rating": round(float(r[2]), 1)}
        for r in trainer_rows
    ]

    # Recent 5 entries
    recent = (
        db.query(Feedback)
        .order_by(desc(Feedback.submitted_at))
        .limit(5)
        .all()
    )

    return {
        "total_feedback":          total,
        "average_rating":          avg_rating,
        "recommend_percentage":    recommend_pct,
        "rating_distribution":     rating_dist,
        "category_distribution":   category_dist,
        "department_distribution": dept_dist,
        "top_programs":            top_programs,
        "top_trainers":            top_trainers,
        "recent_feedback":         recent,
    }
