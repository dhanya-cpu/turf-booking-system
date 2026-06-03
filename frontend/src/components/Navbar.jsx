import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive ? "text-brand-700" : "text-gray-600 hover:text-gray-900"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-brand-700">
          <span className="text-2xl">🏟️</span>
          TurfBook
        </Link>

        <div className="flex items-center gap-5">
          <NavLink to="/" className={linkClass} end>
            Turfs
          </NavLink>
          {user && (
            <NavLink to="/my-bookings" className={linkClass}>
              My Bookings
            </NavLink>
          )}
          {user?.is_admin && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-gray-500 sm:inline">Hi, {user.name}</span>
              <button onClick={handleLogout} className="btn-outline py-1.5">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-outline py-1.5">
                Login
              </Link>
              <Link to="/register" className="btn-primary py-1.5">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
