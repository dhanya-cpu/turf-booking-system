from __future__ import annotations

from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models import BookingStatus


# ---------- Auth / Users ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    is_admin: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Turfs ----------
class TurfBase(BaseModel):
    name: str
    location: str
    sport: str
    description: str = ""
    price_per_hour: float
    image_url: str = ""


class TurfCreate(TurfBase):
    pass


class TurfUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    sport: str | None = None
    description: str | None = None
    price_per_hour: float | None = None
    image_url: str | None = None


class TurfOut(TurfBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


# ---------- Slots ----------
class SlotCreate(BaseModel):
    turf_id: int
    date: date
    start_time: time
    end_time: time


class SlotOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    turf_id: int
    date: date
    start_time: time
    end_time: time
    is_booked: bool = False


# ---------- Bookings ----------
class BookingCreate(BaseModel):
    slot_id: int


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: BookingStatus
    created_at: datetime
    slot: SlotOut
    turf: TurfOut
