from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from db.session import get_db
from dependencies.auth import get_current_user
from models.record import RecordType
from models.user import User
from schemas.record import PaginatedRecords, RecordCreate, RecordPublic, RecordUpdate
from services.record_service import (
    create_record,
    list_records,
    soft_delete_record,
    update_record,
)

router = APIRouter(prefix="/records", tags=["Records"])


@router.post("", response_model=RecordPublic, status_code=status.HTTP_201_CREATED)
def create_new_record(
    payload: RecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_record(db, current_user, payload)


@router.get("", response_model=PaginatedRecords)
def get_records(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    record_type: RecordType | None = Query(default=None, alias="type"),
    category: str | None = Query(default=None),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = list_records(
        db=db,
        current_user=current_user,
        page=page,
        limit=limit,
        record_type=record_type,
        category=category,
        date_from=date_from,
        date_to=date_to,
        search=search,
    )
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "items": items,
    }


@router.put("/{record_id}", response_model=RecordPublic)
def edit_record(
    record_id: int,
    payload: RecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_record(db, current_user, record_id, payload)


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    soft_delete_record(db, current_user, record_id)
    return None
