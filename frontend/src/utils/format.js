export function formatTime(t) {
  // t is "HH:MM:SS"
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function formatDate(d) {
  // d is "YYYY-MM-DD"
  const date = new Date(`${d}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatPrice(p) {
  return `₹${Number(p).toLocaleString()}`;
}
