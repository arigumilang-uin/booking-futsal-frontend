import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-blue-900 py-4">
        <h1 className="text-2xl font-bold text-white text-center uppercase">Booking Futsal</h1>
      </div>

      {/* Form Container */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">Login</h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 mb-4 rounded text-sm">{error}</div>
          )}

          {/* Test Users Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm">
            <p className="font-semibold text-blue-800 mb-2">Test Users:</p>
            <div className="space-y-1 text-blue-700">
              <p><strong>Customer:</strong> ari@gmail.com / password123</p>
              <p><strong>Kasir:</strong> kasir1@futsalapp.com / password123</p>
              <p><strong>Manager:</strong> manajer1@futsalapp.com / password123</p>
              <p><strong>Supervisor:</strong> pweb@futsalapp.com / password123</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-800 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-800 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white font-bold py-2 rounded-md hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'LOGIN'}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-blue-900">
            <a href="/register" className="hover:underline font-medium">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
