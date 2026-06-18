"""EventRentHub API entrypoint."""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, SessionLocal, engine
from .routers import admin, availability, bookings, categories, images, items, users
from .seed import seed_categories, seed_demo_items

logging.basicConfig(level=logging.INFO)

# For SQLite/dev convenience we create tables on boot. On Supabase Postgres,
# prefer the SQL migrations in backend/migrations/ (create_all is a no-op for
# tables that already exist).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="EventRentHub API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for module in (users, categories, items, images, availability, bookings, admin):
    app.include_router(module.router)


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok", "service": "eventrenthub"}


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_categories(db)
        seed_demo_items(db)
    finally:
        db.close()
