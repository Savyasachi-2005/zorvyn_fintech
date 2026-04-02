from sqlalchemy import func
from sqlalchemy.orm import Session

from models.record import Record, RecordType
from models.user import User, UserRole


def _dashboard_query(db: Session, current_user: User):
    query = db.query(Record).filter(Record.is_deleted.is_(False))
    if current_user.role == UserRole.VIEWER:
        query = query.filter(Record.user_id == current_user.id)
    return query


def get_summary(db: Session, current_user: User) -> dict:
    query = _dashboard_query(db, current_user)

    income = (
        query.filter(Record.type == RecordType.INCOME)
        .with_entities(func.coalesce(func.sum(Record.amount), 0))
        .scalar()
    )
    expense = (
        query.filter(Record.type == RecordType.EXPENSE)
        .with_entities(func.coalesce(func.sum(Record.amount), 0))
        .scalar()
    )

    result = {
        "total_income": float(income),
        "total_expense": float(expense),
        "balance": float(income - expense),
    }

    if current_user.role == UserRole.ADMIN:
        result["total_users"] = db.query(User).count()
        result["active_users"] = db.query(User).filter(User.is_active == True).count()

    return result


def get_category_breakdown(db: Session, current_user: User) -> list[dict]:
    query = _dashboard_query(db, current_user)

    rows = (
        query.with_entities(
            Record.category,
            func.coalesce(func.sum(Record.amount), 0).label("total"),
        )
        .group_by(Record.category)
        .order_by(func.sum(Record.amount).desc())
        .all()
    )

    return [{"category": row.category, "total": float(row.total)} for row in rows]


def get_trends(db: Session, current_user: User) -> list[dict]:
    query = _dashboard_query(db, current_user)

    rows = (
        query.with_entities(
            func.date_trunc("month", Record.date).label("month"),
            Record.type,
            func.coalesce(func.sum(Record.amount), 0).label("total"),
        )
        .group_by(func.date_trunc("month", Record.date), Record.type)
        .order_by(func.date_trunc("month", Record.date).asc())
        .all()
    )

    return [
        {
            "month": row.month.strftime("%Y-%m"),
            "type": row.type.value,
            "total": float(row.total),
        }
        for row in rows
    ]
