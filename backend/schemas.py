"""
schemas.py
----------
Pydantic v2 schemas for request validation and response serialization.
"""

from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ─── Enums ───────────────────────────────────────────────────
class CategoryEnum(str, Enum):
    training = "Training"
    product  = "Product"
    event    = "Event"
    service  = "Service"
    other    = "Other"


# ─── Rating label helper ──────────────────────────────────────
RATING_LABELS: dict[int, str] = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
}


# ─── Request schemas ──────────────────────────────────────────
class FeedbackCreate(BaseModel):
    # Participant
    participant_name: str = Field(
        ..., min_length=1, max_length=255,
        examples=["Alice Johnson"],
    )
    email: Optional[EmailStr] = Field(
        default=None,
        examples=["alice.j@example.com"],
    )
    department: Optional[str] = Field(
        default=None, max_length=255,
        examples=["Engineering"],
    )

    # Program
    program_name: str = Field(
        ..., min_length=1, max_length=255,
        examples=["Python for Data Engineering"],
    )
    category: CategoryEnum = Field(
        default=CategoryEnum.training,
        examples=["Training"],
    )
    trainer_name: Optional[str] = Field(
        default=None, max_length=255,
        examples=["Dr. Ramesh Kumar"],
    )
    session_date: Optional[date] = Field(
        default=None,
        examples=["2025-07-01"],
    )

    # Feedback
    rating: int = Field(
        ..., ge=1, le=5,
        description="1 = Poor | 2 = Fair | 3 = Good | 4 = Very Good | 5 = Excellent",
    )
    comments: Optional[str] = Field(
        default=None, max_length=5000,
        examples=["Excellent hands-on training. Highly recommended!"],
    )
    would_recommend: bool = Field(
        default=True,
        description="Would the participant recommend this program?",
    )


class FeedbackUpdate(BaseModel):
    """All fields optional — only provided fields are updated."""

    participant_name: Optional[str]          = Field(None, min_length=1, max_length=255)
    email:            Optional[EmailStr]     = None
    department:       Optional[str]          = Field(None, max_length=255)
    program_name:     Optional[str]          = Field(None, min_length=1, max_length=255)
    category:         Optional[CategoryEnum] = None
    trainer_name:     Optional[str]          = Field(None, max_length=255)
    session_date:     Optional[date]         = None
    rating:           Optional[int]          = Field(None, ge=1, le=5)
    comments:         Optional[str]          = Field(None, max_length=5000)
    would_recommend:  Optional[bool]         = None


# ─── Response schemas ─────────────────────────────────────────
class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    feedback_id:      int
    participant_name: str
    email:            Optional[str]  = None
    department:       Optional[str]  = None
    program_name:     str
    category:         str
    trainer_name:     Optional[str]  = None
    session_date:     Optional[date] = None
    rating:           int
    rating_label:     str            = ""
    comments:         Optional[str]  = None
    would_recommend:  bool
    submitted_at:     datetime
    updated_at:       Optional[datetime] = None

    def model_post_init(self, __context) -> None:
        object.__setattr__(self, "rating_label", RATING_LABELS.get(self.rating, ""))


class FeedbackListResponse(BaseModel):
    total: int
    skip:  int
    limit: int
    data:  list[FeedbackResponse]


class SearchResponse(BaseModel):
    total: int
    data:  list[FeedbackResponse]


# ─── Dashboard schemas ────────────────────────────────────────
class TopProgram(BaseModel):
    program_name: str
    count:        int
    avg_rating:   float

class TopTrainer(BaseModel):
    trainer_name: str
    count:        int
    avg_rating:   float

class DashboardStats(BaseModel):
    total_feedback:        int
    average_rating:        float
    recommend_percentage:  float
    rating_distribution:   dict[str, int]
    category_distribution: dict[str, int]
    department_distribution: dict[str, int]
    top_programs:          list[TopProgram]
    top_trainers:          list[TopTrainer]
    recent_feedback:       list[FeedbackResponse]
