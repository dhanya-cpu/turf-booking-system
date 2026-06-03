import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { formatDate, formatTime } from "../utils/format";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/api/bookings")
      .then((res) => setBookings(res.data))
      .catch(() => setError("Could not load your bookings."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await api.post(`/api/bookings/${id}/cancel`);
      load();
    } catch {
      setError("Could not cancel booking.");
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <p className="text-gray-500">Loading your bookings…</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Bookings</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {bookings.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-gray-500">You have no bookings yet.</p>
          <Link to="/" className="btn-primary mt-4">
            Browse turfs
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{b.turf.name}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      b.status === "confirmed"
                        ? "bg-brand-50 text-brand-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">📍 {b.turf.location}</p>
                <p className="mt-1 text-sm text-gray-700">
                  {formatDate(b.slot.date)} · {formatTime(b.slot.start_time)} –{" "}
                  {formatTime(b.slot.end_time)}
                </p>
              </div>
              {b.status === "confirmed" && (
                <button
                  onClick={() => handleCancel(b.id)}
                  className="btn-danger"
                  disabled={cancelling === b.id}
                >
                  {cancelling === b.id ? "Cancelling…" : "Cancel"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
