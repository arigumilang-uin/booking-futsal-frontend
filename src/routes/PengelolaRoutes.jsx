// src/routes/PengelolaRoutes.jsx
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PengelolaRoutes = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user || user.role !== 'pengelola') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PengelolaRoutes;
