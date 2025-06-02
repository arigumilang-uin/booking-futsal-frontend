// src/layouts/CustomerLayout.jsx
import { Outlet } from "react-router-dom";
import CustomerNavbar from "../components/CustomerNavbar";

const CustomerLayout = () => {
  return (
    <div>
      <CustomerNavbar />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
