from datetime import date as date_type

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models import Slot, Turf, User
from app.schemas import SlotCreate, SlotOut

router = APIRouter(prefix="/api/slots", tags=["slots"])


def _to_slot_out(slot: Slot) -> SlotOut:
    return SlotOut(
        id=slot.id,
        turf_id=slot.turf_id,
        date=slot.date,
        start_time=slot.start_time,
        end_time=slot.end_time,
        is_booked=slot.is_booked,
    )


@router.get("", response_model=list[SlotOut])
def list_slots(
    turf_id: int | None = None,
    date: date_type | None = None,
    db: Session = Depends(get_db),
) -> list[SlotOut]:
    query = db.query(Slot)
    if turf_id is not None:
        query = query.filter(Slot.turf_id == turf_id)
    if date is not None:
        query = query.filter(Slot.date == date)
    slots = query.order_by(Slot.date, Slot.start_time).all()
    return [_to_slot_out(slot) for slot in slots]


@router.post("", response_model=SlotOut, status_code=status.HTTP_201_CREATED)
def create_slot(
    payload: SlotCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> SlotOut:
    turf = db.get(Turf, payload.turf_id)
    if not turf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turf not found")
    if payload.end_time <= payload.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_time must be after start_time",
        )
    existing = (
        db.query(Slot)
        .filter(
            Slot.turf_id == payload.turf_id,
            Slot.date == payload.date,
            Slot.start_time == payload.start_time,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A slot with this start time already exists for that date",
        )
    slot = Slot(
        turf_id=payload.turf_id,
        date=payload.date,
        start_time=payload.start_time,
        end_time=payload.end_time,
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return _to_slot_out(slot)


@router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> None:
    slot = db.get(Slot, slot_id)
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found")
    if slot.is_booked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a slot that has an active booking",
        )
    db.delete(slot)
    db.commit()
