"""Public 'Get a Quote' lead capture — emails the owner/admin a new request."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import email_service, models, schemas
from ..config import settings
from ..database import get_db

router = APIRouter(prefix="/api/quotes", tags=["quotes"])


@router.post("", status_code=202)
def create_quote(payload: schemas.QuoteRequestCreate, db: Session = Depends(get_db)):
    """Notify the single operator of a new quote request.

    Recipient is the admin user (the sole operator); falls back to the first
    owner, then to EMAIL_FROM if no users exist yet. Email actually sends only
    when EMAILS_ENABLED=true (otherwise it is logged) — see email_service.
    """
    if settings.notify_email:
        to_email = settings.notify_email
    else:
        recipient = (
            db.query(models.User).filter(models.User.role == models.ROLE_ADMIN).first()
            or db.query(models.User).filter(models.User.role == models.ROLE_OWNER).first()
        )
        to_email = recipient.email if recipient else settings.email_from

    email_service.notify_quote_request(
        to_email,
        payload.name,
        payload.email,
        payload.phone,
        payload.event_date,
        payload.categories,
        payload.details,
    )
    return {"status": "received"}
