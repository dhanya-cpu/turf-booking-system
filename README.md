# 🏟️ TurfBook — Turf Booking System

<img width="1816" height="820" alt="image" src="https://github.com/user-attachments/assets/4ed9a502-1b43-44aa-899e-0684b0864869" />

<img width="1795" height="832" alt="image" src="https://github.com/user-attachments/assets/1781e4a6-73a5-4ac1-947c-a62c4a3cd9c7" />

<img width="1829" height="839" alt="image" src="https://github.com/user-attachments/assets/49d0af59-c14f-4f46-8c3a-d42fe6c74b10" />

<img width="1836" height="528" alt="image" src="https://github.com/user-attachments/assets/c67f93ce-dac4-4016-a130-2407c1e17c72" />



A full-stack web app for browsing sports turfs, booking time slots, and managing
turfs/slots as an admin.

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** FastAPI + SQLAlchemy + SQLite
- **Auth:** JWT-based, with `user` and `admin` roles

## Features

- Browse turfs with search and sport filters
- View turf details and pick an available time slot
- Book a slot and view / cancel your bookings ("My Bookings")
- User registration and login (JWT)
- Admin panel to create/edit/delete turfs and manage their slots
- Double-booking prevention (a slot can only be booked once)

## Project structure

```
turf-booking-system/
├── backend/          # FastAPI app
│   └── app/
│       ├── main.py        # app + CORS + routers
│       ├── models.py      # SQLAlchemy models
│       ├── schemas.py     # Pydantic schemas
│       ├── auth.py        # password hashing + JWT
│       ├── seed.py        # sample data seeder
│       └── routers/       # auth, turfs, slots, bookings
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── pages/         # Home, TurfDetail, MyBookings, Login, Register, Admin
        ├── components/    # Navbar, ProtectedRoute
        ├── context/       # AuthContext
        └── api/           # axios client
```

## Getting started

### 1. Backend

Requires Python 3.11+ and [uv](https://docs.astral.sh/uv/).

```bash
cd backend
uv sync
uv run python -m app.seed       # creates the DB + sample data
uv run uvicorn app.main:app --reload --port 8000
```

The API runs at `http://localhost:8000` (interactive docs at `/docs`).

### 2. Frontend

Requires Node.js 20+.

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Demo accounts

The seeder creates two accounts:

| Role  | Email           | Password |
| ----- | --------------- | -------- |
| Admin | admin@turf.com  | admin123 |
| User  | user@turf.com   | user123  |

> ⚠️ These are seed credentials for local development only — change them before
> any real deployment.

## API overview

| Method | Endpoint                      | Auth   | Description                |
| ------ | ----------------------------- | ------ | -------------------------- |
| POST   | `/api/auth/register`          | —      | Register + get token       |
| POST   | `/api/auth/login`             | —      | Login + get token          |
| GET    | `/api/auth/me`                | user   | Current user               |
| GET    | `/api/turfs`                  | —      | List turfs                 |
| POST   | `/api/turfs`                  | admin  | Create turf                |
| PUT    | `/api/turfs/{id}`             | admin  | Update turf                |
| DELETE | `/api/turfs/{id}`             | admin  | Delete turf                |
| GET    | `/api/slots?turf_id=&date=`   | —      | List slots                 |
| POST   | `/api/slots`                  | admin  | Create slot                |
| DELETE | `/api/slots/{id}`             | admin  | Delete slot                |
| GET    | `/api/bookings`               | user   | My bookings                |
| POST   | `/api/bookings`               | user   | Book a slot                |
| POST   | `/api/bookings/{id}/cancel`   | user   | Cancel a booking           |

## Configuration

Both apps read optional environment variables — see `backend/.env.example` and
`frontend/.env.example`.
