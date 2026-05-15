"""
routers/feedback.py
-------------------
All API routes for feedback management and the dashboard.
Prefix : /api
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

import crud
from database import get_db
from schemas import (
    CategoryEnum,
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
    return crud.get_dashboard_stats(db)


# ─────────────────────────────────────────────────────────────
# SEARCH  (declared before /{feedback_id} to avoid route conflict)
# ─────────────────────────────────────────────────────────────

@router.get(
    "/feedback/search",
    response_model=SearchResponse,
    summary="Search and filter feedback",
    tags=["Feedback"],
)
def search_feedback(
    q:               Optional[str]          = Query(None),
    rating:          Optional[int]          = Query(None, ge=1, le=5),
    category:        Optional[CategoryEnum] = Query(None),
    program_name:    Optional[str]          = Query(None),
    trainer_name:    Optional[str]          = Query(None),
    would_recommend: Optional[bool]         = Query(None),
    db: Session = Depends(get_db),
):
    data  = crud.get_feedback_list(
        db, limit=500,
        keyword=q, rating=rating, category=category,
        program_name=program_name, trainer_name=trainer_name,
        would_recommend=would_recommend,
    )
    total = crud.count_feedback(
        db,
        keyword=q, rating=rating, category=category,
        program_name=program_name, trainer_name=trainer_name,
        would_recommend=would_recommend,
    )
    return SearchResponse(total=total, data=data)


# ─────────────────────────────────────────────────────────────
# FEEDBACK CRUD
# ─────────────────────────────────────────────────────────────

@router.get(
    "/feedback",
    response_model=FeedbackListResponse,
    summary="List all feedback with optional filters and pagination",
    tags=["Feedback"],
)
def list_feedback(
    skip:            int                    = Query(0,   ge=0),
    limit:           int                    = Query(10,  ge=1, le=100),
    keyword:         Optional[str]          = Query(None),
    rating:          Optional[int]          = Query(None, ge=1, le=5),
    category:        Optional[CategoryEnum] = Query(None),
    program_name:    Optional[str]          = Query(None),
    trainer_name:    Optional[str]          = Query(None),
    would_recommend: Optional[bool]         = Query(None),
    db: Session = Depends(get_db),
):
    data  = crud.get_feedback_list(
        db, skip=skip, limit=limit,
        keyword=keyword, rating=rating, category=category,
        program_name=program_name, trainer_name=trainer_name,
        would_recommend=would_recommend,
    )
    total = crud.count_feedback(
        db,
        keyword=keyword, rating=rating, category=category,
        program_name=program_name, trainer_name=trainer_name,
        would_recommend=would_recommend,
    )
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
    summary="Get a single feedback entry by ID",
    tags=["Feedback"],
)
def get_feedback(feedback_id: int, db: Session = Depends(get_db)):
    obj = crud.get_feedback_by_id(db, feedback_id)
    if obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback with id=" + str(feedback_id) + " not found.",
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
            detail="Feedback with id=" + str(feedback_id) + " not found.",
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
            detail="Feedback with id=" + str(feedback_id) + " not found.",
        )
    return {"message": "Feedback id=" + str(feedback_id) + " deleted successfully."}
