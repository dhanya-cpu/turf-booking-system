from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models import Turf, User
from app.schemas import TurfCreate, TurfOut, TurfUpdate

router = APIRouter(prefix="/api/turfs", tags=["turfs"])


@router.get("", response_model=list[TurfOut])
def list_turfs(db: Session = Depends(get_db)) -> list[Turf]:
    return db.query(Turf).order_by(Turf.name).all()


@router.get("/{turf_id}", response_model=TurfOut)
def get_turf(turf_id: int, db: Session = Depends(get_db)) -> Turf:
    turf = db.get(Turf, turf_id)
    if not turf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turf not found")
    return turf


@router.post("", response_model=TurfOut, status_code=status.HTTP_201_CREATED)
def create_turf(
    payload: TurfCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> Turf:
    turf = Turf(**payload.model_dump())
    db.add(turf)
    db.commit()
    db.refresh(turf)
    return turf


@router.put("/{turf_id}", response_model=TurfOut)
def update_turf(
    turf_id: int,
    payload: TurfUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> Turf:
    turf = db.get(Turf, turf_id)
    if not turf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turf not found")
    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        turf.name = data["name"]
    if "location" in data:
        turf.location = data["location"]
    if "sport" in data:
        turf.sport = data["sport"]
    if "description" in data:
        turf.description = data["description"]
    if "price_per_hour" in data:
        turf.price_per_hour = data["price_per_hour"]
    if "image_url" in data:
        turf.image_url = data["image_url"]
    db.commit()
    db.refresh(turf)
    return turf


@router.delete("/{turf_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_turf(
    turf_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> None:
    turf = db.get(Turf, turf_id)
    if not turf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turf not found")
    db.delete(turf)
    db.commit()
