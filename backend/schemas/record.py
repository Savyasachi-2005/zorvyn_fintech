from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from models.record import RecordType


class RecordBase(BaseModel):
    amount: Decimal = Field(gt=0)
    type: RecordType
    category: str = Field(min_length=1, max_length=100)
    date: date
    notes: Optional[str] = Field(default=None, max_length=2000)


class RecordCreate(RecordBase):
    pass


class RecordUpdate(BaseModel):
    amount: Optional[Decimal] = Field(default=None, gt=0)
    type: Optional[RecordType] = None
    category: Optional[str] = Field(default=None, min_length=1, max_length=100)
    date: Optional[date] = None
    notes: Optional[str] = Field(default=None, max_length=2000)


class RecordPublic(RecordBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    user_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_deleted: bool


class PaginatedRecords(BaseModel):
    page: int
    limit: int
    total: int
    items: list[RecordPublic]
