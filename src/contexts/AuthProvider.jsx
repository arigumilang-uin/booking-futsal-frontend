// === src/contexts/authProvider.jsx ===
import { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import { fetchProfile } from '../api/userAPI';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchProfile(); // hanya dipanggil kalau ada token
        setUser(data.user);
      } catch (err) {
        console.error('Error loading profile:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
