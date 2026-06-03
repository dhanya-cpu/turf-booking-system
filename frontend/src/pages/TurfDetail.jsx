import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatPrice, formatTime } from "../utils/format";

export default function TurfDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [turf, setTurf] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState(null);

  const loadSlots = () => {
    api
      .get(`/api/slots?turf_id=${id}`)
      .then((res) => setSlots(res.data))
      .catch(() => setError("Could not load slots."));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/api/turfs/${id}`), api.get(`/api/slots?turf_id=${id}`)])
      .then(([turfRes, slotsRes]) => {
        setTurf(turfRes.data);
        setSlots(slotsRes.data);
      })
      .catch(() => setError("Could not load this turf."))
      .finally(() => setLoading(false));
  }, [id]);

  const dates = useMemo(
    () => Array.from(new Set(slots.map((s) => s.date))).sort(),
    [slots]
  );

  useEffect(() => {
    if (!selectedDate && dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate]);

  const daySlots = slots
    .filter((s) => s.date === selectedDate)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const handleBook = async (slot) => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/turfs/${id}` } } });
      return;
    }
    setBooking(true);
    setMessage(null);
    try {
      await api.post("/api/bookings", { slot_id: slot.id });
      setMessage({ type: "success", text: "Booked! See it under My Bookings." });
      loadSlots();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Booking failed. Try another slot.",
      });
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (error) return <div className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</div>;
  if (!turf) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <div className="card overflow-hidden">
          <div className="aspect-[16/9] bg-gray-100">
            {turf.image_url ? (
              <img src={turf.image_url} alt={turf.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">🏟️</div>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{turf.name}</h1>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
                {turf.sport}
              </span>
            </div>
            <p className="mt-1 text-gray-500">📍 {turf.location}</p>
            <p className="mt-4 text-gray-700">{turf.description}</p>
            <p className="mt-4 text-lg font-bold text-brand-700">
              {formatPrice(turf.price_per_hour)}
              <span className="text-sm font-normal text-gray-500"> / hour</span>
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Pick a slot</h2>

          {message && (
            <div
              className={`mt-4 rounded-lg px-3 py-2 text-sm ${
                message.type === "success"
                  ? "bg-brand-50 text-brand-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {dates.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No slots available yet.</p>
          ) : (
            <>
              <div className="mt-4">
                <label className="label">Date</label>
                <div className="flex flex-wrap gap-2">
                  {dates.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(d)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        selectedDate === d
                          ? "bg-brand-600 text-white"
                          : "bg-gray-50 text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {formatDate(d)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {daySlots.map((slot) => (
                  <button
                    key={slot.id}
                    disabled={slot.is_booked || booking}
                    onClick={() => handleBook(slot)}
                    className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                      slot.is_booked
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 line-through"
                        : "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
                    }`}
                  >
                    {formatTime(slot.start_time)}
                  </button>
                ))}
              </div>

              {!user && (
                <p className="mt-4 text-xs text-gray-500">
                  You&apos;ll be asked to log in before booking.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
