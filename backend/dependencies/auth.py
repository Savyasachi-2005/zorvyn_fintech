from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from core.config import settings
from db.session import get_db
from models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_prefix}/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_error
    except JWTError as exc:
        raise credentials_error from exc

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise credentials_error
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive")

    return user
