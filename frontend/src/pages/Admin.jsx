import { useEffect, useState } from "react";
import api from "../api/client";
import { formatDate, formatPrice, formatTime } from "../utils/format";

const EMPTY_TURF = {
  name: "",
  location: "",
  sport: "",
  description: "",
  price_per_hour: "",
  image_url: "",
};

function TurfForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(initial);

  useEffect(() => setForm(initial), [initial]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...form, price_per_hour: parseFloat(form.price_per_hour) });
      }}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <div>
        <label className="label">Name</label>
        <input className="input" value={form.name} onChange={update("name")} required />
      </div>
      <div>
        <label className="label">Location</label>
        <input className="input" value={form.location} onChange={update("location")} required />
      </div>
      <div>
        <label className="label">Sport</label>
        <input className="input" value={form.sport} onChange={update("sport")} required />
      </div>
      <div>
        <label className="label">Price per hour (₹)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          className="input"
          value={form.price_per_hour}
          onChange={update("price_per_hour")}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Image URL</label>
        <input className="input" value={form.image_url} onChange={update("image_url")} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Description</label>
        <textarea
          className="input"
          rows={2}
          value={form.description}
          onChange={update("description")}
        />
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : "Save turf"}
        </button>
        {onCancel && (
          <button type="button" className="btn-outline" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function SlotManager({ turf }) {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState("");
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("19:00");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  const load = () => {
    api
      .get(`/api/slots?turf_id=${turf.id}`)
      .then((res) => setSlots(res.data))
      .catch(() => setError("Could not load slots."));
  };

  useEffect(load, [turf.id]);

  const addSlot = async (e) => {
    e.preventDefault();
    setError("");
    setAdding(true);
    try {
      await api.post("/api/slots", {
        turf_id: turf.id,
        date,
        start_time: `${start}:00`,
        end_time: `${end}:00`,
      });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add slot.");
    } finally {
      setAdding(false);
    }
  };

  const deleteSlot = async (id) => {
    setError("");
    try {
      await api.delete(`/api/slots/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not delete slot.");
    }
  };

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <h4 className="text-sm font-semibold text-gray-700">Slots</h4>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <form onSubmit={addSlot} className="mt-3 flex flex-wrap items-end gap-2">
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Start</label>
          <input
            type="time"
            className="input"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">End</label>
          <input
            type="time"
            className="input"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary" disabled={adding}>
          {adding ? "Adding…" : "Add slot"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {slots.length === 0 && <p className="text-sm text-gray-400">No slots yet.</p>}
        {slots.map((s) => (
          <span
            key={s.id}
            className={`group flex items-center gap-1 rounded-lg px-2 py-1 text-xs ${
              s.is_booked
                ? "bg-gray-100 text-gray-500"
                : "bg-brand-50 text-brand-700"
            }`}
          >
            {formatDate(s.date)} {formatTime(s.start_time)}
            {!s.is_booked && (
              <button
                onClick={() => deleteSlot(s.id)}
                className="ml-1 text-red-500 hover:text-red-700"
                title="Delete slot"
              >
                ✕
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/api/turfs")
      .then((res) => setTurfs(res.data))
      .catch(() => setError("Could not load turfs."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/turfs", data);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create turf.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      await api.put(`/api/turfs/${editing.id}`, data);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not update turf.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this turf and all its slots?")) return;
    setError("");
    try {
      await api.delete(`/api/turfs/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not delete turf.");
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin Panel</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="card mb-8 p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {editing ? "Edit turf" : "Add a new turf"}
        </h2>
        <TurfForm
          initial={editing ? { ...editing } : EMPTY_TURF}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={editing ? () => setEditing(null) : null}
          submitting={submitting}
        />
      </div>

      <h2 className="mb-4 text-lg font-semibold">Manage turfs</h2>
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="space-y-4">
          {turfs.map((turf) => (
            <div key={turf.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">
                    {turf.name}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      · {turf.sport} · {formatPrice(turf.price_per_hour)}/hr
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500">📍 {turf.location}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn-outline py-1.5"
                    onClick={() => setExpanded(expanded === turf.id ? null : turf.id)}
                  >
                    {expanded === turf.id ? "Hide slots" : "Manage slots"}
                  </button>
                  <button className="btn-outline py-1.5" onClick={() => setEditing(turf)}>
                    Edit
                  </button>
                  <button className="btn-danger py-1.5" onClick={() => handleDelete(turf.id)}>
                    Delete
                  </button>
                </div>
              </div>
              {expanded === turf.id && <SlotManager turf={turf} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
