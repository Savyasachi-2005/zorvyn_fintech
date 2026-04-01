from fastapi import Depends, HTTPException, status

from dependencies.auth import get_current_user
from models.user import User, UserRole


class RoleChecker:
    def __init__(self, allowed_roles: list[UserRole]) -> None:
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user
