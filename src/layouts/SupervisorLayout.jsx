// src/layouts/SupervisorLayout.jsx
// MODERN LAYOUT KHUSUS UNTUK SUPERVISOR SISTEM
import { Outlet } from "react-router-dom";
import SupervisorNavbar from "../components/SupervisorNavbar";

const SupervisorLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      <SupervisorNavbar />
      <main className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
      
      {/* Add custom CSS for grid pattern */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default SupervisorLayout;
