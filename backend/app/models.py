"""SQLAlchemy ORM models for EventRentHub."""
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base
from .db_types import GUID, new_uuid

# --- Enumerated string values (kept as plain strings for portability) ---
ROLE_CUSTOMER = "customer"
ROLE_OWNER = "owner"
ROLE_ADMIN = "admin"
ROLES = (ROLE_CUSTOMER, ROLE_OWNER, ROLE_ADMIN)

ITEM_ACTIVE = "active"
ITEM_INACTIVE = "inactive"

BOOKING_PENDING = "PENDING"
BOOKING_APPROVED = "APPROVED"
BOOKING_REJECTED = "REJECTED"
BOOKING_COMPLETED = "COMPLETED"


class User(Base):
    """Mirror of a Supabase auth user, keyed by the auth UID."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(GUID, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), default="")
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    role: Mapped[str] = mapped_column(String(20), default=ROLE_CUSTOMER, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    items: Mapped[list["Item"]] = relationship(back_populates="owner")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    cover_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    items: Mapped[list["Item"]] = relationship(back_populates="category")


class Item(Base):
    __tablename__ = "items"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=new_uuid)
    owner_id: Mapped[str] = mapped_column(GUID, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    category_id: Mapped[str] = mapped_column(GUID, ForeignKey("categories.id"), index=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    price_per_day: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    security_deposit: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    quantity_available: Mapped[int] = mapped_column(Integer, default=1)
    pickup_city: Mapped[str] = mapped_column(String(120), default="", index=True)
    pickup_address: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default=ITEM_ACTIVE, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    owner: Mapped["User"] = relationship(back_populates="items")
    category: Mapped["Category"] = relationship(back_populates="items")
    images: Mapped[list["ItemImage"]] = relationship(
        back_populates="item", cascade="all, delete-orphan", order_by="ItemImage.display_order"
    )
    availability: Mapped[list["Availability"]] = relationship(
        back_populates="item", cascade="all, delete-orphan"
    )


class ItemImage(Base):
    __tablename__ = "item_images"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=new_uuid)
    item_id: Mapped[str] = mapped_column(GUID, ForeignKey("items.id", ondelete="CASCADE"), index=True)
    image_url: Mapped[str] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    item: Mapped["Item"] = relationship(back_populates="images")


class Availability(Base):
    """Optional explicit availability windows for an item."""

    __tablename__ = "availability"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=new_uuid)
    item_id: Mapped[str] = mapped_column(GUID, ForeignKey("items.id", ondelete="CASCADE"), index=True)
    available_from: Mapped[date] = mapped_column(Date)
    available_to: Mapped[date] = mapped_column(Date)
    quantity_available: Mapped[int] = mapped_column(Integer, default=1)

    item: Mapped["Item"] = relationship(back_populates="availability")


class BookingRequest(Base):
    __tablename__ = "booking_requests"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=new_uuid)
    # Nullable: a guest can send a request without an account.
    customer_id: Mapped[str | None] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    guest_name: Mapped[str] = mapped_column(String(200), default="")
    guest_email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    guest_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    owner_id: Mapped[str] = mapped_column(GUID, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String(20), default=BOOKING_PENDING, index=True)
    event_type: Mapped[str] = mapped_column(String(120), default="")
    event_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    pickup_date: Mapped[date] = mapped_column(Date)
    return_date: Mapped[date] = mapped_column(Date)
    budget: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    items: Mapped[list["BookingItem"]] = relationship(
        back_populates="booking_request", cascade="all, delete-orphan"
    )
    customer: Mapped["User"] = relationship(foreign_keys=[customer_id])
    owner: Mapped["User"] = relationship(foreign_keys=[owner_id])


class BookingItem(Base):
    __tablename__ = "booking_items"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=new_uuid)
    booking_request_id: Mapped[str] = mapped_column(
        GUID, ForeignKey("booking_requests.id", ondelete="CASCADE"), index=True
    )
    item_id: Mapped[str] = mapped_column(GUID, ForeignKey("items.id", ondelete="CASCADE"), index=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    daily_rate: Mapped[float] = mapped_column(Numeric(10, 2), default=0)

    booking_request: Mapped["BookingRequest"] = relationship(back_populates="items")
    item: Mapped["Item"] = relationship()
