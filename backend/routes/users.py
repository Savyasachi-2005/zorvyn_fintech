from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.session import get_db
from dependencies.auth import get_current_user
from dependencies.role_checker import RoleChecker
from models.user import User, UserRole
from schemas.user import UserPublic, UserRoleUpdate, UserStatusUpdate, UserUpdate, UserPasswordReset
from services.user_service import (
    list_users,
    update_user_role,
    update_user_status,
    update_user_details,
    reset_user_password,
)

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
    current_user: User = Depends(get_current_user),
):
    return update_user_role(db, user_id, payload.role, performed_by=current_user.id)


@router.put("/{user_id}/status", response_model=UserPublic, dependencies=[Depends(admin_only)])
def set_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_user_status(db, user_id, payload.is_active, performed_by=current_user.id)


@router.put("/{user_id}", response_model=UserPublic, dependencies=[Depends(admin_only)])
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
):
    return update_user_details(db, user_id, payload)


@router.put("/{user_id}/password", response_model=UserPublic, dependencies=[Depends(admin_only)])
def reset_password(
    user_id: int,
    payload: UserPasswordReset,
    db: Session = Depends(get_db),
):
    return reset_user_password(db, user_id, payload.password)
