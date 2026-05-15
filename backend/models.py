"""
models.py
---------
SQLAlchemy ORM model for the Feedback table.
"""

from sqlalchemy import (
    Boolean, Column, Date, DateTime, Enum as SAEnum,
    Integer, SmallInteger, String, Text, func
)
from database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    # ── Primary Key ───────────────────────────────────────────
    feedback_id      = Column(Integer,     primary_key=True, index=True, autoincrement=True)

    # ── Participant Details ───────────────────────────────────
    participant_name = Column(String(255), nullable=False)
    email            = Column(String(255), nullable=True,  index=True)
    department       = Column(String(255), nullable=True)

    # ── Program Details ───────────────────────────────────────
    program_name     = Column(String(255), nullable=False, index=True)
    category         = Column(
                           SAEnum("Training", "Product", "Event", "Service", "Other",
                                  name="category_enum"),
                           nullable=False,
                           default="Training",
                           index=True,
                       )
    trainer_name     = Column(String(255), nullable=True,  index=True)
    session_date     = Column(Date,        nullable=True)

    # ── Feedback Content ──────────────────────────────────────
    rating           = Column(SmallInteger, nullable=False)
    comments         = Column(Text,         nullable=True)
    would_recommend  = Column(Boolean,      nullable=False, default=True)

    # ── Timestamps ────────────────────────────────────────────
    submitted_at     = Column(DateTime, nullable=False, server_default=func.now())
    updated_at       = Column(DateTime, nullable=False, server_default=func.now(),
                              onupdate=func.now())

    def __repr__(self) -> str:
        return (
            f"<Feedback id={self.feedback_id} "
            f"participant='{self.participant_name}' "
            f"program='{self.program_name}' "
            f"rating={self.rating}>"
        )
