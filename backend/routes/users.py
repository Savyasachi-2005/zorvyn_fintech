from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.session import get_db
from dependencies.role_checker import RoleChecker
from models.user import UserRole
from schemas.user import UserPublic, UserRoleUpdate, UserStatusUpdate
from services.user_service import list_users, update_user_role, update_user_status

router = APIRouter(prefix="/users", tags=["Users"])
admin_only = RoleChecker([UserRole.ADMIN])


@router.get("", response_model=list[UserPublic], dependencies=[Depends(admin_only)])
def get_users(db: Session = Depends(get_db)):
    return list_users(db)


@router.put("/{user_id}/role", response_model=UserPublic, dependencies=[Depends(admin_only)])
def set_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
):
    return update_user_role(db, user_id, payload.role)


@router.put("/{user_id}/status", response_model=UserPublic, dependencies=[Depends(admin_only)])
def set_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
):
    return update_user_status(db, user_id, payload.is_active)
