// === src/contexts/authProvider.jsx ===
import { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import { fetchProfile } from '../api/userAPI';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

// authProvider.jsx
useEffect(() => {
   if (window.location.pathname === '/login' || window.location.pathname === '/register') {
    setLoading(false);
    return;
  }
  
  const loadUser = async () => {
    try {
      const data = await fetchProfile(); // fetch menggunakan cookie HttpOnly
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
