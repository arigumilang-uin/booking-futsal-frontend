// === src/pages/auth/Register.jsx ===
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/authAPI';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(name, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registrasi gagal');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Daftar</h2>
      {error && <p>{error}</p>}
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;