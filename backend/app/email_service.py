"""Minimal SMTP email notifications.

Disabled by default (EMAILS_ENABLED=false): messages are logged instead of sent
so the app works out-of-the-box in development.
"""
import logging
import smtplib
from email.message import EmailMessage

from .config import settings

logger = logging.getLogger("eventrenthub.email")


def _send(to: str, subject: str, body: str) -> None:
    if not settings.emails_enabled or not settings.smtp_host:
        logger.info("[email disabled] To=%s | %s\n%s", to, subject, body)
        return

    msg = EmailMessage()
    msg["From"] = settings.email_from
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
    except Exception:  # pragma: no cover - never break the request on email failure
        logger.exception("Failed to send email to %s", to)


def notify_request_submitted(owner_email: str, customer_name: str, item_count: int) -> None:
    _send(
        owner_email,
        "New rental request on EventRentHub",
        f"{customer_name or 'A customer'} sent you a rental request for "
        f"{item_count} item(s). Log in to your dashboard to review it.",
    )


def notify_request_decided(customer_email: str, status: str) -> None:
    pretty = status.capitalize()
    _send(
        customer_email,
        f"Your EventRentHub rental request was {pretty.lower()}",
        f"Good news — your rental request status is now: {pretty}.\n"
        "Log in to EventRentHub to see the details.",
    )
