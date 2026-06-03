from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Booking, BookingStatus, Slot, User
from app.routers.slots import _to_slot_out
from app.schemas import BookingCreate, BookingOut, TurfOut

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


def _to_booking_out(booking: Booking) -> BookingOut:
    return BookingOut(
        id=booking.id,
        status=booking.status,
        created_at=booking.created_at,
        slot=_to_slot_out(booking.slot),
        turf=TurfOut.model_validate(booking.slot.turf),
    )


@router.get("", response_model=list[BookingOut])
def list_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[BookingOut]:
    bookings = (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return [_to_booking_out(b) for b in bookings]


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BookingOut:
    slot = db.get(Slot, payload.slot_id)
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found")

    existing = (
        db.query(Booking)
        .filter(
            Booking.slot_id == slot.id,
            Booking.status == BookingStatus.confirmed,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This slot is already booked",
        )

    booking = Booking(
        user_id=current_user.id,
        slot_id=slot.id,
        status=BookingStatus.confirmed,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _to_booking_out(booking)


@router.post("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BookingOut:
    booking = db.get(Booking, booking_id)
    if not booking or booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found"
        )
    if booking.status == BookingStatus.cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is already cancelled",
        )
    booking.status = BookingStatus.cancelled
    db.commit()
    db.refresh(booking)
    return _to_booking_out(booking)
