// === src/pages/pengelola/Dashboard.jsx ===
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const PengelolaDashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Kosongkan user dan redirect ke login
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-2 text-blue-900">BOOKING FUTSAL</h1>
      <h2 className="text-xl mb-4">Halo, {user?.name || "Pengelola"}</h2>
      <h3 className="text-lg font-semibold mb-6">Dashboard Pengelola</h3>

      <div className="flex flex-col gap-3 max-w-xs">
        <button
          onClick={() => navigate("/pengelola/booking")}
          className="bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Kelola Booking
        </button>
        <button
          onClick={() => navigate("/pengelola/field")}
          className="bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Kelola Lapangan
        </button>
        <button
          onClick={() => navigate("/pengelola/payment")}
          className="bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Kelola Pembayaran
        </button>
        <button
          onClick={() => navigate("/pengelola/user")}
          className="bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Kelola Pengguna
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-500 mt-4"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default PengelolaDashboard;
