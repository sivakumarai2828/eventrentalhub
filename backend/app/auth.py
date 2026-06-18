"""Authentication & authorization using Supabase-issued JWTs.

Supports both signing schemes Supabase uses:
- Legacy shared secret (HS256) via SUPABASE_JWT_SECRET.
- Asymmetric signing keys (RS256/ES256) verified through the project's JWKS
  endpoint — used by newer projects on the publishable/secret key system.
The scheme is chosen automatically from each token's header.
"""
import json
import urllib.error
import urllib.request
from functools import lru_cache

import jwt
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from . import models
from .config import settings
from .database import get_db


class AuthError(HTTPException):
    def __init__(self, detail: str = "Not authenticated"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


@lru_cache
def _jwks_client() -> jwt.PyJWKClient:
    url = settings.supabase_url.rstrip("/")
    return jwt.PyJWKClient(f"{url}/auth/v1/.well-known/jwks.json")


def _introspect(token: str) -> dict:
    """Validate a token by asking Supabase Auth who it belongs to.

    Used when the HS256 JWT secret isn't configured. Requires SUPABASE_URL and
    SUPABASE_ANON_KEY. Returns a claims-shaped dict on success.
    """
    api_key = settings.supabase_anon_key
    if not settings.supabase_url or not api_key:
        raise AuthError("Server is missing SUPABASE_URL / SUPABASE_ANON_KEY")

    url = settings.supabase_url.rstrip("/") + "/auth/v1/user"
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {token}", "apikey": api_key},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:  # noqa: S310
            user = json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        raise AuthError("Invalid or expired token") from exc
    except urllib.error.URLError as exc:  # pragma: no cover - network issue
        raise AuthError(f"Could not reach auth server: {exc.reason}") from exc

    if not user.get("id"):
        raise AuthError("Invalid token")
    return {
        "sub": user["id"],
        "email": user.get("email", ""),
        "user_metadata": user.get("user_metadata") or {},
    }


def _decode_token(token: str) -> dict:
    try:
        alg = jwt.get_unverified_header(token).get("alg", "HS256")
    except jwt.PyJWTError as exc:
        raise AuthError(f"Invalid token: {exc}") from exc

    try:
        if alg == "HS256":
            if settings.supabase_jwt_secret:
                return jwt.decode(
                    token,
                    settings.supabase_jwt_secret,
                    algorithms=["HS256"],
                    audience="authenticated",
                )
            # No shared secret configured — validate via the Auth API instead.
            return _introspect(token)
        # Asymmetric: fetch the matching public key from the JWKS endpoint.
        signing_key = _jwks_client().get_signing_key_from_jwt(token).key
        return jwt.decode(
            token,
            signing_key,
            algorithms=["RS256", "ES256"],
            audience="authenticated",
        )
    except jwt.PyJWTError as exc:
        raise AuthError(f"Invalid token: {exc}") from exc


def _bearer(authorization: str | None) -> str | None:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


def _sync_user(db: Session, claims: dict) -> models.User:
    """Find or lazily create the local mirror of a Supabase user."""
    uid = claims.get("sub")
    if not uid:
        raise AuthError("Token missing subject")

    user = db.get(models.User, uid)
    if user:
        return user

    meta = claims.get("user_metadata") or {}
    user = models.User(
        id=uid,
        email=claims.get("email", ""),
        name=meta.get("name", ""),
        phone=meta.get("phone"),
        role=meta.get("role", models.ROLE_CUSTOMER),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> models.User:
    token = _bearer(authorization)
    if not token:
        raise AuthError()
    claims = _decode_token(token)
    return _sync_user(db, claims)


def get_optional_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> models.User | None:
    token = _bearer(authorization)
    if not token:
        return None
    try:
        claims = _decode_token(token)
    except HTTPException:
        return None
    return _sync_user(db, claims)


def require_roles(*roles: str):
    """Dependency factory enforcing that the current user has one of *roles*."""

    def dependency(user: models.User = Depends(get_current_user)) -> models.User:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return user

    return dependency


require_owner = require_roles(models.ROLE_OWNER, models.ROLE_ADMIN)
require_admin = require_roles(models.ROLE_ADMIN)
