"""Idempotent seed data: starter categories + demo listings (local dev)."""
from sqlalchemy.orm import Session

from . import models
from .config import settings

STARTER_CATEGORIES = [
    ("Backdrops", "Photo walls, arches and statement backgrounds for any event."),
    ("Furniture", "Tables, chairs, lounges and accent pieces for guests."),
    ("Drapes", "Fabric draping, ceiling treatments and pipe-and-drape kits."),
    ("Lighting", "Uplighting, fairy lights, chandeliers and ambient fixtures."),
    ("Floral", "Floral walls, arrangements, centerpieces and greenery."),
]


def seed_categories(db: Session) -> None:
    existing = {name for (name,) in db.query(models.Category.name).all()}
    for name, description in STARTER_CATEGORIES:
        if name not in existing:
            db.add(models.Category(name=name, description=description))
    db.commit()


# --------------------------------------------------------------------------- #
# Demo listings (local SQLite dev only)
# --------------------------------------------------------------------------- #
DEMO_OWNER_ID = "00000000-0000-0000-0000-000000000001"


def _img(photo_id: str) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?w=800&q=70&auto=format&fit=crop"


# (name, price_per_day, pickup_city, unsplash photo id)
# Every item uses a UNIQUE image — no duplicates within or across categories.
DEMO_ITEMS: dict[str, list[tuple[str, float, str, str]]] = {
    "Backdrops": [
        ("White Floral Arch", 120, "Austin", "1469371670807-013ccf25f16a"),
        ("Greenery Photo Wall", 95, "Dallas", "1513161455079-7dc1de15ef3e"),
        ("Boho Statement Backdrop", 80, "Houston", "1556228453-efd6c1ff04f6"),
    ],
    "Furniture": [
        ("Gold Chiavari Chairs (set of 10)", 45, "Austin", "1519167758481-83f550bb49b3"),
        ("Velvet Lounge Sofa", 150, "Dallas", "1540574163026-643ea20ade25"),
        ("Round Banquet Tables (set of 5)", 60, "Houston", "1464366400600-7168b8af9bc3"),
    ],
    "Drapes": [
        ("Ivory Ceiling Drapes", 110, "Austin", "1493809842364-78817add7ffb"),
        ("Pipe & Drape Kit (20ft)", 90, "San Antonio", "1519225421980-715cb0215aed"),
    ],
    "Lighting": [
        ("Warm Fairy Light Canopy", 130, "Austin", "1464047736614-af63643285bf"),
        ("Crystal Chandelier", 175, "Dallas", "1527529482837-4698179dc6ce"),
        ("Uplighting Set (8 fixtures)", 60, "Houston", "1505693416388-ac5ce068fe85"),
    ],
    "Floral": [
        ("Blush Floral Centerpieces", 40, "Austin", "1511795409834-ef04bbd61622"),
        ("Floral Wall Panel", 140, "Dallas", "1523438885200-e635ba2c371e"),
    ],
}


def seed_demo_items(db: Session) -> None:
    """Insert a handful of sample listings so categories aren't empty.

    Runs only against the local SQLite database — on Supabase Postgres the
    ``users`` table is foreign-keyed to ``auth.users``, so demo data there
    would need a real auth account.
    """
    if not settings.database_url.startswith("sqlite"):
        return
    if db.query(models.Item).count() > 0:
        return

    owner = db.get(models.User, DEMO_OWNER_ID)
    if not owner:
        owner = models.User(
            id=DEMO_OWNER_ID,
            name="EventRentHub Demo",
            email="demo@eventrenthub.com",
            role=models.ROLE_OWNER,
        )
        db.add(owner)
        db.flush()

    categories = {c.name: c for c in db.query(models.Category).all()}
    for cat_name, items in DEMO_ITEMS.items():
        category = categories.get(cat_name)
        if not category:
            continue
        for name, price, city, photo_id in items:
            item = models.Item(
                owner_id=owner.id,
                category_id=category.id,
                name=name,
                description=(
                    f"Premium {cat_name.lower()} rental, perfect for weddings, "
                    "birthdays and special events. Pickup by arrangement."
                ),
                price_per_day=price,
                security_deposit=price * 2,
                quantity_available=4,
                pickup_city=city,
                pickup_address="123 Event Street",
                status=models.ITEM_ACTIVE,
            )
            db.add(item)
            db.flush()
            db.add(
                models.ItemImage(
                    item_id=item.id,
                    image_url=_img(photo_id),
                    display_order=0,
                    is_primary=True,
                )
            )
    db.commit()
