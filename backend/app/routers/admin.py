"""Admin-only management endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas
from ..auth import require_admin
from ..database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/bookings", response_model=list[schemas.BookingRequestOut])
def admin_list_bookings(
    status: str | None = None,
    db: Session = Depends(get_db),
):
    """Every booking request across all owners (admin oversight)."""
    from .bookings import _serialize

    query = db.query(models.BookingRequest).options(
        selectinload(models.BookingRequest.items).selectinload(models.BookingItem.item)
    )
    if status:
        query = query.filter(models.BookingRequest.status == status)
    reqs = query.order_by(models.BookingRequest.created_at.desc()).all()
    return [_serialize(db, r) for r in reqs]


@router.get("/users", response_model=list[schemas.UserOut])
def list_users(
    q: str | None = None,
    role: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.User)
    if role:
        query = query.filter(models.User.role == role)
    if q:
        like = f"%{q}%"
        query = query.filter(models.User.email.ilike(like) | models.User.name.ilike(like))
    return query.order_by(models.User.created_at.desc()).all()


@router.patch("/users/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: str,
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    updates = payload.model_dump(exclude_unset=True)
    if "role" in updates and updates["role"] not in models.ROLES:
        raise HTTPException(400, "Invalid role")
    for key, value in updates.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    db.delete(user)
    db.commit()


@router.get("/items", response_model=schemas.PaginatedItems)
def moderate_items(
    db: Session = Depends(get_db),
    status: str = "all",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    from sqlalchemy import func, select

    query = select(models.Item).options(selectinload(models.Item.images))
    if status != "all":
        query = query.where(models.Item.status == status)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(
        query.order_by(models.Item.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()

    from ..services import primary_image_url

    cards = []
    for item in rows:
        card = schemas.ItemListOut.model_validate(item)
        card.primary_image_url = primary_image_url(item)
        cards.append(card)
    pages = (total + page_size - 1) // page_size
    return schemas.PaginatedItems(
        items=cards, total=total, page=page, page_size=page_size, pages=pages
    )


@router.patch("/items/{item_id}/status", response_model=schemas.ItemOut)
def set_item_status(
    item_id: str,
    status: str = Query(..., pattern="^(active|inactive)$"),
    db: Session = Depends(get_db),
):
    item = db.get(models.Item, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    item.status = status
    db.commit()
    db.refresh(item)
    return item
