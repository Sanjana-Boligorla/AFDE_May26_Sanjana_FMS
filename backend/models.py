"""
models.py
---------
SQLAlchemy ORM model for the Feedback table.
"""

from sqlalchemy import Column, Integer, SmallInteger, String, Text, DateTime, func
from database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    feedback_id      = Column(Integer,      primary_key=True, index=True, autoincrement=True)
    participant_name = Column(String(255),  nullable=False)
    program_name     = Column(String(255),  nullable=False,   index=True)
    rating           = Column(SmallInteger, nullable=False)
    comments         = Column(Text,         nullable=True)
    submitted_at     = Column(DateTime,     nullable=False, server_default=func.now())
    updated_at       = Column(DateTime,     nullable=False, server_default=func.now(),
                              onupdate=func.now())

    def __repr__(self) -> str:
        return (
            f"<Feedback id={self.feedback_id} "
            f"participant='{self.participant_name}' "
            f"rating={self.rating}>"
        )
