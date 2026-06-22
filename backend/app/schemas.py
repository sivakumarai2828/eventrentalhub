"""Pydantic schemas (request/response models)."""
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .models import BOOKING_PENDING, ITEM_ACTIVE, ROLE_CUSTOMER


# --------------------------------------------------------------------------- #
# Users
# --------------------------------------------------------------------------- #
class UserBase(BaseModel):
    name: str = ""
    phone: str | None = None


class UserUpsert(UserBase):
    """Sent by the frontend right after Supabase sign-up to sync the profile."""

    email: EmailStr | None = None
    role: str = ROLE_CUSTOMER


class UserUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    role: str | None = None


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    role: str
    created_at: datetime


# --------------------------------------------------------------------------- #
# Categories
# --------------------------------------------------------------------------- #
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    description: str = ""
    cover_image_url: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=120)
    description: str | None = None
    cover_image_url: str | None = None


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    item_count: int | None = None


# --------------------------------------------------------------------------- #
# Item images
# --------------------------------------------------------------------------- #
class ItemImageBase(BaseModel):
    image_url: str
    display_order: int = 0
    is_primary: bool = False


class ItemImageCreate(ItemImageBase):
    pass


class ItemImageOut(ItemImageBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    item_id: str
    created_at: datetime


# --------------------------------------------------------------------------- #
# Availability
# --------------------------------------------------------------------------- #
class AvailabilityBase(BaseModel):
    available_from: date
    available_to: date
    quantity_available: int = Field(1, ge=0)


class AvailabilityCreate(AvailabilityBase):
    pass


class AvailabilityOut(AvailabilityBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    item_id: str


# --------------------------------------------------------------------------- #
# Items
# --------------------------------------------------------------------------- #
class ItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    price_per_day: Decimal = Field(0, ge=0)
    security_deposit: Decimal = Field(0, ge=0)
    quantity_available: int = Field(1, ge=0)
    pickup_city: str = ""
    pickup_address: str = ""
    status: str = ITEM_ACTIVE


class ItemCreate(ItemBase):
    category_id: str
    images: list[ItemImageCreate] = []


class ItemUpdate(BaseModel):
    category_id: str | None = None
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    price_per_day: Decimal | None = Field(None, ge=0)
    security_deposit: Decimal | None = Field(None, ge=0)
    quantity_available: int | None = Field(None, ge=0)
    pickup_city: str | None = None
    pickup_address: str | None = None
    status: str | None = None


class ItemOut(ItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    owner_id: str
    category_id: str
    created_at: datetime
    images: list[ItemImageOut] = []


class ItemListOut(BaseModel):
    """Lightweight card representation used in listings."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    price_per_day: Decimal
    pickup_city: str
    category_id: str
    quantity_available: int
    status: str
    primary_image_url: str | None = None
    remaining_available: int | None = None


class PaginatedItems(BaseModel):
    items: list[ItemListOut]
    total: int
    page: int
    page_size: int
    pages: int


class AvailabilityCheck(BaseModel):
    remaining: int
    is_available: bool
    next_available_date: date | None = None


# --------------------------------------------------------------------------- #
# Booking items / requests
# --------------------------------------------------------------------------- #
class BookingItemCreate(BaseModel):
    item_id: str
    quantity: int = Field(1, ge=1)


class BookingItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    item_id: str
    quantity: int
    daily_rate: Decimal
    item: ItemListOut | None = None


class BookingRequestCreate(BaseModel):
    event_type: str = ""
    event_date: date | None = None
    pickup_date: date
    return_date: date
    budget: Decimal | None = Field(None, ge=0)
    notes: str = ""
    items: list[BookingItemCreate] = Field(..., min_length=1)
    # Provided when an unauthenticated guest submits a request.
    guest_name: str | None = None
    guest_email: EmailStr | None = None
    guest_phone: str | None = None


class BookingStatusUpdate(BaseModel):
    status: str


class BookingRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    customer_id: str | None
    guest_name: str | None = None
    guest_email: str | None = None
    guest_phone: str | None = None
    owner_id: str
    status: str
    event_type: str
    event_date: date | None
    pickup_date: date
    return_date: date
    budget: Decimal | None
    notes: str
    created_at: datetime
    items: list[BookingItemOut] = []
    estimated_total: Decimal | None = None


# --------------------------------------------------------------------------- #
# Quote requests (public "Get a Quote" lead form)
# --------------------------------------------------------------------------- #
class QuoteRequestCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    phone: str | None = Field(None, max_length=50)
    event_date: str | None = Field(None, max_length=40)
    categories: list[str] = Field(default_factory=list)
    details: str | None = Field(None, max_length=4000)


# --------------------------------------------------------------------------- #
# Misc
# --------------------------------------------------------------------------- #
class UploadSignedUrl(BaseModel):
    path: str
    token: str
    signed_url: str
    public_url: str
