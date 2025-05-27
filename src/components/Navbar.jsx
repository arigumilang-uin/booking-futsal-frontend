// src/components/Navbar.jsx
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";

const Navbar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <Link to="/" className="font-bold text-xl">Booking Futsal</Link>

        {user?.role === 'pengelola' && (
          <>
            <Link to="/pengelola" className="hover:underline">Dashboard</Link>
            <Link to="/pengelola/booking" className="hover:underline">Kelola Booking</Link>
            <Link to="/pengelola/field" className="hover:underline">Kelola Lapangan</Link>
            <Link to="/pengelola/payment" className="hover:underline">Kelola Pembayaran</Link>
            <Link to="/pengelola/user" className="hover:underline">Kelola Pengguna</Link>
          </>
        )}

        {/* Tambahkan navigasi user biasa jika ada */}
        {user?.role === 'user' && (
          <>
            <Link to="/user" className="hover:underline">Dashboard</Link>
            <Link to="/user/booking" className="hover:underline">Booking Saya</Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
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

export default Navbar;
