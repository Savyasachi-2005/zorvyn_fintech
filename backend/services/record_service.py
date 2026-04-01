from datetime import date

from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from models.record import Record, RecordType
from models.user import User, UserRole
from schemas.record import RecordCreate, RecordUpdate


def create_record(db: Session, current_user: User, payload: RecordCreate) -> Record:
    record = Record(
        amount=payload.amount,
        type=payload.type,
        category=payload.category,
        date=payload.date,
        notes=payload.notes,
        user_id=current_user.id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_records(
    db: Session,
    current_user: User,
    page: int,
    limit: int,
    record_type: RecordType | None = None,
    category: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    search: str | None = None,
) -> tuple[list[Record], int]:
    query = db.query(Record).filter(Record.is_deleted.is_(False))

    if current_user.role == UserRole.VIEWER:
        query = query.filter(Record.user_id == current_user.id)

    if record_type:
        query = query.filter(Record.type == record_type)

    if category:
        query = query.filter(Record.category.ilike(f"%{category}%"))

    if date_from:
        query = query.filter(Record.date >= date_from)

    if date_to:
        query = query.filter(Record.date <= date_to)

    if search:
        query = query.filter(
            or_(
                Record.category.ilike(f"%{search}%"),
                Record.notes.ilike(f"%{search}%"),
            )
        )

    total = query.count()
    offset = (page - 1) * limit

    items = (
        query.order_by(Record.date.desc(), Record.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total


def get_record_or_404(db: Session, record_id: int) -> Record:
    record = db.query(Record).filter(Record.id == record_id, Record.is_deleted.is_(False)).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


def update_record(
    db: Session,
    current_user: User,
    record_id: int,
    payload: RecordUpdate,
) -> Record:
    record = get_record_or_404(db, record_id)

    if current_user.role != UserRole.ADMIN and record.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to modify this record")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return record


def soft_delete_record(db: Session, current_user: User, record_id: int) -> None:
    record = get_record_or_404(db, record_id)

    if current_user.role != UserRole.ADMIN and record.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to delete this record")

    record.is_deleted = True
    db.commit()
