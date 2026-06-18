"""Helpers for Supabase Storage.

In this MVP the browser uploads files directly to Supabase Storage using the
Supabase JS client (it already holds the user's session), then sends the
resulting public URL to the API. These helpers exist for server-side URL
construction and validation.
"""
from .config import settings

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_IMAGES_PER_ITEM = 20


def public_url(path: str) -> str:
    """Build the public URL for an object stored in the images bucket."""
    base = settings.supabase_url.rstrip("/")
    bucket = settings.supabase_storage_bucket
    return f"{base}/storage/v1/object/public/{bucket}/{path.lstrip('/')}"
