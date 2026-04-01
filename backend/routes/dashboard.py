from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.session import get_db
from dependencies.auth import get_current_user
from dependencies.role_checker import RoleChecker
from models.user import User, UserRole
from services.dashboard_service import (
    get_category_breakdown,
    get_summary,
    get_trends,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
analytics_roles = RoleChecker([UserRole.ANALYST, UserRole.ADMIN])


@router.get("/summary", dependencies=[Depends(analytics_roles)])
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_summary(db, current_user)


@router.get("/category", dependencies=[Depends(analytics_roles)])
def dashboard_category(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_category_breakdown(db, current_user)


@router.get("/trends", dependencies=[Depends(analytics_roles)])
def dashboard_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_trends(db, current_user)
