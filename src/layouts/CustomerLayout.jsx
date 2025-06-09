// src/layouts/CustomerLayout.jsx
// MINIMALIST LAYOUT - Customer dashboard has its own header
import { Outlet } from "react-router-dom";

const CustomerLayout = () => {
  return (
    <div className="min-h-screen">
      {/* No navbar for customer - MinimalistCustomerDashboard has its own header */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
