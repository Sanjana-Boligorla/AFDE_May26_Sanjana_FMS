"""
schemas.py
----------
Pydantic v2 schemas for request validation and response serialization.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


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
    participant_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        examples=["Alice Johnson"],
    )
    program_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        examples=["Python for Data Engineering"],
    )
    rating: int = Field(
        ...,
        ge=1,
        le=5,
        description="Rating from 1 (Poor) to 5 (Excellent)",
    )
    comments: Optional[str] = Field(
        default=None,
        max_length=5000,
        examples=["Great course, very hands-on!"],
    )


class FeedbackUpdate(BaseModel):
    """All fields are optional — only provided fields are updated (PATCH semantics)."""

    participant_name: Optional[str] = Field(None, min_length=1, max_length=255)
    program_name:     Optional[str] = Field(None, min_length=1, max_length=255)
    rating:           Optional[int] = Field(None, ge=1, le=5)
    comments:         Optional[str] = Field(None, max_length=5000)


# ─── Response schemas ─────────────────────────────────────────
class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    feedback_id:      int
    participant_name: str
    program_name:     str
    rating:           int
    rating_label:     str = ""
    comments:         Optional[str] = None
    submitted_at:     datetime
    updated_at:       Optional[datetime] = None

    def model_post_init(self, __context) -> None:
        # Attach human-readable label after construction
        object.__setattr__(self, "rating_label", RATING_LABELS.get(self.rating, ""))


class FeedbackListResponse(BaseModel):
    total:  int
    skip:   int
    limit:  int
    data:   list[FeedbackResponse]


class SearchResponse(BaseModel):
    total: int
    data:  list[FeedbackResponse]


# ─── Dashboard schema ─────────────────────────────────────────
class RatingDistribution(BaseModel):
    one:   int = Field(alias="1")
    two:   int = Field(alias="2")
    three: int = Field(alias="3")
    four:  int = Field(alias="4")
    five:  int = Field(alias="5")

    model_config = ConfigDict(populate_by_name=True)


class DashboardStats(BaseModel):
    total_feedback:      int
    average_rating:      float
    rating_distribution: dict[str, int]
    recent_feedback:     list[FeedbackResponse]
