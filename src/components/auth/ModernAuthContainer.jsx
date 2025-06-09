// src/components/auth/ModernAuthContainer.jsx
// MODERN AUTH CONTAINER WITH CIRCULAR REVEAL ANIMATION
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ModernAuthContainer = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [isAnimating, setIsAnimating] = useState(false);
  const [circularReveal, setCircularReveal] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  const handleToggle = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    // Immediate navigation with smooth transition
    if (isLogin) {
      navigate('/register');
    } else {
      navigate('/login');
    }

    // Reset animation state
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(31, 41, 55, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(31, 41, 55, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Main Container */}
      <div ref={containerRef} className="relative w-full max-w-4xl h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Smooth Page Transition */}

        {/* Sliding Panel */}
        <div
          className={`absolute top-0 w-1/2 h-full transition-all duration-700 ease-in-out z-10 ${isLogin
            ? 'left-1/2 rounded-l-[100px]'
            : 'left-0 rounded-r-[100px]'
            }`}
          style={{
            background: `linear-gradient(135deg, #1F2937 0%, #1F2937 50%, #374151 100%)`
          }}
        >
          <div className="flex flex-col items-center justify-center h-full p-8 text-white">
            {/* Logo in Panel */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm bg-white/20">
              <span className="text-3xl">⚽</span>
            </div>
            <h1 className="text-xl font-bold mb-6" style={{ color: 'white !important' }}>Panam Soccer Field</h1>

            {/* Content */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'white !important' }}>
                {isLogin ? 'Selamat Datang Kembali!' : 'Bergabung dengan Kami!'}
              </h2>
              <p className="mb-8 leading-relaxed text-white" style={{ color: 'white !important' }}>
                {isLogin
                  ? 'Masuk ke akun Anda dan nikmati pengalaman booking lapangan soccer yang mudah dan cepat di Panam Soccer Field.'
                  : 'Daftar sekarang dan dapatkan akses ke sistem booking lapangan soccer terbaik di Panam.'
                }
              </p>

              {/* Smooth Toggle Button */}
              <button
                onClick={handleToggle}
                disabled={isAnimating}
                className="relative w-16 h-16 rounded-full font-semibold transition-all duration-300 hover:scale-110 disabled:opacity-50 shadow-lg bg-white hover:bg-gray-50"
                style={{ color: '#1F2937' }}
              >
                <span className="text-2xl">
                  {isLogin ? '→' : '←'}
                </span>
              </button>

              <p className="mt-4 text-sm text-white" style={{ color: 'white !important' }}>
                {isLogin ? 'Daftar Akun Baru' : 'Masuk ke Akun'}
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 w-32 h-32 rounded-full blur-xl bg-white/10"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full blur-xl bg-white/10"></div>
          </div>
        </div>

        {/* Form Container */}
        <div className={`absolute top-0 w-1/2 h-full transition-all duration-700 ease-in-out ${isLogin ? 'left-0' : 'left-1/2'
          } bg-white`}>
          <div className="flex flex-col justify-center h-full p-8">
            {/* Brand Header */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2 text-gray-900">
                {isLogin ? 'Masuk' : 'Daftar'}
              </h2>
              <p className="text-gray-600">
                {isLogin
                  ? 'Masuk ke akun Anda untuk melanjutkan'
                  : 'Buat akun baru untuk memulai'
                }
              </p>
            </div>

            {/* Form Content */}
            <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-gray-500 text-sm">
        <p>© 2025 Panam Soccer Field Pekanbaru. All rights reserved.</p>
      </div>


    </div>
  );
};

export default ModernAuthContainer;
