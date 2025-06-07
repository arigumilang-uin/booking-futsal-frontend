// src/components/CustomerNavbar.jsx
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import NotificationBadge from "./NotificationBadge";

const CustomerNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <Link to="/" className="font-bold text-xl">Booking Futsal</Link>
        
        <Link to="/" className="hover:underline">Dashboard</Link>
        <Link to="/bookings" className="hover:underline">Booking Saya</Link>
        <Link to="/fields" className="hover:underline">Lapangan</Link>
        <Link to="/payments" className="hover:underline">Pembayaran</Link>
        <Link to="/profile" className="hover:underline">Profil</Link>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <NotificationBadge />
            <span>Halo, {user.name}</span>
            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default CustomerNavbar;
