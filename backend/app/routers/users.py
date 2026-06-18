"""Current-user profile sync endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(prefix="/api", tags=["auth"])


@router.get("/me", response_model=schemas.UserOut)
def read_me(current: models.User = Depends(get_current_user)):
    return current


@router.put("/me", response_model=schemas.UserOut)
def update_me(
    payload: schemas.UserUpsert,
    current: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sync profile fields from the client after sign-up / profile edit.

    Role can only be elevated to ``owner`` here (self-service). Promotion to
    ``admin`` is reserved for the admin endpoints.
    """
    current.name = payload.name or current.name
    current.phone = payload.phone if payload.phone is not None else current.phone
    if payload.email:
        current.email = payload.email
    if payload.role in (models.ROLE_CUSTOMER, models.ROLE_OWNER):
        current.role = payload.role
    db.commit()
    db.refresh(current)
    return current
