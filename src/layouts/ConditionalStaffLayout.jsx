// src/layouts/ConditionalStaffLayout.jsx
// CONDITIONAL LAYOUT - DIFFERENT LAYOUT FOR SUPERVISOR VS OTHER STAFF
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import StaffNavbar from "../components/StaffNavbar";

const ConditionalStaffLayout = () => {
  const { user } = useContext(AuthContext);

  // Supervisor gets NO LAYOUT (direct component rendering)
  if (user?.role === 'supervisor_sistem') {
    return (
      <div className="min-h-screen">
        {/* No navbar for supervisor - they have their own header */}
        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  // Other staff roles get normal StaffLayout with navbar
  return (
    <div>
      <StaffNavbar />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default ConditionalStaffLayout;
