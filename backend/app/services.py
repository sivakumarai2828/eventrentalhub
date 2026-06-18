"""Business-logic helpers: availability, pricing, image utilities."""
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models

# Booking statuses that reserve inventory.
RESERVING_STATUSES = (models.BOOKING_PENDING, models.BOOKING_APPROVED)


def reserved_quantity(
    db: Session,
    item_id: str,
    start: date,
    end: date,
    exclude_request_id: str | None = None,
) -> int:
    """Total quantity of *item_id* reserved by bookings overlapping [start, end]."""
    stmt = (
        select(models.BookingItem.quantity)
        .join(models.BookingRequest)
        .where(
            models.BookingItem.item_id == item_id,
            models.BookingRequest.status.in_(RESERVING_STATUSES),
            models.BookingRequest.pickup_date <= end,
            models.BookingRequest.return_date >= start,
        )
    )
    if exclude_request_id:
        stmt = stmt.where(models.BookingRequest.id != exclude_request_id)
    return sum(row[0] for row in db.execute(stmt).all())


def remaining_quantity(
    db: Session, item: models.Item, start: date, end: date
) -> int:
    """How many units of *item* are free across [start, end]."""
    reserved = reserved_quantity(db, item.id, start, end)
    return max(0, item.quantity_available - reserved)


def next_available_date(
    db: Session, item: models.Item, start: date, end: date, horizon_days: int = 120
) -> date | None:
    """Find the earliest day after *start* where a full unit frees up.

    Scans forward day-by-day up to *horizon_days*. Returns ``None`` if nothing
    frees up within the horizon.
    """
    span = (end - start).days
    cursor = start + timedelta(days=1)
    limit = start + timedelta(days=horizon_days)
    while cursor <= limit:
        window_end = cursor + timedelta(days=span)
        if remaining_quantity(db, item, cursor, window_end) > 0:
            return cursor
        cursor += timedelta(days=1)
    return None


def primary_image_url(item: models.Item) -> str | None:
    if not item.images:
        return None
    for img in item.images:
        if img.is_primary:
            return img.image_url
    return item.images[0].image_url


def estimate_booking_total(
    pickup: date, return_date: date, lines: list[tuple[Decimal, int]]
) -> Decimal:
    """lines: list of (daily_rate, quantity). Total = days * sum(rate*qty)."""
    days = max(1, (return_date - pickup).days)
    per_day = sum(Decimal(rate) * qty for rate, qty in lines)
    return per_day * days
