from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class AuditLogPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    action: str
    performed_by: int
    performed_by_name: Optional[str] = None
    target_user: Optional[int] = None
    target_user_name: Optional[str] = None
    record_id: Optional[int] = None
    timestamp: datetime
