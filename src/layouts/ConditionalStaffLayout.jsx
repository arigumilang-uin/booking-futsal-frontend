// src/layouts/ConditionalStaffLayout.jsx
// CONDITIONAL LAYOUT - MINIMALIST DESIGN FOR ALL STAFF ROLES
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";

const ConditionalStaffLayout = () => {
  const { user } = useContext(AuthContext);

  // ALL STAFF ROLES GET NO LAYOUT (direct component rendering)
  // Each dashboard component has its own minimalist header
  // Supervisor: MinimalistSupervisorDashboard (with MinimalistSupervisorHeader)
  // Manager: MinimalistManagerDashboard (with MinimalistManagerHeader)
  // Kasir & Operator: Will use their own minimalist dashboards

  return (
    <div className="min-h-screen">
      {/* No navbar for any staff - they have their own minimalist headers */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default ConditionalStaffLayout;
