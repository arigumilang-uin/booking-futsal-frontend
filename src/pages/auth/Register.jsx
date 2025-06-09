import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import ModernAuthContainer from '../../components/auth/ModernAuthContainer';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      setLoading(false);
      return;
    }

    try {
      const result = await register({ name, email, password, phone });

      if (result.success) {
        setSuccess('Registrasi berhasil! Anda akan diarahkan ke halaman login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error || 'Registrasi gagal');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Terjadi kesalahan saat registrasi');
    } finally {
      setLoading(false);
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

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-gray-200 text-green-800 p-4 mb-6 rounded-lg text-sm">
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Register Form - Clean & Organized for White Background */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Phone Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm"
              style={{ '--tw-ring-color': '#1F2937' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #1F2937'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
              placeholder="Nama lengkap"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Telepon
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm"
              style={{ '--tw-ring-color': '#1F2937' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #1F2937'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
              placeholder="081234567890"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm"
            style={{ '--tw-ring-color': '#1F2937' }}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #1F2937'}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
            placeholder="contoh@email.com"
          />
        </div>

        {/* Password Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm"
              style={{ '--tw-ring-color': '#1F2937' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #1F2937'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
              placeholder="Min. 6 karakter"
              minLength="6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm"
              style={{ '--tw-ring-color': '#1F2937' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #1F2937'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
              placeholder="Ulangi password"
            />
          </div>
        </div>

        {/* Password Requirements */}
        <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
          <p className="font-medium mb-1">Syarat Password:</p>
          <div className="flex space-x-4">
            <span>• Minimal 6 karakter</span>
            <span>• Kombinasi huruf & angka</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          style={{
            background: `linear-gradient(135deg, #1F2937 0%, #1F2937 100%)`,
            boxShadow: '0 4px 14px 0 rgba(31, 41, 55, 0.39)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = `linear-gradient(135deg, #1F2937 0%, #374151 100%)`;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = `linear-gradient(135deg, #1F2937 0%, #1F2937 100%)`;
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Mendaftar...</span>
            </div>
          ) : (
            'Daftar Akun Baru'
          )}
        </button>

        {/* Terms */}
        <div className="text-center text-xs text-gray-600">
          Dengan mendaftar, Anda menyetujui{' '}
          <a href="#" className="text-gray-900 hover:text-gray-500 font-medium underline underline-offset-2">
            Syarat & Ketentuan
          </a>{' '}
          dan{' '}
          <a href="#" className="text-gray-900 hover:text-gray-500 font-medium underline underline-offset-2">
            Kebijakan Privasi
          </a>
        </div>
      </form>
    </ModernAuthContainer>
  );
};

export default Register;
