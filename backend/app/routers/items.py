"""Item listings: public browse/search + owner inventory management."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas, services
from ..auth import get_current_user, require_owner
from ..database import get_db

router = APIRouter(prefix="/api/items", tags=["items"])


def _to_card(db: Session, item: models.Item, start: date | None, end: date | None) -> schemas.ItemListOut:
    card = schemas.ItemListOut.model_validate(item)
    card.primary_image_url = services.primary_image_url(item)
    if start and end:
        card.remaining_available = services.remaining_quantity(db, item, start, end)
    return card


@router.get("", response_model=schemas.PaginatedItems)
def list_items(
    db: Session = Depends(get_db),
    q: str | None = Query(None, description="Keyword search on name/description"),
    category_id: str | None = None,
    city: str | None = None,
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    available_from: date | None = None,
    available_to: date | None = None,
    owner_id: str | None = None,
    status: str = models.ITEM_ACTIVE,
    sort: str = Query("newest", pattern="^(newest|price_asc|price_desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=60),
):
    query = select(models.Item).options(selectinload(models.Item.images))

    if status != "all":
        query = query.where(models.Item.status == status)
    if owner_id:
        query = query.where(models.Item.owner_id == owner_id)
    if category_id:
        query = query.where(models.Item.category_id == category_id)
    if city:
        query = query.where(models.Item.pickup_city.ilike(f"%{city}%"))
    if min_price is not None:
        query = query.where(models.Item.price_per_day >= min_price)
    if max_price is not None:
        query = query.where(models.Item.price_per_day <= max_price)
    if q:
        like = f"%{q}%"
        query = query.where(or_(models.Item.name.ilike(like), models.Item.description.ilike(like)))

    if sort == "price_asc":
        query = query.order_by(models.Item.price_per_day.asc())
    elif sort == "price_desc":
        query = query.order_by(models.Item.price_per_day.desc())
    else:
        query = query.order_by(models.Item.created_at.desc())

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.offset((page - 1) * page_size).limit(page_size)).all()

    cards = []
    for item in rows:
        card = _to_card(db, item, available_from, available_to)
        # Availability filter: drop fully-booked items when a date range is given.
        if available_from and available_to and card.remaining_available == 0:
            continue
        cards.append(card)

    pages = (total + page_size - 1) // page_size
    return schemas.PaginatedItems(
        items=cards, total=total, page=page, page_size=page_size, pages=pages
    )


@router.get("/{item_id}", response_model=schemas.ItemOut)
def get_item(item_id: str, db: Session = Depends(get_db)):
    item = (
        db.query(models.Item)
        .options(selectinload(models.Item.images))
        .filter(models.Item.id == item_id)
        .first()
    )
    if not item:
        raise HTTPException(404, "Item not found")
    return item


@router.get("/{item_id}/availability", response_model=schemas.AvailabilityCheck)
def check_availability(
    item_id: str,
    pickup_date: date,
    return_date: date,
    db: Session = Depends(get_db),
):
    item = db.get(models.Item, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    if return_date < pickup_date:
        raise HTTPException(400, "return_date must be on or after pickup_date")

    remaining = services.remaining_quantity(db, item, pickup_date, return_date)
    next_date = None
    if remaining == 0:
        next_date = services.next_available_date(db, item, pickup_date, return_date)
    return schemas.AvailabilityCheck(
        remaining=remaining, is_available=remaining > 0, next_available_date=next_date
    )


@router.post("", response_model=schemas.ItemOut, status_code=201)
def create_item(
    payload: schemas.ItemCreate,
    db: Session = Depends(get_db),
    owner: models.User = Depends(require_owner),
):
    if not db.get(models.Category, payload.category_id):
        raise HTTPException(400, "Invalid category_id")

    data = payload.model_dump(exclude={"images"})
    item = models.Item(owner_id=owner.id, **data)
    db.add(item)
    db.flush()

    for idx, img in enumerate(payload.images[: 20]):
        db.add(
            models.ItemImage(
                item_id=item.id,
                image_url=img.image_url,
                display_order=img.display_order or idx,
                is_primary=img.is_primary or idx == 0,
            )
        )
    db.commit()
    db.refresh(item)
    return item


def _owned_item(item_id: str, db: Session, owner: models.User) -> models.Item:
    item = db.get(models.Item, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    if item.owner_id != owner.id and owner.role != models.ROLE_ADMIN:
        raise HTTPException(403, "You do not own this item")
    return item


@router.patch("/{item_id}", response_model=schemas.ItemOut)
def update_item(
    item_id: str,
    payload: schemas.ItemUpdate,
    db: Session = Depends(get_db),
    owner: models.User = Depends(require_owner),
):
    item = _owned_item(item_id, db, owner)
    updates = payload.model_dump(exclude_unset=True)
    if "category_id" in updates and not db.get(models.Category, updates["category_id"]):
        raise HTTPException(400, "Invalid category_id")
    for key, value in updates.items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def delete_item(
    item_id: str,
    db: Session = Depends(get_db),
    owner: models.User = Depends(require_owner),
):
    item = _owned_item(item_id, db, owner)
    db.delete(item)
    db.commit()
