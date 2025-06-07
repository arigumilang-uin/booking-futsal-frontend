// src/components/SupervisorHeader.jsx
// MODERN & MINIMALIST HEADER KHUSUS UNTUK SUPERVISOR
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import NotificationBadge from "./NotificationBadge";

const SupervisorHeader = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second instead of every minute
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white shadow-2xl border-b-4 border-purple-500">
      <div className="max-w-7xl mx-auto">
        {/* Main Header */}
        <div className="flex items-center justify-between px-8 py-6">
          {/* Left Side - Brand & Title */}
          <div className="flex items-center space-x-6">
            {/* Brand Icon */}
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl ring-2 ring-white/20">
              <span className="text-2xl font-bold">⚡</span>
            </div>
            
            {/* Title & Subtitle */}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-200 via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Futsal Control Center
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-sm text-purple-200 font-medium">System Administration</span>
                <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
                <span className="text-sm text-purple-300">
                  {currentTime.toLocaleDateString('id-ID', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - User Info & Actions */}
          <div className="flex items-center space-x-6">
            {/* System Status */}
            <div className="hidden md:flex items-center space-x-3 bg-green-500/20 px-4 py-2 rounded-xl backdrop-blur-sm border border-green-400/30">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
              <div>
                <span className="text-xs text-green-200 font-medium">System Status</span>
                <p className="text-xs text-green-100">All Systems Operational</p>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm hover:bg-white/20 transition-all duration-200">
              <NotificationBadge />
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-4 bg-white/10 hover:bg-white/20 rounded-xl px-5 py-3 transition-all duration-200 backdrop-blur-sm border border-white/20 shadow-lg"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
                  <span className="text-lg font-bold">👤</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{getGreeting()}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-purple-200 font-medium">{user?.name || "Supervisor"}</span>
                    <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
                    <span className="text-xs text-green-300 font-medium">Online</span>
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 transition-transform duration-200 text-purple-200 ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Enhanced User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 py-3 z-50 backdrop-blur-sm">
                  {/* User Info Header */}
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-lg font-bold text-white">👤</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-600">{user?.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-purple-600 font-medium bg-purple-100 px-2 py-1 rounded-full">
                            System Administrator
                          </span>
                          <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                            Online
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="py-3">
                    <button
                      onClick={() => {
                        // Refresh dashboard with loading indicator
                        const refreshBtn = document.querySelector('[data-refresh-btn]');
                        if (refreshBtn) {
                          refreshBtn.innerHTML = '🔄 Refreshing...';
                          refreshBtn.disabled = true;
                        }

                        setTimeout(() => {
                          window.location.reload();
                        }, 500);

                        setShowUserMenu(false);
                      }}
                      data-refresh-btn
                      className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center space-x-3 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span>🔄</span>
                      </div>
                      <div>
                        <p className="font-medium">Refresh Dashboard</p>
                        <p className="text-xs text-gray-500">Muat ulang data terbaru</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        // Show profile settings modal or navigate
                        alert('🚧 Fitur Pengaturan Profil sedang dalam pengembangan.\n\nFitur yang akan tersedia:\n• Edit informasi profil\n• Ubah password\n• Preferensi notifikasi\n• Theme settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-purple-50 flex items-center space-x-3 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span>⚙️</span>
                      </div>
                      <div>
                        <p className="font-medium">Pengaturan Profil</p>
                        <p className="text-xs text-gray-500">Kelola akun dan preferensi</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        // Show system settings info
                        alert('🔧 System Settings\n\nAkses melalui dashboard tabs:\n• System & Audit tab\n• Analytics tab\n• User Management tab\n\nSemua pengaturan sistem tersedia di dashboard utama.');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-indigo-50 flex items-center space-x-3 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span>🔧</span>
                      </div>
                      <div>
                        <p className="font-medium">System Settings</p>
                        <p className="text-xs text-gray-500">Konfigurasi sistem</p>
                      </div>
                    </button>
                  </div>
                  
                  {/* Logout Section */}
                  <div className="border-t border-gray-100 pt-3">
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-6 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <span>🚪</span>
                      </div>
                      <div>
                        <p className="font-medium">Logout</p>
                        <p className="text-xs text-red-500">Keluar dari sistem</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Time Display */}
        <div className="px-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-purple-200">
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                <span className="text-lg">🕐</span>
                <span className="text-sm font-bold">
                  {currentTime.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  })}
                </span>
              </div>
              <div className="w-1 h-1 bg-purple-300 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Supervisor'}
              </span>
            </div>

            <div className="text-xs text-purple-300 bg-white/5 px-2 py-1 rounded">
              Live • Updated {currentTime.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Border Gradient */}
      <div className="h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"></div>
    </header>
  );
};

export default SupervisorHeader;
