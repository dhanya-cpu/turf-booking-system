"""Seed the database with sample turfs, slots, and an admin + demo user.

Idempotent: running it multiple times will not create duplicates.
"""

from __future__ import annotations

from datetime import date, time, timedelta

from sqlalchemy.orm import Session

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.models import Slot, Turf, User

SAMPLE_TURFS = [
    {
        "name": "Green Valley Arena",
        "location": "Downtown, MG Road",
        "sport": "Football",
        "description": "Premium 5-a-side astro-turf with floodlights.",
        "price_per_hour": 800.0,
        "image_url": "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800",
    },
    {
        "name": "Smash Point Courts",
        "location": "Whitefield",
        "sport": "Cricket",
        "description": "Full-size cricket nets and box cricket turf.",
        "price_per_hour": 1200.0,
        "image_url": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
    },
    {
        "name": "Ace Sports Hub",
        "location": "Indiranagar",
        "sport": "Football",
        "description": "Rooftop 7-a-side turf with cafe and parking.",
        "price_per_hour": 1000.0,
        "image_url": "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800",
    },
]


def _ensure_user(db: Session, name: str, email: str, password: str, is_admin: bool) -> None:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return
    db.add(
        User(
            name=name,
            email=email,
            hashed_password=hash_password(password),
            is_admin=is_admin,
        )
    )


def _ensure_slots(db: Session, turf: Turf) -> None:
    """Create hourly slots (16:00-22:00) for the next 7 days if none exist."""
    has_slots = db.query(Slot).filter(Slot.turf_id == turf.id).first()
    if has_slots:
        return
    today = date.today()
    for day_offset in range(7):
        slot_date = today + timedelta(days=day_offset)
        for hour in range(16, 22):
            db.add(
                Slot(
                    turf_id=turf.id,
                    date=slot_date,
                    start_time=time(hour, 0),
                    end_time=time(hour + 1, 0),
                )
            )


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _ensure_user(db, "Admin", "admin@turf.com", "admin123", is_admin=True)
        _ensure_user(db, "Demo User", "user@turf.com", "user123", is_admin=False)

        for data in SAMPLE_TURFS:
            turf = db.query(Turf).filter(Turf.name == data["name"]).first()
            if not turf:
                turf = Turf(**data)
                db.add(turf)
                db.flush()
            _ensure_slots(db, turf)

        db.commit()
        print("Database seeded successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
