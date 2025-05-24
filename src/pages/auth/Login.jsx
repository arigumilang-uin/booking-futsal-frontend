// === src/pages/auth/Login.jsx ===
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
      const { user, token } = await loginUser(email, password);
      localStorage.setItem('token', token);
      setUser(user);
      navigate('/'); // arahkan ke halaman utama
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Masuk</h2>
      {error && <p>{error}</p>}
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;