// src/layouts/StaffLayout.jsx
import { Outlet } from "react-router-dom";
import StaffNavbar from "../components/StaffNavbar";

const StaffLayout = () => {
  return (
    <div>
      <StaffNavbar />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;
