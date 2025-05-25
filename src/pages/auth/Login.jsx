// src/pages/auth/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/authAPI';
import useAuth from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user } = await loginUser(email, password);
      setUser(user);

      // Cek role user dan arahkan ke halaman sesuai role
      if (user.role === 'pengelola') {
        navigate('/pengelola/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-900">LOGIN</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 transition"
          >
            LOGIN
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-600">
          Belum punya akun?{' '}
          <a href="/register" className="text-blue-700 hover:underline">
            Daftar di sini
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
