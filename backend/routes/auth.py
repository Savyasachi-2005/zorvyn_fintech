from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from db.session import get_db
from schemas.user import TokenResponse, UserPublic, UserRegister
from services.user_service import login_user, register_user

router = APIRouter(tags=["Auth"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    return register_user(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    token = login_user(db, form_data.username, form_data.password)
    return {"access_token": token, "token_type": "bearer"}
