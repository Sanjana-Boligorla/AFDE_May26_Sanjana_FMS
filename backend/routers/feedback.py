"""
routers/feedback.py
-------------------
All API routes for feedback management and the dashboard.
Prefix  : /api
Tags    : Feedback, Dashboard
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

import crud
from database import get_db
from schemas import (
    DashboardStats,
    FeedbackCreate,
    FeedbackListResponse,
    FeedbackResponse,
    FeedbackUpdate,
    SearchResponse,
)

router = APIRouter()


# ─────────────────────────────────────────────────────────────
# DASHBOARD
# ─────────────────────────────────────────────────────────────

@router.get(
    "/dashboard/stats",
    response_model=DashboardStats,
    summary="Get dashboard statistics",
    tags=["Dashboard"],
)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Returns aggregated statistics:
    - Total feedback count
    - Average rating (rounded to 2 d.p.)
    - Rating distribution (count per star level)
    - 5 most recent feedback entries
    """
    return crud.get_dashboard_stats(db)


# ─────────────────────────────────────────────────────────────
# SEARCH  (must be declared BEFORE /{feedback_id} to avoid conflict)
# ─────────────────────────────────────────────────────────────

@router.get(
    "/feedback/search",
    response_model=SearchResponse,
    summary="Search and filter feedback",
    tags=["Feedback"],
)
def search_feedback(
    q:            Optional[str] = Query(None, description="Keyword to search across name, program and comments"),
    rating:       Optional[int] = Query(None, ge=1, le=5, description="Filter by exact rating"),
    program_name: Optional[str] = Query(None, description="Filter by program name (partial match)"),
    db: Session = Depends(get_db),
):
    """Dedicated search endpoint — supports keyword + rating + program_name filters."""
    data  = crud.get_feedback_list(db, keyword=q, rating=rating, program_name=program_name, limit=200)
    total = crud.count_feedback(db, keyword=q, rating=rating, program_name=program_name)
    return SearchResponse(total=total, data=data)


# ─────────────────────────────────────────────────────────────
# FEEDBACK CRUD
# ─────────────────────────────────────────────────────────────

@router.get(
    "/feedback",
    response_model=FeedbackListResponse,
    summary="List all feedback with optional filters",
    tags=["Feedback"],
)
def list_feedback(
    skip:         int           = Query(0,    ge=0,  description="Pagination offset"),
    limit:        int           = Query(10,   ge=1, le=100, description="Records per page"),
    keyword:      Optional[str] = Query(None, description="Keyword search"),
    rating:       Optional[int] = Query(None, ge=1, le=5,  description="Filter by rating"),
    program_name: Optional[str] = Query(None, description="Filter by program name"),
    db: Session = Depends(get_db),
):
    data  = crud.get_feedback_list(db, skip=skip, limit=limit,
                                   keyword=keyword, rating=rating, program_name=program_name)
    total = crud.count_feedback(db, keyword=keyword, rating=rating, program_name=program_name)
    return FeedbackListResponse(total=total, skip=skip, limit=limit, data=data)


@router.post(
    "/feedback",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit new feedback",
    tags=["Feedback"],
)
def create_feedback(payload: FeedbackCreate, db: Session = Depends(get_db)):
    return crud.create_feedback(db, payload)


@router.get(
    "/feedback/{feedback_id}",
    response_model=FeedbackResponse,
    summary="Get a single feedback entry",
    tags=["Feedback"],
)
def get_feedback(feedback_id: int, db: Session = Depends(get_db)):
    obj = crud.get_feedback_by_id(db, feedback_id)
    if obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feedback with id={feedback_id} not found.",
        )
    return obj


@router.put(
    "/feedback/{feedback_id}",
    response_model=FeedbackResponse,
    summary="Update a feedback entry",
    tags=["Feedback"],
)
def update_feedback(
    feedback_id: int,
    payload: FeedbackUpdate,
    db: Session = Depends(get_db),
):
    obj = crud.update_feedback(db, feedback_id, payload)
    if obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feedback with id={feedback_id} not found.",
        )
    return obj


@router.delete(
    "/feedback/{feedback_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a feedback entry",
    tags=["Feedback"],
)
def delete_feedback(feedback_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_feedback(db, feedback_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feedback with id={feedback_id} not found.",
        )
    return {"message": f"Feedback id={feedback_id} deleted successfully."}
