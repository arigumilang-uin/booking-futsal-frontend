// src/layouts/PengelolaLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const PengelolaLayout = () => {
  return (
    <div>
      <Navbar />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default PengelolaLayout;
