// src/components/StaffNavbar.jsx
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import NotificationBadge from "./NotificationBadge";

const StaffNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get role-specific navigation
  const getRoleNavigation = (role) => {
    const baseNav = [
      { path: "/staff", label: "Dashboard" },
      { path: "/staff/bookings", label: "Kelola Booking" }
    ];

    switch (role) {
      case 'staff_kasir':
        return [
          ...baseNav,
          { path: "/staff/payments", label: "Kelola Pembayaran" }
        ];
      case 'operator_lapangan':
        return [
          ...baseNav,
          { path: "/staff/fields", label: "Kelola Lapangan" }
        ];
      case 'manajer_futsal':
        return [
          ...baseNav,
          { path: "/staff/fields", label: "Kelola Lapangan" },
          { path: "/staff/payments", label: "Kelola Pembayaran" },
          { path: "/staff/users", label: "Kelola Staff" }
        ];
      case 'supervisor_sistem':
        // SUPERVISOR GETS MINIMAL NAVIGATION - ALL FEATURES IN DASHBOARD
        return [
          { path: "/staff", label: "🎯 Supervisor Dashboard" }
        ];
      default:
        return baseNav;
    }
  };

  const navigation = getRoleNavigation(user?.role);

  return (
    <nav className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <Link to="/staff" className="font-bold text-xl">Booking Futsal - Staff</Link>
        
        {navigation.map((nav, index) => (
          <Link key={index} to={nav.path} className="hover:underline">
            {nav.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <NotificationBadge />
            <span>Halo, {user.name} ({user.role})</span>
            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default StaffNavbar;
