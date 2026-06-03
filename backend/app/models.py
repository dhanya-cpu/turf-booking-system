from __future__ import annotations

import enum
from datetime import datetime, time

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BookingStatus(enum.StrEnum):
    confirmed = "confirmed"
    cancelled = "cancelled"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    bookings: Mapped[list[Booking]] = relationship(back_populates="user")


class Turf(Base):
    __tablename__ = "turfs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    sport: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), default="")
    price_per_hour: Mapped[float] = mapped_column(Float, nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    slots: Mapped[list[Slot]] = relationship(
        back_populates="turf", cascade="all, delete-orphan"
    )


class Slot(Base):
    __tablename__ = "slots"
    __table_args__ = (
        UniqueConstraint("turf_id", "date", "start_time", name="uq_slot_turf_date_start"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    turf_id: Mapped[int] = mapped_column(ForeignKey("turfs.id", ondelete="CASCADE"))
    date: Mapped[Date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)

    turf: Mapped[Turf] = relationship(back_populates="slots")
    bookings: Mapped[list[Booking]] = relationship(
        back_populates="slot", cascade="all, delete-orphan"
    )

    @property
    def is_booked(self) -> bool:
        return any(b.status == BookingStatus.confirmed for b in self.bookings)


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    slot_id: Mapped[int] = mapped_column(ForeignKey("slots.id", ondelete="CASCADE"))
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus), default=BookingStatus.confirmed, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped[User] = relationship(back_populates="bookings")
    slot: Mapped[Slot] = relationship(back_populates="bookings")
