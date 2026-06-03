import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { formatPrice } from "../utils/format";

function TurfCard({ turf }) {
  return (
    <Link
      to={`/turfs/${turf.id}`}
      className="card group overflow-hidden transition hover:shadow-md"
    >
      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
        {turf.image_url ? (
          <img
            src={turf.image_url}
            alt={turf.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🏟️</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{turf.name}</h3>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            {turf.sport}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">📍 {turf.location}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            {formatPrice(turf.price_per_hour)}
            <span className="text-xs font-normal text-gray-500">/hr</span>
          </span>
          <span className="text-sm font-semibold text-brand-700 group-hover:underline">
            Book now →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("All");

  useEffect(() => {
    api
      .get("/api/turfs")
      .then((res) => setTurfs(res.data))
      .catch(() => setError("Could not load turfs. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const sports = useMemo(
    () => ["All", ...Array.from(new Set(turfs.map((t) => t.sport)))],
    [turfs]
  );

  const filtered = turfs.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase());
    const matchesSport = sport === "All" || t.sport === sport;
    return matchesSearch && matchesSport;
  });

  return (
    <div>
      <section className="mb-8 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 px-6 py-10 text-white sm:px-10">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Book your game, instantly.</h1>
        <p className="mt-2 max-w-xl text-brand-50">
          Find and reserve the best sports turfs near you — football, cricket and more.
        </p>
      </section>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="input sm:max-w-xs"
          placeholder="Search by name or location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {sports.map((s) => (
            <button
              key={s}
              onClick={() => setSport(s)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                sport === s
                  ? "bg-brand-600 text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-gray-500">Loading turfs…</p>}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-gray-500">No turfs match your search.</p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((turf) => (
          <TurfCard key={turf.id} turf={turf} />
        ))}
      </div>
    </div>
  );
}
