import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const UserDashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-2 text-blue-900">BOOKING FUTSAL</h1>
      <h2 className="text-xl mb-4">Halo, {user?.name || "User"}</h2>
      <h3 className="text-lg font-semibold mb-6">Dashboard Pengguna</h3>

      <div className="flex flex-col gap-3 max-w-xs">
        <button
          onClick={() => navigate("/bookings/new")}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-500"
        >
          Booking Lapangan
        </button>
        <button
          onClick={() => navigate("/bookings")}
          className="bg-blue-700 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Lihat Booking Saya
        </button>
        <button
          onClick={() => navigate("/fields")}
          className="bg-purple-700 text-white py-2 px-4 rounded hover:bg-purple-600"
        >
          Daftar Lapangan
        </button>
        <button
          onClick={() => navigate("/payments")}
          className="bg-indigo-700 text-white py-2 px-4 rounded hover:bg-indigo-600"
        >
          Pembayaran
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-500"
        >
          Profil Saya
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

export default UserDashboard;
