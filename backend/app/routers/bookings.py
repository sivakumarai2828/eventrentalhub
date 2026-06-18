"""Booking request flow: customers submit, owners approve/reject."""
from collections import defaultdict
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from .. import email_service, models, schemas, services
from ..auth import get_current_user, get_optional_user
from ..database import get_db

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

VALID_TRANSITIONS = {
    models.BOOKING_PENDING: {models.BOOKING_APPROVED, models.BOOKING_REJECTED},
    models.BOOKING_APPROVED: {models.BOOKING_COMPLETED, models.BOOKING_REJECTED},
    models.BOOKING_REJECTED: set(),
    models.BOOKING_COMPLETED: set(),
}


def _serialize(db: Session, req: models.BookingRequest) -> schemas.BookingRequestOut:
    out = schemas.BookingRequestOut.model_validate(req)
    lines: list[tuple[Decimal, int]] = []
    for bi, line in zip(req.items, out.items):
        if bi.item:
            line.item = services_card(db, bi.item)
        lines.append((bi.daily_rate, bi.quantity))
    out.estimated_total = services.estimate_booking_total(
        req.pickup_date, req.return_date, lines
    )
    return out


def services_card(db: Session, item: models.Item) -> schemas.ItemListOut:
    card = schemas.ItemListOut.model_validate(item)
    card.primary_image_url = services.primary_image_url(item)
    return card


@router.post("", response_model=list[schemas.BookingRequestOut], status_code=201)
def create_booking(
    payload: schemas.BookingRequestCreate,
    db: Session = Depends(get_db),
    customer: models.User | None = Depends(get_optional_user),
):
    if payload.return_date < payload.pickup_date:
        raise HTTPException(400, "return_date must be on or after pickup_date")

    # Guests may submit without an account, but must leave contact details.
    if customer is None and not (payload.guest_name and payload.guest_email):
        raise HTTPException(
            400, "Please provide your name and email to send a request as a guest"
        )

    # Load and validate every requested item.
    by_owner: dict[str, list[tuple[models.Item, int]]] = defaultdict(list)
    for line in payload.items:
        item = (
            db.query(models.Item)
            .options(selectinload(models.Item.images))
            .filter(models.Item.id == line.item_id)
            .first()
        )
        if not item or item.status != models.ITEM_ACTIVE:
            raise HTTPException(404, f"Item {line.item_id} is not available")

        remaining = services.remaining_quantity(
            db, item, payload.pickup_date, payload.return_date
        )
        if line.quantity > remaining:
            raise HTTPException(
                409,
                f"Only {remaining} unit(s) of '{item.name}' are available for those dates",
            )
        by_owner[item.owner_id].append((item, line.quantity))

    # One booking request per owner (a cart may span multiple owners).
    created: list[models.BookingRequest] = []
    for owner_id, lines in by_owner.items():
        req = models.BookingRequest(
            customer_id=customer.id if customer else None,
            guest_name=payload.guest_name or "",
            guest_email=payload.guest_email,
            guest_phone=payload.guest_phone,
            owner_id=owner_id,
            status=models.BOOKING_PENDING,
            event_type=payload.event_type,
            event_date=payload.event_date,
            pickup_date=payload.pickup_date,
            return_date=payload.return_date,
            budget=payload.budget,
            notes=payload.notes,
        )
        db.add(req)
        db.flush()
        for item, qty in lines:
            db.add(
                models.BookingItem(
                    booking_request_id=req.id,
                    item_id=item.id,
                    quantity=qty,
                    daily_rate=item.price_per_day,
                )
            )
        created.append(req)

    db.commit()

    results = []
    for req in created:
        db.refresh(req)
        owner = db.get(models.User, req.owner_id)
        if owner:
            requester = customer.name if customer else (payload.guest_name or "A guest")
            email_service.notify_request_submitted(
                owner.email, requester, len(req.items)
            )
        results.append(_serialize(db, req))
    return results


@router.get("", response_model=list[schemas.BookingRequestOut])
def list_bookings(
    role: str = "customer",
    status: str | None = None,
    db: Session = Depends(get_db),
    current: models.User = Depends(get_current_user),
):
    """role=customer -> requests I sent; role=owner -> requests sent to me."""
    query = db.query(models.BookingRequest).options(
        selectinload(models.BookingRequest.items).selectinload(models.BookingItem.item)
    )
    if role == "owner":
        query = query.filter(models.BookingRequest.owner_id == current.id)
    else:
        query = query.filter(models.BookingRequest.customer_id == current.id)
    if status:
        query = query.filter(models.BookingRequest.status == status)
    reqs = query.order_by(models.BookingRequest.created_at.desc()).all()
    return [_serialize(db, r) for r in reqs]


@router.get("/{booking_id}", response_model=schemas.BookingRequestOut)
def get_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current: models.User = Depends(get_current_user),
):
    req = (
        db.query(models.BookingRequest)
        .options(selectinload(models.BookingRequest.items).selectinload(models.BookingItem.item))
        .filter(models.BookingRequest.id == booking_id)
        .first()
    )
    if not req:
        raise HTTPException(404, "Booking request not found")
    if current.id not in (req.customer_id, req.owner_id) and current.role != models.ROLE_ADMIN:
        raise HTTPException(403, "Not allowed")
    return _serialize(db, req)


@router.patch("/{booking_id}/status", response_model=schemas.BookingRequestOut)
def update_status(
    booking_id: str,
    payload: schemas.BookingStatusUpdate,
    db: Session = Depends(get_db),
    current: models.User = Depends(get_current_user),
):
    req = (
        db.query(models.BookingRequest)
        .options(selectinload(models.BookingRequest.items).selectinload(models.BookingItem.item))
        .filter(models.BookingRequest.id == booking_id)
        .first()
    )
    if not req:
        raise HTTPException(404, "Booking request not found")
    if req.owner_id != current.id and current.role != models.ROLE_ADMIN:
        raise HTTPException(403, "Only the owner can change a request status")

    new_status = payload.status.upper()
    if new_status not in VALID_TRANSITIONS:
        raise HTTPException(400, "Unknown status")
    if new_status not in VALID_TRANSITIONS[req.status]:
        raise HTTPException(409, f"Cannot move from {req.status} to {new_status}")

    req.status = new_status
    db.commit()
    db.refresh(req)

    if new_status in (models.BOOKING_APPROVED, models.BOOKING_REJECTED):
        customer = db.get(models.User, req.customer_id) if req.customer_id else None
        recipient = customer.email if customer else req.guest_email
        if recipient:
            email_service.notify_request_decided(recipient, new_status)
    return _serialize(db, req)
