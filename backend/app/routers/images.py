"""Item image management (owner)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import require_owner
from ..database import get_db
from ..storage import MAX_IMAGES_PER_ITEM

router = APIRouter(prefix="/api/items/{item_id}/images", tags=["images"])


def _owned_item(item_id: str, db: Session, owner: models.User) -> models.Item:
    item = db.get(models.Item, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    if item.owner_id != owner.id and owner.role != models.ROLE_ADMIN:
        raise HTTPException(403, "You do not own this item")
    return item


@router.get("", response_model=list[schemas.ItemImageOut])
def list_images(item_id: str, db: Session = Depends(get_db)):
    return (
        db.query(models.ItemImage)
        .filter(models.ItemImage.item_id == item_id)
        .order_by(models.ItemImage.display_order)
        .all()
    )


@router.post("", response_model=schemas.ItemImageOut, status_code=201)
def add_image(
    item_id: str,
    payload: schemas.ItemImageCreate,
    db: Session = Depends(get_db),
    owner: models.User = Depends(require_owner),
):
    item = _owned_item(item_id, db, owner)
    if len(item.images) >= MAX_IMAGES_PER_ITEM:
        raise HTTPException(400, f"An item can have at most {MAX_IMAGES_PER_ITEM} images")

    is_primary = payload.is_primary or len(item.images) == 0
    if is_primary:
        for img in item.images:
            img.is_primary = False
    image = models.ItemImage(
        item_id=item.id,
        image_url=payload.image_url,
        display_order=payload.display_order or len(item.images),
        is_primary=is_primary,
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.patch("/{image_id}/primary", response_model=schemas.ItemImageOut)
def set_primary(
    item_id: str,
    image_id: str,
    db: Session = Depends(get_db),
    owner: models.User = Depends(require_owner),
):
    item = _owned_item(item_id, db, owner)
    target = None
    for img in item.images:
        img.is_primary = img.id == image_id
        if img.id == image_id:
            target = img
    if not target:
        raise HTTPException(404, "Image not found")
    db.commit()
    db.refresh(target)
    return target


@router.put("/reorder", response_model=list[schemas.ItemImageOut])
def reorder(
    item_id: str,
    ordered_ids: list[str],
    db: Session = Depends(get_db),
    owner: models.User = Depends(require_owner),
):
    item = _owned_item(item_id, db, owner)
    order = {img_id: idx for idx, img_id in enumerate(ordered_ids)}
    for img in item.images:
        if img.id in order:
            img.display_order = order[img.id]
    db.commit()
    return (
        db.query(models.ItemImage)
        .filter(models.ItemImage.item_id == item_id)
        .order_by(models.ItemImage.display_order)
        .all()
    )


@router.delete("/{image_id}", status_code=204)
def delete_image(
    item_id: str,
    image_id: str,
    db: Session = Depends(get_db),
    owner: models.User = Depends(require_owner),
):
    item = _owned_item(item_id, db, owner)
    image = db.get(models.ItemImage, image_id)
    if not image or image.item_id != item.id:
        raise HTTPException(404, "Image not found")
    was_primary = image.is_primary
    db.delete(image)
    db.flush()
    if was_primary:
        remaining = (
            db.query(models.ItemImage)
            .filter(models.ItemImage.item_id == item_id)
            .order_by(models.ItemImage.display_order)
            .first()
        )
        if remaining:
            remaining.is_primary = True
    db.commit()
