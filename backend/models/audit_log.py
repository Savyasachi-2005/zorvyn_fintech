from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from models.user import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(255), nullable=False)
    performed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_user = Column(Integer, ForeignKey("users.id"), nullable=True)
    record_id = Column(Integer, nullable=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)

    performer = relationship(
        "User", foreign_keys=[performed_by], lazy="joined"
    )
    target = relationship(
        "User", foreign_keys=[target_user], lazy="joined"
    )
