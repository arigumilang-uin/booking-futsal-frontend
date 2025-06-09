import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import ModernAuthContainer from '../../components/auth/ModernAuthContainer';
import { requestPasswordReset } from '../../api/authAPI';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login({ email, password });

      if (result.success) {
        // Redirect based on user role
        if (result.user.role === 'penyewa') {
          navigate('/');
        } else if (['staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem'].includes(result.user.role)) {
          navigate('/staff');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error || 'Login gagal');
      }
    } catch {
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordMessage('');

    try {
      const result = await requestPasswordReset(forgotPasswordEmail);
      if (result.success) {
        setForgotPasswordMessage('Link reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam.');
      } else {
        setForgotPasswordMessage(result.message || 'Gagal mengirim email reset password');
      }
    } catch (error) {
      setForgotPasswordMessage(error.response?.data?.message || 'Terjadi kesalahan saat mengirim email reset password');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <ModernAuthContainer>
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-lg text-sm">
          <div className="flex items-center space-x-2">
            <span>❌</span>
            <span>{error}</span>
          </div>
        </div>
      )}



      {/* Login Form */}
      {!showForgotPassword ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
              style={{ '--tw-ring-color': '#1F2937' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #1F2937'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
              placeholder="Masukkan email Anda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
              style={{ '--tw-ring-color': '#1F2937' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #1F2937'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
              placeholder="Masukkan password Anda"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm font-medium hover:opacity-80 transition-opacity duration-200"
              style={{ color: '#1F2937' }}
            >
              Lupa Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, #1F2937 0%, #374151 100%)`,
              boxShadow: '0 4px 14px 0 rgba(31, 41, 55, 0.39)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `linear-gradient(135deg, #374151 0%, #4B5563 100%)`;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = `linear-gradient(135deg, #1F2937 0%, #374151 100%)`;
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Masuk...</span>
              </div>
            ) : (
              'Masuk ke Akun'
            )}
          </button>
        </form>
      ) : (
        /* Forgot Password Form */
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lupa Password?</h3>
            <p className="text-gray-600 text-sm">
              Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
            </p>
          </div>

          {forgotPasswordMessage && (
            <div className="bg-blue-50 border border-gray-200 text-gray-800 p-4 rounded-lg text-sm">
              <div className="flex items-center space-x-2">
                <span>ℹ️</span>
                <span>{forgotPasswordMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200"
                placeholder="Masukkan email Anda"
              />
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={forgotPasswordLoading}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forgotPasswordLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mengirim...</span>
                  </div>
                ) : (
                  'Kirim Link Reset'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordMessage('');
                  setForgotPasswordEmail('');
                }}
                className="w-full text-gray-600 hover:text-gray-800 font-medium py-2"
              >
                Kembali ke Login
              </button>
            </div>
          </form>
        </div>
      )}
    </ModernAuthContainer>
  );
};

export default Login;
