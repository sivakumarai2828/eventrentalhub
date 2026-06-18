"""Category browsing (public) and management (admin)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import require_admin
from ..database import get_db

router = APIRouter(prefix="/api/categories", tags=["categories"])


def _with_counts(db: Session) -> dict[str, int]:
    rows = db.execute(
        select(models.Item.category_id, func.count(models.Item.id))
        .where(models.Item.status == models.ITEM_ACTIVE)
        .group_by(models.Item.category_id)
    ).all()
    return {cid: count for cid, count in rows}


@router.get("", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    counts = _with_counts(db)
    categories = db.query(models.Category).order_by(models.Category.name).all()
    result = []
    for c in categories:
        out = schemas.CategoryOut.model_validate(c)
        out.item_count = counts.get(c.id, 0)
        result.append(out)
    return result


@router.get("/{category_id}", response_model=schemas.CategoryOut)
def get_category(category_id: str, db: Session = Depends(get_db)):
    category = db.get(models.Category, category_id)
    if not category:
        raise HTTPException(404, "Category not found")
    out = schemas.CategoryOut.model_validate(category)
    out.item_count = _with_counts(db).get(category.id, 0)
    return out


@router.post("", response_model=schemas.CategoryOut, status_code=201)
def create_category(
    payload: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    if db.query(models.Category).filter(models.Category.name == payload.name).first():
        raise HTTPException(409, "A category with that name already exists")
    category = models.Category(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.patch("/{category_id}", response_model=schemas.CategoryOut)
def update_category(
    category_id: str,
    payload: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    category = db.get(models.Category, category_id)
    if not category:
        raise HTTPException(404, "Category not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    category = db.get(models.Category, category_id)
    if not category:
        raise HTTPException(404, "Category not found")
    if category.items:
        raise HTTPException(409, "Cannot delete a category that still has items")
    db.delete(category)
    db.commit()
