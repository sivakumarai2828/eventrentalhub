"""Explicit availability windows for an item (owner-managed)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import require_owner
from ..database import get_db

router = APIRouter(prefix="/api/items/{item_id}/availability-windows", tags=["availability"])


def _owned_item(item_id: str, db: Session, owner: models.User) -> models.Item:
    item = db.get(models.Item, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    if item.owner_id != owner.id and owner.role != models.ROLE_ADMIN:
        raise HTTPException(403, "You do not own this item")
    return item


@router.get("", response_model=list[schemas.AvailabilityOut])
def list_windows(item_id: str, db: Session = Depends(get_db)):
    return (
        db.query(models.Availability)
        .filter(models.Availability.item_id == item_id)
        .order_by(models.Availability.available_from)
        .all()
    )


@router.post("", response_model=schemas.AvailabilityOut, status_code=201)
def add_window(
    item_id: str,
    payload: schemas.AvailabilityCreate,
    db: Session = Depends(get_db),
    owner: models.User = Depends(require_owner),
):
    _owned_item(item_id, db, owner)
    if payload.available_to < payload.available_from:
        raise HTTPException(400, "available_to must be on or after available_from")
    window = models.Availability(item_id=item_id, **payload.model_dump())
    db.add(window)
    db.commit()
    db.refresh(window)
    return window


@router.delete("/{window_id}", status_code=204)
def delete_window(
    item_id: str,
    window_id: str,
    db: Session = Depends(get_db),
    owner: models.User = Depends(require_owner),
):
    _owned_item(item_id, db, owner)
    window = db.get(models.Availability, window_id)
    if not window or window.item_id != item_id:
        raise HTTPException(404, "Window not found")
    db.delete(window)
    db.commit()
